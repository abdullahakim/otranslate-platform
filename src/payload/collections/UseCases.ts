import type { CollectionConfig } from 'payload';

import { contentFields, localizedText } from './shared';

export const UseCases: CollectionConfig = {
  slug: 'use_cases',
  admin: { useAsTitle: 'name' },
  fields: [
    ...contentFields(),
    localizedText('name'),
    { name: 'required_documents', type: 'relationship', relationTo: 'documents', hasMany: true },
    { name: 'related_authorities', type: 'relationship', relationTo: 'authorities', hasMany: true },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
  ],
};
