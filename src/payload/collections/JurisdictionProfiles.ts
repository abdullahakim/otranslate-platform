import type { CollectionConfig } from 'payload';

import { localizedRichText, localizedTextarea, sourceReferencesField } from './shared';

export const JurisdictionProfiles: CollectionConfig = {
  slug: 'jurisdiction_profiles',
  admin: { useAsTitle: 'country' },
  fields: [
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'countries',
      unique: true,
      required: true,
    },
    localizedRichText('requirement_summary'),
    localizedTextarea('certification_rule'),
    { name: 'last_verified', type: 'date', required: true },
    sourceReferencesField,
    { name: 'top_authorities', type: 'relationship', relationTo: 'authorities', hasMany: true },
  ],
};
