import type { CollectionConfig } from 'payload';

import { contentFields, localizedTextarea, localizedText } from './shared';

export const Countries: CollectionConfig = {
  slug: 'countries',
  admin: { useAsTitle: 'name' },
  fields: [
    ...contentFields(),
    localizedText('name'),
    { name: 'currency', type: 'text' },
    { name: 'timezone', type: 'text' },
    { name: 'price_book', type: 'relationship', relationTo: 'price_books' },
    localizedTextarea('legal_notes'),
  ],
};
