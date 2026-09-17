# ADR 0002: Database — PostgreSQL, SQLAlchemy, Alembic-managed seed

## Status
Accepted

## Context
The assignment explicitly allows a file-based approach if justified, and a
prototype of this size (two entities, no high concurrency) would run fine
on SQLite. However, the goal of this submission is to demonstrate
production-oriented judgment, not just the smallest thing that works.

## Decision
Use **PostgreSQL**, managed with **SQLAlchemy** (ORM) and **Alembic**
(migrations). Seed users (`employee@company.com`, `support@company.com`)
are created by a dedicated Alembic migration, not an ad-hoc startup
script.

## Rationale
- Postgres runs as a normal Docker Compose service, so the added
  operational cost is one extra container — acceptable for the fidelity
  gained (native enums, real concurrency behavior, closer to what this
  team would run in production).
- Alembic makes schema changes versioned and reviewable like any other
  code change. A seed migration is reproducible in every environment
  (local, CI, a teammate's machine) with a single `alembic upgrade head`,
  instead of relying on an imperative script that could silently
  no-op or duplicate rows.
- Keeping the seed *in* a migration (rather than a `startup` hook in the
  FastAPI app) also means the API process has no side effects on boot —
  it only serves requests. Migrations are a separate, explicit step in
  both `docker-compose` and CI.

## Alternatives considered
- **SQLite**: zero infra cost, but drops Postgres-specific types (native
  enums) and doesn't reflect how this service would actually be deployed.
- **Startup seed script**: simpler to write, but non-idempotent by
  default (needs manual "does this user already exist" checks) and is
  invisible to `alembic history` — a reviewer inspecting migrations
  wouldn't see how the seed data got there.

## Consequences
- Local development requires running migrations before first boot
  (`alembic upgrade head`), documented in the root README and automated
  as a Compose init step.
- Two extra services in `docker-compose.yml` compared to a SQLite
  approach: `db` and, implicitly, a migration step.
