import type { CollectionConfig, PayloadRequest } from 'payload';

type RelationshipValue = string | number | { id?: string | number } | null | undefined;

const getRelationshipId = (value: RelationshipValue): string | number | undefined => {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (typeof value?.id === 'string' || typeof value?.id === 'number') {
    return value.id;
  }

  return undefined;
};

const getLanguageKey = async (
  req: PayloadRequest | undefined,
  id: string | number | undefined,
): Promise<string | undefined> => {
  if (!req?.payload || id === undefined) {
    return undefined;
  }

  try {
    const language = await req.payload.findByID({
      collection: 'languages',
      depth: 0,
      id,
    });

    return typeof language.key === 'string' ? language.key : undefined;
  } catch {
    return undefined;
  }
};

export const LanguagePairs: CollectionConfig = {
  slug: 'language_pairs',
  admin: { useAsTitle: 'pair_code' },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        const sourceId = getRelationshipId(data?.['source_language'] as RelationshipValue);
        const targetId = getRelationshipId(data?.['target_language'] as RelationshipValue);
        const [sourceKey, targetKey] = await Promise.all([
          getLanguageKey(req, sourceId),
          getLanguageKey(req, targetId),
        ]);

        if (sourceKey && targetKey) {
          return { ...data, pair_code: `${sourceKey}-${targetKey}` };
        }

        return data;
      },
    ],
  },
  fields: [
    { name: 'source_language', type: 'relationship', relationTo: 'languages', required: true },
    { name: 'target_language', type: 'relationship', relationTo: 'languages', required: true },
    { name: 'pair_code', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'pricing_tier', type: 'select', options: ['1', '2', '3'] },
  ],
};
