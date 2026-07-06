import fs from 'node:fs/promises';
import path from 'node:path';

import { getPayload, type Payload } from 'payload';

import config from '../src/payload/payload.config';

type JsonRecord = Record<string, unknown>;
type ExportCollection =
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
  relations: Record<string, ExportCollection>;
};

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
} satisfies Record<ExportCollection, CollectionSpec>;

const exportOrder: ExportCollection[] = [
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
  'faqs',
  'redirects',
  'combos',
];

const idMaps = new Map<ExportCollection, Map<string | number, string>>();

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getId = (value: unknown): string | number | undefined => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (isRecord(value) && (typeof value['id'] === 'string' || typeof value['id'] === 'number')) {
    return value['id'];
  }
  return undefined;
};

const getKeyValue = (collection: ExportCollection, doc: JsonRecord): string => {
  if (collection === 'combos') {
    return `${String(doc['document'])}+${String(doc['authority'])}`;
  }
  return String(doc[collectionSpecs[collection].keyField]);
};

const findAll = async (payload: Payload, collection: ExportCollection): Promise<JsonRecord[]> => {
  const docs: JsonRecord[] = [];
  let page = 1;
  let hasNextPage = true;
  while (hasNextPage) {
    const result = await payload.find({ collection, depth: 0, limit: 100, page });
    docs.push(...(result.docs as unknown as JsonRecord[]));
    hasNextPage = Boolean(result.hasNextPage);
    page += 1;
  }
  return docs;
};

const stripSystemFields = (doc: JsonRecord): JsonRecord => {
  const stripped: JsonRecord = {};
  for (const [key, value] of Object.entries(doc)) {
    if (['id', 'createdAt', 'updatedAt', 'sizes', 'filename'].includes(key)) continue;
    stripped[key] = value;
  }
  return stripped;
};

const replaceRelations = (value: unknown, relations: Record<string, ExportCollection>): unknown => {
  if (Array.isArray(value)) return value.map((item) => replaceRelations(item, relations));
  if (!isRecord(value)) return value;
  const replaced: JsonRecord = {};
  for (const [field, fieldValue] of Object.entries(value)) {
    const relationCollection = relations[field];
    if (relationCollection) {
      if (Array.isArray(fieldValue)) {
        replaced[field] = (fieldValue as unknown[]).map((item: unknown): unknown => {
          const key = idMaps.get(relationCollection)?.get(getId(item) ?? '');
          return key ?? item;
        });
      } else {
        const key = idMaps.get(relationCollection)?.get(getId(fieldValue) ?? '');
        replaced[field] = key ?? fieldValue;
      }
    } else {
      replaced[field] = replaceRelations(fieldValue, relations);
    }
  }
  return replaced;
};

const sortDocs = (collection: ExportCollection, docs: JsonRecord[]): JsonRecord[] =>
  [...docs].sort((left: JsonRecord, right: JsonRecord) =>
    getKeyValue(collection, left).localeCompare(getKeyValue(collection, right), 'en'),
  );

const writeJson = async (file: string, value: unknown): Promise<void> => {
  await fs.writeFile(path.join(seedDir, file), `${JSON.stringify(value, null, 2)}\n`);
};

const runExport = async (): Promise<void> => {
  const payload = await getPayload({ config });
  try {
    await fs.mkdir(seedDir, { recursive: true });
    const allDocs = new Map<ExportCollection, JsonRecord[]>();

    for (const collection of exportOrder) {
      const docs = await findAll(payload, collection);
      allDocs.set(collection, docs);
      const map = new Map<string | number, string>();
      for (const doc of docs) {
        const id = getId(doc['id']);
        if (id !== undefined && collection !== 'combos') map.set(id, getKeyValue(collection, doc));
      }
      idMaps.set(collection, map);
    }

    for (const collection of exportOrder) {
      const docs = allDocs.get(collection) ?? [];
      const exported = sortDocs(
        collection,
        docs.map(
          (doc) =>
            replaceRelations(
              stripSystemFields(doc),
              collectionSpecs[collection].relations,
            ) as JsonRecord,
        ),
      );
      await writeJson(collectionSpecs[collection].file, exported);
      console.log(`[export] ${collection}: ${exported.length}`);
    }

    const settings = await payload.findGlobal({ slug: 'settings', depth: 0 });
    await writeJson('settings.json', stripSystemFields(settings as unknown as JsonRecord));
    console.log('[export] settings: 1');
  } finally {
    await payload.destroy();
  }
};

void runExport().catch((error: unknown) => {
  console.error('[export] fatal:', error);
  process.exit(1);
});
