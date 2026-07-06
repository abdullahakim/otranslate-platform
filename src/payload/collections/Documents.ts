import type { CollectionConfig } from 'payload';

import { contentFields, localizedTextarea, localizedText } from './shared';

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: { useAsTitle: 'name' },
  fields: [
    ...contentFields(),
    localizedText('name'),
    {
      name: 'category',
      type: 'select',
      options: ['civil', 'academic', 'legal', 'financial', 'commercial', 'medical'],
    },
    { name: 'typical_pages', type: 'number' },
    localizedTextarea('requirements'),
    { name: 'turnaround_hours', type: 'number' },
    { name: 'related_authorities', type: 'relationship', relationTo: 'authorities', hasMany: true },
    { name: 'related_use_cases', type: 'relationship', relationTo: 'use_cases', hasMany: true },
    { name: 'related_documents', type: 'relationship', relationTo: 'documents', hasMany: true },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
    { name: 'combo_flags', type: 'json' },
  ],
};
