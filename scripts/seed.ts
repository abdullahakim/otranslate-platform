import fs from 'node:fs/promises';
import path from 'node:path';

import { getPayload, type Payload, type Where } from 'payload';

import config from '../src/payload/payload.config';

type JsonRecord = Record<string, unknown>;
type SeedCollection =
  | 'languages'
  | 'language_pairs'
  | 'price_books'
  | 'countries'
  | 'services'
  | 'documents'
  | 'authorities'
  | 'use_cases'
  | 'regions'
  | 'market_profiles'
  | 'jurisdiction_profiles'
  | 'administrative_areas'
  | 'faqs'
  | 'redirects'
  | 'combos';

type CollectionSpec = {
  file: string;
  keyField: string;
  relations: Record<string, SeedCollection>;
};

type Summary = { created: number; failed: number; updated: number };

const seedDir = path.join(process.cwd(), 'seed');

const collectionSpecs = {
  languages: { file: 'languages.json', keyField: 'key', relations: { faqs: 'faqs' } },
  language_pairs: {
    file: 'language_pairs.json',
    keyField: 'pair_code',
    relations: { source_language: 'languages', target_language: 'languages' },
  },
  price_books: {
    file: 'price_books.json',
    keyField: 'key',
    relations: { base_pair: 'language_pairs', pair: 'language_pairs' },
  },
  countries: { file: 'countries.json', keyField: 'key', relations: { price_book: 'price_books' } },
  services: { file: 'services.json', keyField: 'key', relations: { faqs: 'faqs' } },
  documents: {
    file: 'documents.json',
    keyField: 'key',
    relations: { related_authorities: 'authorities', faqs: 'faqs' },
  },
  authorities: {
    file: 'authorities.json',
    keyField: 'key',
    relations: {
      country: 'countries',
      languages: 'languages',
      required_language: 'languages',
      top_documents: 'documents',
      faqs: 'faqs',
    },
  },
  use_cases: {
    file: 'use_cases.json',
    keyField: 'key',
    relations: {
      required_documents: 'documents',
      related_authorities: 'authorities',
      faqs: 'faqs',
    },
  },
  regions: { file: 'regions.json', keyField: 'key', relations: { countries: 'countries' } },
  market_profiles: {
    file: 'market_profiles.json',
    keyField: 'country',
    relations: { country: 'countries' },
  },
  jurisdiction_profiles: {
    file: 'jurisdiction_profiles.json',
    keyField: 'country',
    relations: { country: 'countries', top_authorities: 'authorities' },
  },
  administrative_areas: {
    file: 'administrative_areas.json',
    keyField: 'key',
    relations: {},
  },
  faqs: { file: 'faqs.json', keyField: 'key', relations: {} },
  redirects: { file: 'redirects.json', keyField: 'from_path', relations: {} },
  combos: {
    file: 'combos.json',
    keyField: 'document+authority',
    relations: { document: 'documents', authority: 'authorities' },
  },
} satisfies Record<SeedCollection, CollectionSpec>;

const importOrder: SeedCollection[] = [
  'faqs',
  'languages',
  'language_pairs',
  'price_books',
  'countries',
  'services',
  'documents',
  'authorities',
  'use_cases',
  'regions',
  'market_profiles',
  'jurisdiction_profiles',
  'administrative_areas',
  'redirects',
  'combos',
];

const idMaps = new Map<SeedCollection, Map<string, string | number>>();

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readJson = async (file: string): Promise<unknown> => {
  const text = await fs.readFile(path.join(seedDir, file), 'utf8');
  return JSON.parse(text) as unknown;
};

const getString = (record: JsonRecord, key: string): string => {
  const value = record[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Expected non-empty string field "${key}".`);
  }
  return value;
};

const collectionKey = (collection: SeedCollection, record: JsonRecord): string => {
  if (collection === 'combos') {
    return `${getString(record, 'document')}+${getString(record, 'authority')}`;
  }
  return getString(record, collectionSpecs[collection].keyField);
};

const findExisting = async (
  payload: Payload,
  collection: SeedCollection,
  record: JsonRecord,
): Promise<{ id: number | string } | undefined> => {
  const spec = collectionSpecs[collection];
  const where: Where =
    collection === 'combos'
      ? {
          and: [
            { document: { equals: record['document'] } },
            { authority: { equals: record['authority'] } },
          ],
        }
      : { [spec.keyField]: { equals: record[spec.keyField] } };
  const result = await payload.find({ collection, depth: 0, limit: 1, where });
  const doc = result.docs[0];
  return doc ? { id: doc.id } : undefined;
};

const resolveRelations = (value: unknown, relations: Record<string, SeedCollection>): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => resolveRelations(item, relations));
  }
  if (!isRecord(value)) {
    return value;
  }
  const resolved: JsonRecord = {};
  for (const [field, fieldValue] of Object.entries(value)) {
    const relationCollection = relations[field];
    if (relationCollection && typeof fieldValue === 'string') {
      const id = idMaps.get(relationCollection)?.get(fieldValue);
      if (id === undefined) {
        throw new Error(`Missing ${relationCollection} relation with key "${fieldValue}".`);
      }
      resolved[field] = id;
    } else if (relationCollection && Array.isArray(fieldValue)) {
      resolved[field] = fieldValue.map((item) => {
        if (typeof item !== 'string') {
          throw new Error(`Expected string keys in ${field} relation array.`);
        }
        const id = idMaps.get(relationCollection)?.get(item);
        if (id === undefined) {
          throw new Error(`Missing ${relationCollection} relation with key "${item}".`);
        }
        return id;
      });
    } else {
      resolved[field] = resolveRelations(fieldValue, relations);
    }
  }
  return resolved;
};

const upsertCollection = async (payload: Payload, collection: SeedCollection): Promise<Summary> => {
  const raw = await readJson(collectionSpecs[collection].file);
  if (!Array.isArray(raw)) {
    throw new Error(`${collectionSpecs[collection].file} must contain an array.`);
  }

  const summary: Summary = { created: 0, failed: 0, updated: 0 };
  const map = idMaps.get(collection) ?? new Map<string, string | number>();
  idMaps.set(collection, map);

  for (const item of raw) {
    try {
      if (!isRecord(item)) {
        throw new Error('Seed item must be an object.');
      }
      const key = collectionKey(collection, item);
      const data = resolveRelations(item, collectionSpecs[collection].relations) as JsonRecord;
      const existing = await findExisting(payload, collection, data);
      const doc = existing
        ? await payload.update({ collection, data: data, depth: 0, id: existing.id })
        : await payload.create({ collection, data: data as never, depth: 0 });
      map.set(key, doc.id);
      summary[existing ? 'updated' : 'created'] += 1;
    } catch (error) {
      summary.failed += 1;
      console.error(`[seed] ${collection} failed:`, error);
    }
  }
  return summary;
};

const primeIdMap = async (payload: Payload, collection: SeedCollection): Promise<void> => {
  const raw = await readJson(collectionSpecs[collection].file);
  if (!Array.isArray(raw)) return;
  const map = idMaps.get(collection) ?? new Map<string, string | number>();
  idMaps.set(collection, map);
  for (const item of raw) {
    if (!isRecord(item) || collection === 'combos') continue;
    const key = collectionKey(collection, item);
    const existing = await findExisting(payload, collection, item);
    if (existing) map.set(key, existing.id);
  }
};

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config });
  let hasFailures = false;
  try {
    for (const collection of importOrder) {
      await primeIdMap(payload, collection);
    }
    for (const collection of importOrder) {
      const summary = await upsertCollection(payload, collection);
      console.log(
        `[seed] ${collection}: created=${summary.created} updated=${summary.updated} failed=${summary.failed}`,
      );
      hasFailures = hasFailures || summary.failed > 0;
    }

    const settings = await readJson('settings.json');
    if (!isRecord(settings)) {
      throw new Error('settings.json must contain an object.');
    }
    await payload.updateGlobal({ slug: 'settings', data: settings, depth: 0 });
    console.log('[seed] settings: created=0 updated=1 failed=0');
  } finally {
    await payload.destroy();
  }
  if (hasFailures) process.exit(1);
};

void seed().catch((error: unknown) => {
  console.error('[seed] fatal:', error);
  process.exit(1);
});
