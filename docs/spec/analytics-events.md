# Analytics events — otranslate.com

_Technical taxonomy only. Account/property administration lives in the private vault._

## Container (law)

- **GTM container:** `GTM-TGFRTRR5` — the only container. Load via `@next/third-parties` on every page.
- **GA4:** `G-5PGZ7E6QWF` (mapped inside GTM). Google Ads conversion `AW-17635844520` fires via GTM.
- **No new containers or properties, ever.** Everything below lives in `GTM-TGFRTRR5`.

The site pushes events to `dataLayer`; GTM maps them to GA4.

## Standard dimensions on every event (from page/record data, never hand-typed)

`page_cluster` (service | document | authority | language | use_case | market | destination | governorate | pricing | trust) · `page_id` (record id) · `ui_language` (ar | en) · `market` (egypt | gcc | tier1) · `destination_country` (when the page has one) · `authority` (when the page has one) · `price_book` (b2c-egypt-egp | b2c-gcc | b2c-tier1-usd).

## Events

| Event                         | Trigger                      | Extra params                                 |
| ----------------------------- | ---------------------------- | -------------------------------------------- |
| `whatsapp_click`              | any WhatsApp CTA             | `src` = page_id (**the Phase 1 conversion**) |
| `quote_request_submit`        | simple quote form (M1-5)     | doc type, pair, market                       |
| `pricing_view`                | pricing page/block view      | price_book                                   |
| `sample_view`                 | sample library open          | sample id                                    |
| `phone_click` / `email_click` | contact taps                 | —                                            |
| (Phase 2+ reserved)           | `quote_value`, `order_value` | market, pair, destination_country            |

Google Ads conversion stays mapped to `whatsapp_click` for historical comparability. WhatsApp links are built by **one helper** from `settings.whatsapp_link_pattern`.
