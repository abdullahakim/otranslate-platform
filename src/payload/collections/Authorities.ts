import type { CollectionConfig } from 'payload';

import {
  contentFields,
  localizedRichText,
  localizedTextarea,
  localizedText,
  sourceReferencesField,
} from './shared';

export const Authorities: CollectionConfig = {
  slug: 'authorities',
  admin: { useAsTitle: 'name' },
  fields: [
    ...contentFields(),
    {
      name: 'type',
      type: 'select',
      required: true,
      options: ['embassy', 'immigration-authority', 'evaluator', 'university', 'court', 'ministry'],
    },
    localizedText('name'),
    { name: 'country', type: 'relationship', relationTo: 'countries' },
    { name: 'languages', type: 'relationship', relationTo: 'languages', hasMany: true },
    localizedRichText('requirement_summary'),
    { name: 'required_language', type: 'relationship', relationTo: 'languages' },
    localizedTextarea('certification_rule'),
    { name: 'legalization_required', type: 'checkbox' },
    { name: 'last_verified', type: 'date', required: true },
    sourceReferencesField,
    { name: 'top_documents', type: 'relationship', relationTo: 'documents', hasMany: true },
    { name: 'related_use_cases', type: 'relationship', relationTo: 'use_cases', hasMany: true },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
  ],
};
