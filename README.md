# EAS — Examination & Analytics Platform

A browser-based examination and analytics platform for coaching institutes.
Institutes upload their own papers and answer keys; students sit the paper in
Chrome from anywhere. The system produces a per-test report and a longitudinal
profile that sharpens as a student takes more tests.

Launch patterns: **JEE Main Paper 1** (single timed part) and **MHT-CET PCM**
(two independently timed parts with a hard lock between them). Nothing about
either pattern is hardcoded — marking scheme, section rules, and
marks-per-question are data.

Sold B2B: the institute is the buyer, the student is the user.

## Architecture

| Layer | Choice |
|---|---|
| Backend | Python 3.12 / FastAPI |
| Worker | Separate process — reports, PDF generation, ingestion parsing |
| Frontend | React + Vite SPA, Dexie over IndexedDB (local-first) |
| Database | One PostgreSQL instance: relational data, append-only event log, pgvector embeddings, job table |
| Storage | Cloudflare R2 + CDN for paper bundles |

Design principles: local-first persistence (the browser is the source of truth
for an in-progress sitting), a server-authoritative per-part clock, full part
preloaded before its clock starts, raw events with nothing derived at write
time, refresh-safe at all times, and tenant scoping on every table.

Deliberately not used: Redis, Kafka, Celery, a separate vector database,
microservices.

## Layout

```
backend/    FastAPI app + worker (shared codebase, separate entrypoints)
  app/        API, models, core, grading
  alembic/    migrations
  scripts/    seed scripts
frontend/   React + Vite + Dexie SPA
docker-compose.yml   local Postgres (pgvector/pgvector:pg16) on :5432
```

## Quickstart (local dev)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/),
[uv](https://docs.astral.sh/uv/), and Node.js 20+. uv manages the Python 3.12
interpreter itself.

```sh
# from repo root — start Postgres
docker compose up -d

# backend: migrate, seed, serve
cd backend
uv sync
uv run alembic upgrade head
uv run python scripts/seed_jee_demo.py
uv run uvicorn app.main:app --reload      # http://localhost:8000/health

# worker (grades submitted tests) — separate terminal
cd backend && uv run python -m app.worker

# frontend — separate terminal
cd frontend && npm install && npm run dev  # http://localhost:5173
```

`.env` at the repo root is created from `.env.example`; the defaults match
`docker-compose.yml` and need no changes for local dev. R2 credentials are only
needed at the ingestion / bundle-build step.

## Status

Early build: schema and skeleton for all tables, migrations, a seed script, the
health check, the worker polling loop, and a working demo player (JEE Main
single-part content, multi-part mechanism implemented and tested). No auth,
no real ingestion pipeline, no CET content seeded yet. See the internal setup
notes for the current gap list.
