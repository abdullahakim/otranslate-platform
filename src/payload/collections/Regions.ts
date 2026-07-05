import type { CollectionConfig } from 'payload';

import { contentFields, localizedText } from './shared';

export const Regions: CollectionConfig = {
  slug: 'regions',
  admin: { useAsTitle: 'name' },
  fields: [
    ...contentFields(),
    localizedText('name'),
    { name: 'internal_only', type: 'checkbox', defaultValue: true },
    { name: 'countries', type: 'relationship', relationTo: 'countries', hasMany: true },
  ],
};
