import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES = ['ar', 'en'] as const;
const CONTENT_COLLECTIONS = new Set([
  'administrative_areas',
  'authorities',
  'countries',
  'documents',
  'languages',
  'regions',
  'services',
  'use_cases',
]);
const TOP_LEVEL_COLLECTIONS = new Set(['services']);
const RELATIONS: Record<string, Record<string, string>> = {
  administrative_areas: {},
  authorities: {
    country: 'countries',
    languages: 'languages',
    required_language: 'languages',
    top_documents: 'documents',
    related_use_cases: 'use_cases',
    faqs: 'faqs',
  },
  combos: { document: 'documents', authority: 'authorities' },
  countries: { price_book: 'price_books' },
  documents: {
    related_authorities: 'authorities',
    related_use_cases: 'use_cases',
    related_documents: 'documents',
    faqs: 'faqs',
  },
  languages: { related_authorities: 'authorities', top_documents: 'documents', faqs: 'faqs' },
  language_pairs: { source_language: 'languages', target_language: 'languages' },
  market_profiles: { country: 'countries' },
  price_books: { base_pair: 'language_pairs' },
  regions: { countries: 'countries' },
  services: { related_services: 'services', faqs: 'faqs' },
  use_cases: { required_documents: 'documents', related_authorities: 'authorities', faqs: 'faqs' },
  jurisdiction_profiles: { country: 'countries', top_authorities: 'authorities' },
};

type RecordValue = Record<string, unknown>;
type Corpus = Record<string, RecordValue[]>;

export type ValidationIssue = { code: string; record: string; message: string };

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
const idOf = (record: RecordValue): string | undefined =>
  typeof record['key'] === 'string'
    ? record['key']
    : typeof record['pair_code'] === 'string'
      ? record['pair_code']
      : typeof record['from_path'] === 'string'
        ? record['from_path']
        : undefined;
const relationId = (value: unknown): string | undefined =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : isRecord(value) && (typeof value['id'] === 'string' || typeof value['id'] === 'number')
      ? String(value['id'])
      : undefined;
const localized = (value: unknown, locale: (typeof LOCALES)[number]): string => {
  if (typeof value === 'string') return value.trim();
  if (isRecord(value) && typeof value[locale] === 'string') return value[locale].trim();
  return '';
};
const label = (collection: string, record: RecordValue): string =>
  `${collection}:${idOf(record) ?? '(unknown)'}`;

export const loadSeedCorpus = (seedDir = join(process.cwd(), 'seed')): Corpus =>
  Object.fromEntries(
    readdirSync(seedDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => [
        file.replace(/\.json$/, ''),
        JSON.parse(readFileSync(join(seedDir, file), 'utf8')),
      ]),
  );

export const validateContent = (corpus: Corpus): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const ids = new Map<string, Set<string>>();
  const inbound = new Map<string, number>();

  for (const [collection, value] of Object.entries(corpus)) {
    const records = Array.isArray(value) ? value : [];
    ids.set(collection, new Set(records.map(idOf).filter((id): id is string => Boolean(id))));
    for (const record of records) inbound.set(label(collection, record), 0);
  }

  for (const [collection, fields] of Object.entries(RELATIONS)) {
    for (const record of Array.isArray(corpus[collection]) ? corpus[collection] : []) {
      for (const [field, target] of Object.entries(fields)) {
        for (const value of asArray(record[field])) {
          const id = relationId(value);
          if (!id) continue;
          if (!ids.get(target)?.has(id)) {
            issues.push({
              code: 'broken-relation',
              record: label(collection, record),
              message: `${field} references missing ${target}:${id}`,
            });
          } else {
            inbound.set(`${target}:${id}`, (inbound.get(`${target}:${id}`) ?? 0) + 1);
          }
        }
      }
    }
  }

  for (const [collection, value] of Object.entries(corpus)) {
    const records = Array.isArray(value) ? value : [];
    for (const record of records) {
      if (record['status'] !== 'published') continue;
      if (CONTENT_COLLECTIONS.has(collection)) {
        const meta = isRecord(record['meta']) ? record['meta'] : {};
        for (const locale of LOCALES) {
          const slug = isRecord(record['slug']) ? record['slug'][locale] : undefined;
          if (typeof slug !== 'string' || slug.trim() === '')
            issues.push({
              code: 'missing-hreflang-target',
              record: label(collection, record),
              message: `missing ${locale} slug twin`,
            });
          if (!localized(meta['title'], locale) || !localized(meta['description'], locale))
            issues.push({
              code: 'missing-meta',
              record: label(collection, record),
              message: `missing ${locale} meta title or description`,
            });
        }
        if (
          !TOP_LEVEL_COLLECTIONS.has(collection) &&
          (inbound.get(label(collection, record)) ?? 0) === 0
        )
          issues.push({
            code: 'orphan-published-page',
            record: label(collection, record),
            message: 'published page has zero inbound corpus links',
          });
      }
      const cta = record['whatsapp_cta'];
      if (isRecord(cta) && cta['enabled'] === true && typeof cta['src'] !== 'string')
        issues.push({
          code: 'missing-whatsapp-src',
          record: label(collection, record),
          message: 'WhatsApp CTA is enabled without src',
        });
    }
  }

  const redirects = new Map(
    (Array.isArray(corpus['redirects']) ? corpus['redirects'] : [])
      .map((r) => [r['from_path'], r['to_path']])
      .filter(([from, to]) => typeof from === 'string' && typeof to === 'string') as [
      string,
      string,
    ][],
  );
  for (const start of redirects.keys()) {
    const seen = new Set<string>();
    let current: string | undefined = start;
    while (current && redirects.has(current)) {
      if (seen.has(current)) {
        issues.push({
          code: 'redirect-loop',
          record: `redirects:${start}`,
          message: `redirect cycle includes ${current}`,
        });
        break;
      }
      seen.add(current);
      current = redirects.get(current);
    }
  }

  return issues;
};

if (process.argv[1]?.endsWith('validate-content.ts')) {
  const issues = validateContent(loadSeedCorpus());
  for (const issue of issues) console.error(`[${issue.code}] ${issue.record}: ${issue.message}`);
  process.exit(issues.length === 0 ? 0 : 1);
}
