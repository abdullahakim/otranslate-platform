import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { AdministrativeAreas } from './collections/AdministrativeAreas';
import { AuditEvents } from './collections/AuditEvents';
import { Authorities } from './collections/Authorities';
import { Combos } from './collections/Combos';
import { Countries } from './collections/Countries';
import { Documents } from './collections/Documents';
import { Faqs } from './collections/Faqs';
import { JurisdictionProfiles } from './collections/JurisdictionProfiles';
import { LanguagePairs } from './collections/LanguagePairs';
import { Languages } from './collections/Languages';
import { MarketProfiles } from './collections/MarketProfiles';
import { PriceBooks } from './collections/PriceBooks';
import { Redirects } from './collections/Redirects';
import { Regions } from './collections/Regions';
import { Services } from './collections/Services';
import { UseCases } from './collections/UseCases';
import { Users } from './collections/Users';
import { withAuditHooks } from './collections/auditHooks';
import { Settings } from './globals/Settings';

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
    user: Users.slug,
  },
  collections: withAuditHooks([
    Users,
    Services,
    Documents,
    Authorities,
    Languages,
    LanguagePairs,
    PriceBooks,
    UseCases,
    Regions,
    Countries,
    MarketProfiles,
    JurisdictionProfiles,
    AdministrativeAreas,
    Faqs,
    Combos,
    Redirects,
    AuditEvents,
  ]),
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
  }),
  editor: lexicalEditor(),
  globals: [Settings],
  localization: {
    defaultLocale: 'ar',
    fallback: true,
    locales: ['ar', 'en'],
  },
  secret: payloadSecret,
  sharp,
  typescript: {
    outputFile: 'src/payload/payload-types.ts',
  },
});
