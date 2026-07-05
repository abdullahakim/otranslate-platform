import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Placeholders } from './collections/Placeholders';

const databaseUri = process.env['DATABASE_URI'];
const payloadSecret = process.env['PAYLOAD_SECRET'];

if (!databaseUri) {
  throw new Error('DATABASE_URI environment variable is required.');
}

if (!payloadSecret) {
  throw new Error('PAYLOAD_SECRET environment variable is required.');
}

export default buildConfig({
  admin: {
    user: Placeholders.slug,
  },
  collections: [Placeholders],
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
  }),
  editor: lexicalEditor(),
  secret: payloadSecret,
  sharp,
  typescript: {
    outputFile: 'src/payload/payload-types.ts',
  },
});
