# OTranslate Platform Constitution

This constitution defines the canonical operating rules for `otranslate-platform`. It is intentionally one page: build details belong in [`AGENTS.md`](../AGENTS.md) and the specs under [`docs/spec/`](../docs/spec/), especially the sitemap, content model, pricing, and analytics specs.

## Ground rules

- The specs in `docs/spec/` + `AGENTS.md` are law: read before coding; the spec wins over assumptions; flag conflicts in the PR, never silently choose.
- Extend the repo; never re-scaffold. Never push to main, never deploy, never touch WordPress / DNS / production.
- Small PRs (<= ~400 changed lines, one concern); description >= 20 chars + spec link (file + section). Do not modify the 3 required CI checks or loosen ESLint / tsconfig / Danger.
- No invented content; Arabic/English page copy comes from seed records supplied by Claude (`"__SEED_PLACEHOLDER__"` for placeholders).

## Dependency allowlist

Closed allowlist: anything not listed here needs an approved Claude PR comment before install.

- **Allowed runtime:** `next` (15.x, App Router), `react`, `react-dom`, `payload` (3.x) + official Payload plugins, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/next`, `sharp`, `zod`, `tailwindcss`, `postcss`, `autoprefixer`, `@next/third-parties` (GTM).
- **Allowed dev/CI:** `vitest`, `@lhci/cli`, `playwright` (CI smoke only), `tsx`, `danger`, `eslint`, `typescript`, `typescript-eslint`, `prettier`.
- **Forbidden:** CSS-in-JS runtimes, `moment.js`, `lodash` (use natives), any analytics SDK other than GTM, any CMS/admin UI besides Payload, ORM layers besides Payload's.

## Roles

- **Codex** — code writer; builds from specs; branch + PR only; never merges, never deploys.
- **Claude** — reviews every PR (checklist in `AGENTS.md`) and merges Phase 1 PRs passing CI + review; authors specs + seed data.
- **Amin** — server / DNS / deploy only, from a written runbook; no code.
- **Abdullah** — milestone demos + vetoes.

## Non-goals

Reject scope creep in review: no payments; no customer/linguist portals; no order state machine; no certificates/QR; no CMS besides Payload; no forms beyond the single quote request; no blog engine (Phase 2); no per-district pages; no public language-pair pages; no touching WordPress/DNS; no server work in code PRs; no combo pages before Search Console data.
