import type { ReactNode } from 'react';

type LinkItem = {
  label: string;
  href: string;
};

type HeaderProps = {
  home: LinkItem;
  navigation: LinkItem[];
  actions?: LinkItem[];
  languageSwitcher?: ReactNode;
  navigationLabel: string;
};

export function Header({
  home,
  navigation,
  actions = [],
  languageSwitcher,
  navigationLabel,
}: HeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-neutral-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <a className="text-xl font-bold text-neutral-900" href={home.href}>
          {home.label}
        </a>
        <nav
          aria-label={navigationLabel}
          className="flex flex-wrap items-center gap-3 text-sm text-neutral-700"
        >
          {navigation.map((item) => (
            <a
              className="rounded-md px-3 py-2 hover:bg-neutral-100"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {actions.map((action) => (
            <a
              className="rounded-lg bg-accent-700 px-4 py-2 text-sm font-semibold text-neutral-50"
              href={action.href}
              key={action.href}
            >
              {action.label}
            </a>
          ))}
          {languageSwitcher}
        </div>
      </div>
    </header>
  );
}

type FooterProps = {
  columns: { title: string; links: LinkItem[] }[];
  legal: string;
};

export function Footer({ columns, legal }: FooterProps) {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-900 text-neutral-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        {columns.map((column) => (
          <section key={column.title}>
            <h2 className="text-sm font-semibold text-neutral-50">{column.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              {column.links.map((link) => (
                <li key={link.href}>
                  <a className="hover:text-neutral-50" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-sm text-neutral-400 md:col-span-3">{legal}</p>
      </div>
    </footer>
  );
}

export function Breadcrumb({ items, label }: { items: LinkItem[]; label: string }) {
  return (
    <nav aria-label={label} className="text-sm text-neutral-600">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li className="flex items-center gap-2" key={item.href}>
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            <a className="hover:text-accent-700" href={item.href}>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Card({
  title,
  body,
  href,
  meta,
}: {
  title: string;
  body: string;
  href?: string;
  meta?: string;
}) {
  const content = (
    <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
      {meta ? <p className="text-sm font-medium text-accent-700">{meta}</p> : null}
      <h2 className="mt-2 text-xl font-semibold text-neutral-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-neutral-700">{body}</p>
    </article>
  );
  return href ? <a href={href}>{content}</a> : content;
}

type FaqItem = {
  question: string;
  answer: string;
};

export function FAQAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
          key={item.question}
        >
          <summary className="cursor-pointer font-semibold text-neutral-900">
            {item.question}
          </summary>
          <p className="mt-3 text-sm leading-7 text-neutral-700">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function ReviewsBadge({
  label,
  rating,
  count,
}: {
  label: string;
  rating: string;
  count: string;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-accent-200 bg-accent-50 px-4 py-2 text-sm text-accent-900">
      <span aria-hidden="true">★★★★★</span>
      <span className="font-semibold">{rating}</span>
      <span>{count}</span>
      <span>{label}</span>
    </div>
  );
}

export function WhatsAppCTA({
  label,
  href,
  helperText,
}: {
  label: string;
  href: string;
  helperText?: string;
}) {
  return (
    <div className="rounded-2xl bg-accent-700 p-6 text-neutral-50">
      <a
        className="inline-flex rounded-lg bg-neutral-50 px-5 py-3 font-semibold text-accent-800"
        href={href}
      >
        {label}
      </a>
      {helperText ? <p className="mt-3 text-sm text-accent-50">{helperText}</p> : null}
    </div>
  );
}

export function PriceBlock({
  title,
  price,
  unit,
  notes = [],
}: {
  title: string;
  price: string;
  unit: string;
  notes?: string[];
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <p className="mt-4 text-3xl font-bold text-accent-800">{price}</p>
      <p className="mt-1 text-sm text-neutral-600">{unit}</p>
      <ul className="mt-4 space-y-2 text-sm text-neutral-700">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedLinks({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <section className="rounded-xl bg-neutral-100 p-5">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {links.slice(0, 6).map((link) => (
          <li key={link.href}>
            <a className="text-accent-800 hover:text-accent-600" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SampleCard({
  title,
  description,
  imageAlt,
}: {
  title: string;
  description: string;
  imageAlt: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
      <div
        className="flex h-36 items-center justify-center bg-neutral-100 text-sm text-neutral-500"
        role="img"
        aria-label={imageAlt}
      />
      <div className="p-5">
        <h2 className="font-semibold text-neutral-900">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-700">{description}</p>
      </div>
    </article>
  );
}

export function LanguageSwitcher({ currentLabel, twin }: { currentLabel: string; twin: LinkItem }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-neutral-500">{currentLabel}</span>
      <a
        className="rounded-md border border-neutral-300 px-3 py-2 text-neutral-700 hover:bg-neutral-100"
        href={twin.href}
        hrefLang={twin.href.startsWith('/en') ? 'en' : 'ar'}
      >
        {twin.label}
      </a>
    </div>
  );
}
