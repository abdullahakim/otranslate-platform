import type { Locale } from './content';
import { getSettings, text } from './content';

type LinkItem = { label: string; href: string };
type PageRef = { id: string; label: string; href: string; hub?: LinkItem; cluster?: string };

const HOME: Record<Locale, LinkItem> = {
  ar: { label: 'OTranslate', href: '/' },
  en: { label: 'OTranslate', href: '/en/' },
};

export const hubLinks: Record<Locale, LinkItem[]> = {
  ar: [
    { label: 'وثائق', href: '/وثائق/' },
    { label: 'لغات', href: '/لغات/' },
    { label: 'جهات', href: '/الجهات/' },
    { label: 'استخدامات', href: '/استخدامات/' },
  ],
  en: [
    { label: 'Documents', href: '/en/documents/' },
    { label: 'Languages', href: '/en/languages/' },
    { label: 'Authorities', href: '/en/authorities/' },
    { label: 'Use cases', href: '/en/use-cases/' },
  ],
};

export function staticPath(id: string, locale: Locale) {
  const paths: Record<string, Record<Locale, string>> = {
    about: { ar: '/من-نحن/', en: '/en/about/' },
    'how-to-order': { ar: '/كيف-تطلب-ترجمتك/', en: '/en/how-to-order/' },
    guarantee: { ar: '/ضمان-القبول/', en: '/en/acceptance-guarantee/' },
    contact: { ar: '/اتصل-بنا/', en: '/en/contact/' },
    pricing: { ar: '/الأسعار/', en: '/en/pricing/' },
  };
  return paths[id]?.[locale] ?? (locale === 'ar' ? '/' : '/en/');
}

export function buildBreadcrumb(page: PageRef, locale: Locale): LinkItem[] {
  return [HOME[locale], ...(page.hub ? [page.hub] : []), { label: page.label, href: page.href }];
}

export function relatedBlock(relations: LinkItem[]): LinkItem[] {
  return relations.filter((link) => link.label && link.href).slice(0, 6);
}

export function pricingHref(locale: Locale) {
  return staticPath('pricing', locale);
}

export async function whatsappHref(pageId: string, locale: Locale) {
  const settings = await getSettings();
  const pattern =
    text(settings['whatsapp_link_pattern'], locale) || 'https://wa.me/{number}?src={page_id}';
  const rawNumber = settings['whatsapp_number'];
  const number = (typeof rawNumber === 'string' ? rawNumber : '').replace(/[^\d]/g, '');
  return pattern
    .replace('{number}', encodeURIComponent(number))
    .replace('{page_id}', encodeURIComponent(pageId))
    .replace('{intake_text}', encodeURIComponent(pageId));
}

export async function conversionSinks(pageId: string, locale: Locale) {
  return { pricing: pricingHref(locale), whatsapp: await whatsappHref(pageId, locale) };
}

export function analyticsStub(_event: string, _payload: Record<string, string>) {
  return null;
}

export function schemaOrg(options: {
  organization?: boolean;
  faqs?: { question: string; answer: string }[];
}) {
  const graph: Record<string, unknown>[] = [];
  if (options.organization) graph.push({ '@type': 'Organization', name: 'OTranslate' });
  if (options.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: options.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }
  return graph.length ? { '@context': 'https://schema.org', '@graph': graph } : null;
}
