import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type Locale = 'ar' | 'en';
export type Localized<T = string> = T | { ar?: T; en?: T };
export type ContentRecord = Record<string, unknown> & {
  key?: string;
  status?: string;
  slug?: { ar?: string; en?: string };
};

export const LOCALES: Locale[] = ['ar', 'en'];
export const isLocale = (value: string): value is Locale => value === 'ar' || value === 'en';
export const isPlaceholder = (value: unknown) =>
  typeof value === 'string' && value.trim() === '__SEED_PLACEHOLDER__';

export function text(value: unknown, locale: Locale): string {
  const raw =
    typeof value === 'string'
      ? value
      : value && typeof value === 'object' && locale in value
        ? (value as Record<Locale, unknown>)[locale]
        : undefined;
  return typeof raw === 'string' && !isPlaceholder(raw) ? raw : '';
}

export async function readSeed<T = unknown>(collection: string): Promise<T> {
  const file = await readFile(join(process.cwd(), 'seed', `${collection}.json`), 'utf8');
  return JSON.parse(file) as T;
}

export async function getSettings() {
  return readSeed<Record<string, unknown>>('settings');
}

export async function getPublishedBySlug(collection: string, slug: string, locale: Locale) {
  const records = await readSeed<ContentRecord[]>(collection);
  const record = records.find(
    (item) => item.status === 'published' && item.slug?.[locale] === slug,
  );
  if (!record) notFound();
  return record;
}

export function published(records: ContentRecord[]) {
  return records.filter((record) => record.status === 'published');
}
