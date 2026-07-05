import type { CollectionConfig } from 'payload';

export const Placeholders: CollectionConfig = {
  slug: 'placeholders',
  auth: true,
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
};
