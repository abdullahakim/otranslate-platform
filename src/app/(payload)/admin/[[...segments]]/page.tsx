import configPromise from '@payload-config';
import { generatePageMetadata, RootPage } from '@payloadcms/next/views';

import { importMap } from '@/payload/importMap';

type AdminPageArgs = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export const generateMetadata = ({ params, searchParams }: AdminPageArgs) =>
  generatePageMetadata({ config: configPromise, params, searchParams });

export default function AdminPage({ params, searchParams }: AdminPageArgs) {
  return RootPage({ config: configPromise, importMap, params, searchParams });
}
