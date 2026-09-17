# ADR 0001: Backend framework — FastAPI

## Status
Accepted

## Context
The assignment allows FastAPI, Flask, or Django. The backend is a small
REST API (4-5 endpoints) with schema validation, role-based auth, and a
business rule (status workflow) that must be well isolated and testable.

## Decision
Use **FastAPI**.

## Rationale
- Pydantic gives request/response validation and serialization for free —
  no hand-written validators for `category`/`priority` enums.
- Automatic OpenAPI/Swagger docs, useful both for manual testing during
  development and as a living contract to hand over with the submission.
- Native `async def` support if the app ever needs non-blocking I/O.
- Dependency-injection style (`Depends`) maps cleanly onto a layered
  architecture (router → service → repository) without extra boilerplate.

## Alternatives considered
- **Django**: brings an ORM, admin panel, and auth system that are
  overkill for 4-5 endpoints and would need to be partially bypassed
  anyway (custom JWT auth instead of Django's session auth).
- **Flask**: minimal by design, but validation, serialization, and OpenAPI
  docs would all need to be added manually (e.g. via Flask-RESTX or
  marshmallow), increasing boilerplate without a clear benefit over
  FastAPI for this scope.

## Consequences
- Adds a dependency on Pydantic v2 semantics across the codebase.
- Async is available but not required — most of this app is a thin CRUD
  layer over Postgres, so most routes stay synchronous unless profiling
  says otherwise.
