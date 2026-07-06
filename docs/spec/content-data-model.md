# Content Data Model — otranslate.com (Payload CMS)

**Source of truth = Payload CMS collections on PostgreSQL.** JSON files are seed/export/backup/test fixtures only (`/seed/*.json`). Every page in `sitemap-spec.md` is generated from one Payload record. The FULL schema (incl. geo layer + language pairs) is defined in M0 even though Phase 1 populates only content collections.

**Conventions:** `id` = stable English kebab-case key (never changes; used for relations + WhatsApp `src`). Bilingual text uses Payload localization (`ar` root locale, `en`); `en` empty = not published in English (hreflang self-references). `status`: `draft | published`. `tier`: `0 | 1 | 2`. Relations are Payload relationship fields — templates render them as related-links blocks (sitemap-spec §4.2).

## 0. Geography = four dimensions, never one "location" field

**customer market** (buying from) ≠ **destination jurisdiction** (document used in) ≠ **service/delivery area** (Egypt governorates) ≠ **UI language** (ar/en). Keep them separate.

## 1. `settings` (global, one record)

```json
{
  "gtm_id": "GTM-TGFRTRR5",
  "ga4_id": "G-5PGZ7E6QWF",
  "whatsapp_number": "20XXXXXXXXXX",
  "whatsapp_link_pattern": "https://wa.me/{number}?text={intake_text}&src={page_id}",
  "google_rating": { "value": 4.9, "count": 513, "source": "live GBP API, fallback static" },
  "delivery": {
    "governorates": "all",
    "note_ar": "التوصيل لجميع المحافظات",
    "cairo_same_day": true
  },
  "page_word_unit": 250
}
```

Rating renders visually on every template; `AggregateRating` schema only where legitimate (sitemap-spec §4.5). Count updates from GBP API at build time.

## 2. `services` — T2 pillars

`id`, `status`, `tier`, `slug{ar,en}`, `name`, `summary`, `body_sections[]`, `includes[]`, `related_services[]`, `faq_ids[]`, `meta`. Records: `certified-translation`, `legalization-stamps`, `specialized-translation`, `business-translation`.

## 3. `documents` — T3, biggest cluster

`category`, `typical_pages`, `requirements_ar`, `turnaround_hours`, `faq_ids`, `combo_flags`, `meta`, plus:

- `related_authorities` (relationship → `authorities`).
- from-price derived via **price book** (§6): `typical_pages` × per-page price of the page's market context (not a single global price).

Launch records: 12 per sitemap-spec T0.

## 4. `authorities` — T15 (generalizes embassies)

Embassy, USCIS, IRCC, WES, university, court, ministry — anything that _accepts_ the translation.

```json
{
  "id": "uscis",
  "type": "immigration-authority",
  "status": "published",
  "tier": 0,
  "slug": { "ar": "هيئة-الهجرة-الأمريكية-uscis", "en": "uscis" },
  "name": { "ar": "هيئة الهجرة الأمريكية (USCIS)", "en": "USCIS" },
  "country": "united-states",
  "languages": ["english"],
  "requirement_summary": { "ar": "…" },
  "required_language": "english",
  "certification_rule": { "ar": "ترجمة معتمدة + شهادة دقة موقعة، لا يشترط توثيق" },
  "legalization_required": false,
  "last_verified": "2026-07-05",
  "source_references": [{ "label": "USCIS policy", "url": "https://…" }],
  "top_documents": ["birth-certificate", "marriage-certificate"],
  "related_use_cases": ["us-immigration"],
  "faq_ids": [],
  "meta": {}
}
```

`requirement_summary` + `certification_rule` + `last_verified` + `source_references` = the GEO substance (citable verified facts). `last_verified` is **required** on `authorities` + `jurisdiction_profiles`. T0: 8 embassies + USCIS + IRCC.

## 5. `languages` + `language_pairs`

`languages`: `slug`, `name`, `related_authorities`, `top_documents`, `faq_ids`, `meta` — pricing moves to pairs.

`language_pairs`: `source_language_id` + `target_language_id` + derived `pair_code` (`ar-en`), `pricing_tier` (1 = AR↔EN, 2 = other↔AR/EN, 3 = foreign↔foreign pivot ≥2×), optional per-pair price overrides per price book. Language _pages_ (T5) aggregate their pairs; no public pair pages in v1.

## 6. `price_books` — T9 + market pricing

One price book per market, currency is the fence, no page ever shows two books. (Values + rules: `pricing-data.md`.)

```json
{
  "id": "b2c-egypt-egp",
  "market": "egypt",
  "currency": "EGP",
  "base_pair": "ar-en",
  "per_page": 200,
  "minimum_charge": 200,
  "rush_per_page": 250,
  "rush_promise_hours": 24,
  "unit_words_per_page": 250,
  "pair_overrides": [{ "pair": "ar-de", "per_page": null }],
  "b2b_note": "negotiated rates never published"
}
```

## 7. `use_cases` — T6

`required_documents[]`, `related_authorities[]`, `faq_ids[]`, `meta`. Checklist page pattern.

## 8. Geo collections (schema in M0; Phase 1 publishes a slice)

| Collection              | Purpose                                                                                          | Phase 1 state                              |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `regions`               | Nav hubs + internal segments                                                                     | schema only                                |
| `countries`             | Execution entity: currency, payment methods, price-book ref, timezone, availability, legal notes | Egypt + US/CA/DE/IT + UAE/SA drafts        |
| `market_profiles`       | "How we sell there" → T13a                                                                       | Egypt published; UAE/SA draft              |
| `jurisdiction_profiles` | "What they accept there" → T13b; requirement facts + `last_verified` + sources                   | US, Canada, Germany, Italy published       |
| `administrative_areas`  | Egypt governorates → T7; demand-gated publishing                                                 | all 27 records; top governorates published |

## 9. `faqs`

Reusable pool; `FAQPage` schema, realism per sitemap-spec §4.5.

## 10. `combos`

T10 gated intersections. Gate = Search Console impressions; publishing = flipping a flag. No combos before data exists.

## 11. `redirects`

The 301 map: `from_path` (old WP URL) → `to_path` (nearest equivalent), ~30 records, seeded from the WP sitemap. Fallback → homepage only when no equivalent. Served by Next.js from this collection.

## 12. What every template derives automatically

Title/H1/meta, breadcrumb, hreflang pair, canonical, `Service`/`FAQPage` schema (realistic), related-links blocks, from-price via price book, WhatsApp CTA `src={page_id}`, `sitemap.xml` entry, analytics dimensions (see `analytics-events.md`). **Nothing page-specific lives in code.**
