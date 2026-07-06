import type { CollectionConfig } from 'payload';

import { contentFields, localizedText } from './shared';

export const Languages: CollectionConfig = {
  slug: 'languages',
  admin: { useAsTitle: 'name' },
  fields: [
    ...contentFields(),
    localizedText('name'),
    { name: 'related_authorities', type: 'relationship', relationTo: 'authorities', hasMany: true },
    { name: 'top_documents', type: 'relationship', relationTo: 'documents', hasMany: true },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
  ],
};
