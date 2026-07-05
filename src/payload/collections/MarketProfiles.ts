import type { CollectionConfig } from 'payload';

import { localizedRichText } from './shared';

export const MarketProfiles: CollectionConfig = {
  slug: 'market_profiles',
  admin: { useAsTitle: 'country' },
  fields: [
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'countries',
      unique: true,
      required: true,
    },
    localizedRichText('positioning'),
    { name: 'payment_methods', type: 'array', fields: [{ name: 'method', type: 'text' }] },
    { name: 'support_hours', type: 'text' },
  ],
};
