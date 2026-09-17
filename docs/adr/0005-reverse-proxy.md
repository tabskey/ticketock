# ADR 0005: Reverse proxy and orchestration — Nginx + Docker Compose

## Status
Accepted

## Context
The submission needs a functional prototype with clear setup instructions.
The frontend (static SPA build) and backend (API) are separate concerns
but should be reachable through a single, coherent entry point, the way
they would be behind a real ingress in production.

## Decision
Orchestrate all services (`frontend`, `backend`, `db`, `nginx`) with
**Docker Compose**. Nginx is the single service exposed to the host,
routing `/api/*` to the FastAPI backend and everything else to the
built React SPA.

## Rationale
- One exposed port (`80`) instead of three, matching how this would be
  fronted by a load balancer or ingress controller in a real deployment.
- Routing through Nginx from the start avoids CORS entirely in
  production-like runs (SPA and API share an origin) — CORS is only
  needed for local dev against the Vite dev server.
- `docker-compose up` is the entire setup story for a reviewer: no
  manual `pip install` / `npm install` / separate Postgres install.

## Alternatives considered
- **Frontend calling the backend directly (no proxy)**: simpler, but
  requires CORS configuration and exposes two ports instead of one,
  losing the "single entry point" property this ADR is meant to
  demonstrate.

## Consequences
- Nginx config (`nginx/default.conf`) is one more file to maintain, but
  it's small and static — no templating needed for a prototype with a
  single environment.
- The frontend's API client must use a relative base path (`/api`), not
  an absolute URL, so it works identically in Docker and in tests.
