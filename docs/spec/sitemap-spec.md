# Sitemap Spec — otranslate.com (Next.js)

_Sanitized build extract. Every page is generated from a data record (see `content-data-model.md`). One template per cluster type; no hand-built pages except the 6 core/trust pages._

## 1. Language & URL conventions

- **Arabic is the root locale.** `otranslate.com/…` = Arabic; `otranslate.com/en/…` = English. No `/ar/` prefix, ever.
- **Arabic-script slugs** for Arabic pages, short (≤ 4 words, no stop words): `/وثائق/شهادة-ميلاد/`. English slugs under `/en/`: `/en/documents/birth-certificate/`.
- Every page declares `hreflang` ar ↔ en + `x-default` → ar. Pages without a translation yet: **self-referencing hreflang only** (never link to a 404).
- Trailing slashes, lowercase, hyphens. One canonical per page.
- **301 map:** old WP URL → nearest equivalent on the new site (~30 URLs; homepage fallback only when no equivalent). Lives as the `redirects` seed; verified before DNS switch.

## 2. Page-type inventory (one Next.js template each)

| #    | Template                                        | AR route                    | EN route                           | Generated from                        |
| ---- | ----------------------------------------------- | --------------------------- | ---------------------------------- | ------------------------------------- |
| T1   | Homepage                                        | `/`                         | `/en/`                             | settings + featured refs              |
| T2   | Service pillar                                  | `/خدمات/{service}/`         | `/en/services/{service}/`          | `services`                            |
| T3   | Document page                                   | `/وثائق/{doc}/`             | `/en/documents/{doc}/`             | `documents`                           |
| T5   | Language page                                   | `/لغات/{lang}/`             | `/en/languages/{lang}/`            | `languages`                           |
| T6   | Use-case page                                   | `/استخدامات/{case}/`        | `/en/use-cases/{case}/`            | `use_cases`                           |
| T7   | Governorate delivery                            | `/محافظات/{gov}/`           | `/en/delivery/{gov}/`              | `administrative_areas`                |
| T8   | Hub (one per cluster)                           | `/وثائق/` etc.              | `/en/documents/` etc.              | collection index                      |
| T9   | Pricing                                         | `/الأسعار/`                 | `/en/pricing/`                     | `price_books` + `languages`           |
| T10  | Combo doc×authority (phase 2, gated)            | `/وثائق/{doc}/{authority}/` | `/en/documents/{doc}/{authority}/` | `combos`                              |
| T12  | Trust/static                                    | see §4                      | mirrored                           | hand-written                          |
| T13a | Market page (buying FROM a country)             | `/الأسواق/{country}/`       | `/en/markets/{country}/`           | `countries` + `market_profiles`       |
| T13b | Destination page (documents going TO a country) | `/الوجهات/{country}/`       | `/en/destinations/{country}/`      | `countries` + `jurisdiction_profiles` |
| T14  | Region hub (only when ≥3 good country pages)    | `/الوجهات/{region}/`        | `/en/destinations/{region}/`       | `regions`                             |
| T15  | Authority page (embassy, USCIS, IRCC, …)        | `/الجهات/{authority}/`      | `/en/authorities/{authority}/`     | `authorities`                         |

(Embassy = an `authorities` record with `type: embassy`; T4 is merged into T15.) Market ≠ destination — different search intents, never one URL. "Tier-1" is internal vocabulary only, never a public label. No country-root domains in v1.

## 3. Launch scope (Tier 0 — AR + EN both)

- **Homepage** — 3 differentiators above the fold: rating widget (see data model), WhatsApp-first ordering, delivery to all 27 governorates.
- **Service pillars (4):** الترجمة المعتمدة (master) · التصديقات والأختام الرسمية · الترجمة التخصصية · ترجمة الشركات (B2B).
- **Documents hub + top 12:** شهادة ميلاد، شهادة زواج، شهادة طلاق، صحيفة الحالة الجنائية، شهادة التخرج، بيان الدرجات، شهادة الثانوية، كشف حساب بنكي، رخصة القيادة، السجل التجاري، البطاقة الضريبية، عقود.
- **Authorities hub + top 8 embassies (T15):** الألمانية، الإيطالية، الفرنسية، الإسبانية، الأمريكية، البريطانية، الكندية، الأسترالية — **plus USCIS + IRCC**.
- **Geo slice:** Egypt market page (T13a) + 4 destinations (T13b): USA (USCIS), Canada (IRCC), Germany, Italy. UAE + Saudi = draft records (Phase 2+). Every destination/authority page carries the GEO substance: requirement, required language, certification rule, `last_verified` date, official source link.
- **Languages hub + top 6:** الإنجليزية، الألمانية، الفرنسية، الإيطالية، الإسبانية، الروسية.
- **`/الأسعار/`** — published from-prices per language tier (page = 250 words).
- **Trust/static (6):** كيف تطلب · آراء العملاء · ضمان القبول · نماذج ترجمات · من نحن · اتصل بنا (WhatsApp intake with source tracking).

Tier 1 (first 90 days) and Tier 2 (demand-gated combos/blog) exist as records but publish later; governorate pages are **demand-gated** (all 27 as `administrative_areas`, publish top by real order/delivery history, rest stay `draft`).

## 4. Internal-linking rules (enforced by templates, not editors)

1. **Hub ↔ spoke:** every cluster page links up to its hub + breadcrumb; hubs list all published spokes.
2. **Cross-cluster via data relations only:** document → its `related_authorities`, `related_use_cases`; authority → its `related_languages`, top documents. **Max 6 related links per block, from data, never free-text.**
3. **Every T2–T7 / T13 / T15 page links to** `/الأسعار/` **+ the WhatsApp CTA** (with `?src={page_id}` tracking) — the two conversion sinks.
4. **Pillar mesh:** the certified-translation pillar links to all 4 hubs; hubs link back. Homepage links to pillars + hubs only (not spokes).
5. Reviews widget renders **visually** on every template. **Schema realism:** `AggregateRating` markup only where legitimately attached to the reviewed entity (reviews page / organization), never blanket self-review markup. Per-page FAQs use `FAQPage` schema, same realism.
6. **No orphans:** the build FAILS if a published record has zero inbound links (checkable because links come from data).

## 5. Technical inheritance (non-negotiable)

- **GTM-TGFRTRR5 + GA4 G-5PGZ7E6QWF** on all pages from day 1 (see `analytics-events.md`). No new containers/properties.
- WhatsApp intake keeps source-tracking; every CTA carries page-level `src`.
- WordPress stays live until the new site ships; DNS switch + homepage 301 is the final step.
