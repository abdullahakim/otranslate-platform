# AGENTS.md — otranslate-platform

Authoritative instructions for any automated coding agent (Codex, etc.) working in this repo. **Read this first, on every task.**

## 1. The specs are law

The build specs in [`docs/spec/`](docs/spec/) are the source of truth for *what* to build. Before writing code for a feature, READ the relevant spec and implement it exactly:

| Spec | Governs |
|---|---|
| [`docs/spec/sitemap-spec.md`](docs/spec/sitemap-spec.md) | Routes, templates (T1–T15), URL/locale conventions, internal-linking rules |
| [`docs/spec/content-data-model.md`](docs/spec/content-data-model.md) | Payload collections, fields, relations, price books, geo model |
| [`docs/spec/pricing-data.md`](docs/spec/pricing-data.md) | Price-book values + one-market-one-price rules |
| [`docs/spec/analytics-events.md`](docs/spec/analytics-events.md) | GTM container, `dataLayer` event taxonomy, standard dimensions |
| [`.spec/constitution.md`](.spec/constitution.md) | Ground rules, dependency allowlist, roles |

**Conflict rule:** if a spec and your assumption disagree, the spec wins. If two specs conflict, or a spec is silent/ambiguous on something you need, **STOP and flag it in the PR description — never silently choose.**

## 2. Ground rules (summary — full list in `.spec/constitution.md`)

- Extend the existing repo; never re-scaffold. Never push to `main`, never deploy, never touch WordPress / DNS / the production server.
- The dependency allowlist is **closed** — anything outside it needs an approved PR comment from Claude *before* install.
- Small PRs (≤ ~400 changed lines, one concern each). PR description ≥ 20 chars **+ a spec link (file + section)**. Do not modify the 3 required CI checks or loosen ESLint / tsconfig / Danger.
- Arabic is the **root** locale (RTL); `/en/` mirrors it. Use logical CSS properties (`ms-`/`me-`) only — no `left`/`right`.
- Analytics: **GTM-TGFRTRR5 only**, no new containers. Pricing: **one page, one price book, one currency, never a conversion.**
- No invented page copy — Arabic/English content comes from seed records supplied by Claude; placeholders are marked `"__SEED_PLACEHOLDER__"`.

## 3. Self-publishing PRs

When a task is done and local checks pass (`pnpm lint`, `pnpm typecheck`, `pnpm format:check`, tests), push your `codex/<feature>` branch and open the PR to `main` yourself using `$GH_TOKEN` (details in the task prompt). Include `Closes #<issue>`. Do not wait for a human "Create PR" click.
