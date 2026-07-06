import type { Field } from 'payload';

export const localizedText = (name: string, required = true): Field => ({
  name,
  type: 'text',
  localized: true,
  required,
});

export const localizedTextarea = (name: string, required = false): Field => ({
  name,
  type: 'textarea',
  localized: true,
  required,
});

export const localizedRichText = (name: string, required = false): Field => ({
  name,
  type: 'richText',
  localized: true,
  required,
});

export const keyField: Field = {
  name: 'key',
  type: 'text',
  unique: true,
  required: true,
  admin: {
    description: 'Stable kebab-case identifier.',
  },
};

export const statusField: Field = {
  name: 'status',
  type: 'select',
  defaultValue: 'draft',
  options: ['draft', 'published'],
};

export const tierField: Field = {
  name: 'tier',
  type: 'select',
  options: ['0', '1', '2'],
};

export const slugGroup: Field = {
  name: 'slug',
  type: 'group',
  fields: [
    { name: 'ar', type: 'text', unique: true, required: true },
    { name: 'en', type: 'text', unique: true, required: true },
  ],
};

export const metaGroup: Field = {
  name: 'meta',
  type: 'group',
  fields: [localizedText('title', false), localizedTextarea('description')],
};

export const contentFields = (): Field[] => [
  keyField,
  statusField,
  tierField,
  slugGroup,
  metaGroup,
];

export const sourceReferencesField: Field = {
  name: 'source_references',
  type: 'array',
  minRows: 1,
  required: true,
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'url', type: 'text', required: true },
  ],
};
