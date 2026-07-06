import type { Access, CollectionConfig } from 'payload';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isAdmin: Access = ({ req }) =>
  isRecord(req.user) && req.user['collection'] === 'users' && req.user['role'] === 'admin';

export const AuditEvents: CollectionConfig = {
  slug: 'audit_events',
  access: {
    create: () => false,
    read: isAdmin,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'event_type',
  },
  fields: [
    {
      name: 'event_type',
      type: 'select',
      required: true,
      options: ['create', 'update', 'delete'],
    },
    { name: 'collection_slug', type: 'text', required: true },
    { name: 'doc_id', type: 'text', required: true },
    { name: 'actor', type: 'text', required: true },
    { name: 'diff', type: 'json', required: true },
    { name: 'timestamp', type: 'date', required: true, defaultValue: () => new Date() },
  ],
};
