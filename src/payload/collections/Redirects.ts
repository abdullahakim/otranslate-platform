import type { CollectionConfig } from 'payload';

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: { useAsTitle: 'from_path' },
  fields: [
    { name: 'from_path', type: 'text', unique: true, required: true },
    { name: 'to_path', type: 'text', required: true },
  ],
};
