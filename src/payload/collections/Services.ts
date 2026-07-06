import type { CollectionConfig } from 'payload';

import { contentFields, localizedRichText, localizedText } from './shared';

export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'name' },
  fields: [
    ...contentFields(),
    localizedText('name'),
    localizedText('summary'),
    {
      name: 'body_sections',
      type: 'array',
      fields: [localizedText('heading'), localizedRichText('body', true)],
    },
    { name: 'includes', type: 'array', fields: [{ name: 'item', type: 'text', required: true }] },
    { name: 'related_services', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
  ],
};
