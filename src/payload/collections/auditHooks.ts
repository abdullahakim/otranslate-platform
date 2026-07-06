import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload';

const AUDIT_COLLECTION_SLUG = 'audit_events' as const;
const REDACTED_FIELD_PATTERN = /(password|salt|hash)/i;

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);

const toJsonValue = (value: unknown): JsonValue => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toJsonValue);
  }

  if (isRecord(value)) {
    return sanitizeRecord(value);
  }

  return null;
};

const sanitizeRecord = (record: RecordValue): { [key: string]: JsonValue } => {
  const sanitized: { [key: string]: JsonValue } = {};

  for (const [key, value] of Object.entries(record)) {
    if (REDACTED_FIELD_PATTERN.test(key)) {
      continue;
    }

    sanitized[key] = toJsonValue(value);
  }

  return sanitized;
};

const stableStringify = (value: JsonValue): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key] ?? null)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
};

const changedFields = (
  previousDoc: RecordValue,
  doc: RecordValue,
): { [key: string]: JsonValue } => {
  const previous = sanitizeRecord(previousDoc);
  const current = sanitizeRecord(doc);
  const diff: { [key: string]: JsonValue } = {};

  for (const key of new Set([...Object.keys(previous), ...Object.keys(current)])) {
    if (stableStringify(previous[key] ?? null) !== stableStringify(current[key] ?? null)) {
      diff[key] = current[key] ?? null;
    }
  }

  return diff;
};

const getActor = (user: unknown): string => {
  if (!isRecord(user)) {
    return 'system';
  }

  const email = user['email'];
  if (typeof email === 'string' && email.length > 0) {
    return email;
  }

  const id = user['id'];
  if (typeof id === 'string' || typeof id === 'number') {
    return String(id);
  }

  return 'system';
};

const getDocId = (doc: RecordValue): string => {
  const id = doc['id'];
  return typeof id === 'string' || typeof id === 'number' ? String(id) : 'unknown';
};

const logAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (collection.slug === AUDIT_COLLECTION_SLUG || !isRecord(doc)) {
    return;
  }

  const diff =
    operation === 'update' && isRecord(previousDoc)
      ? changedFields(previousDoc, doc)
      : sanitizeRecord(doc);

  await req.payload.create({
    collection: AUDIT_COLLECTION_SLUG,
    data: {
      event_type: operation === 'update' ? 'update' : 'create',
      collection_slug: collection.slug,
      doc_id: getDocId(doc),
      actor: getActor(req.user),
      diff,
    },
    draft: false,
    overrideAccess: true,
    req,
  });
};

const logAfterDelete: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  if (collection.slug === AUDIT_COLLECTION_SLUG || !isRecord(doc)) {
    return;
  }

  await req.payload.create({
    collection: AUDIT_COLLECTION_SLUG,
    data: {
      event_type: 'delete',
      collection_slug: collection.slug,
      doc_id: getDocId(doc),
      actor: getActor(req.user),
      diff: sanitizeRecord(doc),
    },
    draft: false,
    overrideAccess: true,
    req,
  });
};

export const withAuditHooks = (collections: CollectionConfig[]): CollectionConfig[] =>
  collections.map((collection) => {
    if (collection.slug === AUDIT_COLLECTION_SLUG) {
      return collection;
    }

    return {
      ...collection,
      hooks: {
        ...collection.hooks,
        afterChange: [...(collection.hooks?.afterChange ?? []), logAfterChange],
        afterDelete: [...(collection.hooks?.afterDelete ?? []), logAfterDelete],
      },
    };
  });
