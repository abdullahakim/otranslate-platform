import type { CollectionConfig } from 'payload';

type RelationshipValue = string | { id?: string | number } | null | undefined;

const getRelationshipId = (value: RelationshipValue): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value?.id === 'string' || typeof value?.id === 'number') {
    return String(value.id);
  }

  return undefined;
};

export const LanguagePairs: CollectionConfig = {
  slug: 'language_pairs',
  admin: { useAsTitle: 'pair_code' },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const source = getRelationshipId(data?.['source_language'] as RelationshipValue);
        const target = getRelationshipId(data?.['target_language'] as RelationshipValue);

        if (source && target) {
          return { ...data, pair_code: `${source}-${target}` };
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
