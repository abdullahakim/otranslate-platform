import type { CollectionConfig } from 'payload';

import { localizedRichText } from './shared';

export const Combos: CollectionConfig = {
  slug: 'combos',
  admin: { useAsTitle: 'id' },
  fields: [
    { name: 'document', type: 'relationship', relationTo: 'documents', required: true },
    { name: 'authority', type: 'relationship', relationTo: 'authorities', required: true },
    { name: 'status', type: 'select', defaultValue: 'draft', options: ['draft', 'published'] },
    localizedRichText('unique_intro'),
  ],
};
