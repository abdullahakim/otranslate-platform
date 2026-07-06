import type { CollectionConfig } from 'payload';

export const PriceBooks: CollectionConfig = {
  slug: 'price_books',
  admin: { useAsTitle: 'key' },
  fields: [
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      options: ['b2c-egypt-egp', 'b2c-gcc', 'b2c-tier1-usd'],
    },
    { name: 'currency', type: 'select', options: ['EGP', 'AED', 'SAR', 'USD'] },
    { name: 'base_pair', type: 'relationship', relationTo: 'language_pairs' },
    { name: 'per_page', type: 'number' },
    { name: 'minimum_charge', type: 'number' },
    { name: 'rush_per_page', type: 'number' },
    { name: 'rush_promise_hours', type: 'number', defaultValue: 24 },
    { name: 'unit_words_per_page', type: 'number', defaultValue: 250 },
    {
      name: 'pair_overrides',
      type: 'array',
      fields: [
        { name: 'pair', type: 'relationship', relationTo: 'language_pairs' },
        { name: 'per_page', type: 'number' },
        { name: 'rush_per_page', type: 'number' },
      ],
    },
    {
      name: 'addons',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'note', type: 'text' },
      ],
    },
    { name: 'b2b_note', type: 'text' },
  ],
};
