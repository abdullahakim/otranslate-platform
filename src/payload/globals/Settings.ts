import type { GlobalConfig } from 'payload';

export const Settings: GlobalConfig = {
  slug: 'settings',
  fields: [
    { name: 'gtm_id', type: 'text' },
    { name: 'ga4_id', type: 'text' },
    { name: 'whatsapp_number', type: 'text' },
    { name: 'whatsapp_link_pattern', type: 'text' },
    {
      name: 'google_rating',
      type: 'group',
      fields: [
        { name: 'value', type: 'number' },
        { name: 'count', type: 'number' },
      ],
    },
    {
      name: 'delivery',
      type: 'group',
      fields: [
        { name: 'note_ar', type: 'textarea' },
        { name: 'cairo_same_day', type: 'checkbox' },
      ],
    },
    { name: 'page_word_unit', type: 'number', defaultValue: 250 },
  ],
};
