# Pricing data + rules

*Only the values Codex implements and the hard rules. Market strategy / positioning is intentionally not in this repo.*

## Rules (non-negotiable)

1. **One market → one price book → one currency.** A page renders exactly one book. **Never** render a currency conversion or a side-by-side multi-currency table.
2. Page unit = **250 words**. Minimum charge = **one page**, all markets.
3. Rush promise = **24 hours**, all markets.
4. From-prices on T3/T5 pages come from the page's **market context** via a helper, never hard-coded.
5. B2B rates are negotiated and **never published**.

## Price books

| id | market | currency | per_page | minimum | rush_per_page | rush_hours |
|---|---|---|---|---|---|---|
| `b2c-egypt-egp` | egypt | EGP | 200 | 200 | 250 | 24 |
| `b2c-gcc` | gcc | AED / SAR | 50 | 50 | 60 | 24 |
| `b2c-tier1-usd` | tier1 | USD | 15 | 15 | 25 | 24 |

## Phase 1 publishing

- `/الأسعار/` → `b2c-egypt-egp` (EGP).
- `/en/pricing/` → `b2c-tier1-usd` (USD); certificate of accuracy included.
- `b2c-gcc` stays **draft** until Phase 2 GCC market pages publish.
- Per-pair overrides live in `price_books.pair_overrides`; the AR↔EN row is the baseline template, every other pair gets the same structure with pair-specific values.
