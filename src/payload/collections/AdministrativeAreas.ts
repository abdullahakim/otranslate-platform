import type { CollectionConfig } from 'payload';

import { contentFields, localizedTextarea, localizedText } from './shared';

export const AdministrativeAreas: CollectionConfig = {
  slug: 'administrative_areas',
  admin: { useAsTitle: 'name' },
  fields: [
    ...contentFields(),
    localizedText('name'),
    { name: 'delivery_days', type: 'text' },
    localizedTextarea('courier_note'),
  ],
};
