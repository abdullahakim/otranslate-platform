# Build specs — source of truth

These files are the authoritative, repo-native build specs for `otranslate-platform`. Agents (see [`/AGENTS.md`](../../AGENTS.md)) and humans build from these; they override assumptions.

They are **sanitized extracts** of the internal planning docs: competitive strategy, pricing margins/positioning, and analytics account internals live only in the private vault, not here (this repo is public). What remains is exactly the technical build rules plus already-public output values (published prices, GTM/GA IDs that ship in page source anyway).

| File | Governs | Milestones |
|---|---|---|
| `sitemap-spec.md` | routes, templates, URL/locale + linking rules | M1-1 … M1-7 |
| `content-data-model.md` | Payload collections, fields, relations | M0-2, all M1 |
| `pricing-data.md` | price books + pricing rules | M1-6 |
| `analytics-events.md` | GTM + `dataLayer` events | M1-4 |

When a spec is ambiguous or conflicts with another, flag it in the PR — do not silently choose.
