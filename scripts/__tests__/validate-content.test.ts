import { describe, expect, it } from 'vitest';

import { loadSeedCorpus, validateContent } from '../validate-content';

type TestCorpus = Record<string, Record<string, unknown>[]>;

const base = (): TestCorpus => ({
  services: [page('services', 'certified-translation')],
  documents: [page('documents', 'birth-certificate')],
  authorities: [page('authorities', 'uscis')],
  languages: [page('languages', 'english')],
  faqs: [{ key: 'faq' }],
  combos: [{ document: 'birth-certificate', authority: 'uscis', status: 'published' }],
  redirects: [],
});

const page = (collection: string, key: string) => ({
  key,
  status: 'published',
  slug: { ar: key, en: key },
  meta: {
    title: { ar: `${collection} ar`, en: `${collection} en` },
    description: { ar: `${key} ar`, en: `${key} en` },
  },
});

const codes = (corpus: ReturnType<typeof base>) =>
  validateContent(corpus).map((issue) => issue.code);

describe('validateContent', () => {
  it('accepts the committed seed corpus', () => {
    expect(validateContent(loadSeedCorpus())).toEqual([]);
  });

  it('rejects orphan published pages', () => {
    const corpus = base();
    corpus['combos'] = [];
    expect(codes(corpus)).toContain('orphan-published-page');
  });

  it('rejects missing hreflang pair targets', () => {
    const corpus = base();
    delete (corpus['documents']?.[0]?.['slug'] as Record<string, string>)['en'];
    expect(codes(corpus)).toContain('missing-hreflang-target');
  });

  it('rejects broken relations', () => {
    const corpus = base();
    corpus['combos']![0] = { ...corpus['combos']![0], authority: 'missing-authority' };
    expect(codes(corpus)).toContain('broken-relation');
  });

  it('rejects missing meta', () => {
    const corpus = base();
    corpus['documents']![0] = {
      ...corpus['documents']![0],
      meta: { title: { ar: '', en: '' }, description: { ar: '', en: '' } },
    };
    expect(codes(corpus)).toContain('missing-meta');
  });

  it('rejects enabled WhatsApp CTAs without src', () => {
    const corpus = base();
    corpus['documents']![0] = { ...corpus['documents']![0], whatsapp_cta: { enabled: true } };
    expect(codes(corpus)).toContain('missing-whatsapp-src');
  });

  it('rejects redirect loops', () => {
    const corpus = base();
    corpus['redirects'] = [
      { from_path: '/a', to_path: '/b' },
      { from_path: '/b', to_path: '/a' },
    ];
    expect(codes(corpus)).toContain('redirect-loop');
  });
});
