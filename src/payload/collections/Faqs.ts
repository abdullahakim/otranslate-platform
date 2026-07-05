import type { CollectionConfig } from 'payload';

import { localizedRichText, localizedText } from './shared';

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: { useAsTitle: 'question' },
  fields: [
    { name: 'key', type: 'text', unique: true, required: true },
    localizedText('question'),
    localizedRichText('answer', true),
    { name: 'topics', type: 'array', fields: [{ name: 'topic', type: 'text' }] },
  ],
};
