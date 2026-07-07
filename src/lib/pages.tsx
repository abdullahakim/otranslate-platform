import type { ReactNode } from 'react';
import {
  Breadcrumb,
  Card,
  Footer,
  Header,
  LanguageSwitcher,
  RelatedLinks,
  ReviewsBadge,
  WhatsAppCTA,
} from '@/components';

import { getSettings, type Locale } from './content';
import { buildBreadcrumb, conversionSinks, hubLinks, relatedBlock, staticPath } from './linking';

const t = {
  ar: {
    nav: 'التنقل الرئيسي',
    home: 'OTranslate',
    switch: 'English',
    current: 'العربية',
    cta: 'ابدأ عبر واتساب',
    ctaHelp: 'يحتفظ الرابط بمصدر الصفحة للمتابعة.',
    rating: 'تقييم العملاء',
    reviews: 'مراجعة',
    order: 'طلب عبر واتساب أولاً',
    delivery: 'التوصيل لجميع المحافظات',
    title: 'OTranslate',
    intro: 'ترجمة معتمدة وخدمات ثقة عبر مسارات واضحة.',
    related: 'روابط مرتبطة',
    legal: 'OTranslate',
  },
  en: {
    nav: 'Primary navigation',
    home: 'OTranslate',
    switch: 'العربية',
    current: 'English',
    cta: 'Start on WhatsApp',
    ctaHelp: 'The link carries the page source for intake tracking.',
    rating: 'customer rating',
    reviews: 'reviews',
    order: 'WhatsApp-first ordering',
    delivery: 'Delivery to all governorates',
    title: 'OTranslate',
    intro: 'Certified translation and trust services through clear paths.',
    related: 'Related links',
    legal: 'OTranslate',
  },
};

const staticTitles: Record<string, Record<Locale, string>> = {
  about: { ar: 'من نحن', en: 'About' },
  'how-to-order': { ar: 'كيف تطلب ترجمتك', en: 'How to order' },
  guarantee: { ar: 'ضمان القبول', en: 'Acceptance guarantee' },
  contact: { ar: 'اتصل بنا', en: 'Contact' },
};

function Shell({ children, locale }: { children: ReactNode; locale: Locale }) {
  const copy = t[locale];
  const staticLinks = Object.entries(staticTitles).map(([id, labels]) => ({
    label: labels[locale],
    href: staticPath(id, locale),
  }));
  return (
    <>
      <Header
        home={{ label: copy.home, href: locale === 'ar' ? '/' : '/en/' }}
        navigation={[...hubLinks[locale], ...staticLinks]}
        navigationLabel={copy.nav}
        languageSwitcher={
          <LanguageSwitcher
            currentLabel={copy.current}
            twin={{ label: copy.switch, href: locale === 'ar' ? '/en/' : '/' }}
          />
        }
      />
      {children}
      <Footer columns={[{ title: copy.related, links: staticLinks }]} legal={copy.legal} />
    </>
  );
}

export async function HomePage({ locale }: { locale: Locale }) {
  const settings = await getSettings();
  const copy = t[locale];
  const rating = settings['google_rating'] as { value?: number; count?: number } | undefined;
  return (
    <Shell locale={locale}>
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <section className="space-y-6">
          <ReviewsBadge
            label={copy.rating}
            rating={String(rating?.value ?? '')}
            count={`${rating?.count ?? ''} ${copy.reviews}`}
          />
          <h1 className="text-4xl font-bold text-neutral-900">{copy.title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-neutral-700">{copy.intro}</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Card title={copy.rating} body={`${rating?.value ?? ''} / ${rating?.count ?? ''}`} />
            <Card title={copy.order} body={copy.ctaHelp} />
            <Card title={copy.delivery} body={copy.delivery} />
          </div>
        </section>
        <RelatedLinks title={copy.related} links={relatedBlock(hubLinks[locale])} />
      </main>
    </Shell>
  );
}

export async function StaticPage({
  id,
  locale,
}: {
  id: keyof typeof staticTitles;
  locale: Locale;
}) {
  const copy = t[locale];
  const title = staticTitles[id]?.[locale] ?? id;
  const sinks = await conversionSinks(id, locale);
  const crumbs = buildBreadcrumb(
    { id, label: title, href: staticPath(id, locale), cluster: 'trust' },
    locale,
  );
  return (
    <Shell locale={locale}>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <Breadcrumb items={crumbs} label={copy.related} />
        <ReviewsBadge label={copy.rating} rating="" count="" />
        <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
        <WhatsAppCTA label={copy.cta} href={sinks.whatsapp} helperText={copy.ctaHelp} />
      </main>
    </Shell>
  );
}
