# otranslate-platform

The OTranslate digital platform — bilingual translation services website and operations hub.

Built against the [Master Plan: System Design & Phased Delivery](../business/bu-otranslate/01_strategy/website-rebuild/Master-Plan_System-Design-and-Phases.md) (By Hakim Holding Obsidian vault).

## Phases

| Phase | Module  | Goal                                                           |
| ----- | ------- | -------------------------------------------------------------- |
| 1     | M0 + M1 | Foundation + Traffic Site (live bilingual site, SEO/GEO-ready) |
| 2     | M2      | Intake — structured quote/order forms                          |
| 3     | M3      | Ops Core — order state machine + dashboard                     |
| 4     | M4      | Files & Quality                                                |
| 5     | M5      | Delivery & Certificates                                        |
| 6     | M6      | Insight — reporting & analytics                                |

## Stack

```
Next.js  ·  Payload CMS  ·  PostgreSQL  ·  SeaweedFS  ·  Redis
n8n (notifications)  ·  Mautic (marketing)
GTM-TGFRTRR5  ·  GA4 G-5PGZ7E6QWF
```

## Roles

- **Codex** — sole code writer (works from written specs, opens PRs)
- **Claude** — architecture, spec review, PR review, QA
- **Amin** — server operations (deploy runbooks only)

## PR protocol

Every PR requires: written spec artifact → CI green → Claude review → merge.
See `Pipeline-Stage-A-Runbook.md` in the vault for the full guide.

## Local development quickstart

### Prerequisites

- Node.js 22
- pnpm 9+ via Corepack
- Docker Compose

### Environment

```bash
cp .env.example .env
```

The example values are for local development only. Never commit real secrets.

### Run with Docker Compose

```bash
docker compose up
```

This starts PostgreSQL 17 and the Next.js/Payload app. The Payload admin is mounted at `/admin`.

### Run the app locally against Docker Postgres

```bash
docker compose up postgres
pnpm install
pnpm dev
```

Open <http://localhost:3000> for the Arabic root locale, <http://localhost:3000/en> for the English mirror, and <http://localhost:3000/admin> for Payload admin.

### Seed and export Payload content

```bash
pnpm seed
pnpm export
```

`pnpm seed` idempotently imports JSON fixtures from `seed/` into Payload using stable keys and relation-key resolution. `pnpm export` writes the current Payload collections and the `settings` global back to `seed/*.json` with stable ordering and 2-space formatting.

## Local checks

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm format:check
```
