# Code Review — Ticketock

Senior-level review of the current codebase (backend, frontend, infra,
and docs), ranked from critical to light. Each finding references the
exact file(s) it was found in.

> **Status update — historical document.** This review reflects the code
> *before* the hardening recorded in
> [ADR 0006](docs/adr/0006-post-review-hardening.md). Findings #1 (insecure
> default JWT secret), #2 (`httpx2`), #3 (refresh flow vs. docs), #4 (status
> race), #5 (missing indexes), #6 (frontend lockfile), #7 (README/CI),
> #8 (reactive 401), #9 (unpinned deps), #11 (tokens-in-storage documented)
> and #12 (login placeholder) have since been addressed. Only #10
> (`tests/unit/` needing a real DB) remains as a deliberate, documented
> choice. Kept as the record of what the original review found.

## Critical

### 1. Insecure default JWT secret, silently used if unset

`backend/app/core/config.py:6`

```python
jwt_secret_key: str = "dev-secret-change-me"
```

`docker-compose.yml`'s `backend` service only sets `DATABASE_URL`
directly; `JWT_SECRET_KEY` is expected to come from an optional `.env`
file (`env_file: path: .env, required: false`). If nobody creates
`.env` — including on the very first `docker compose up` per
`README.md`'s own quickstart — the API boots fine with a secret that is
checked into git history and therefore public. Anyone can forge valid
access/refresh tokens for any user, including the `support` role.

**Fix:** fail fast (raise on startup) when `JWT_SECRET_KEY` isn't
explicitly set, instead of shipping a value that quietly works.

### 2. Unverified/likely-wrong test dependency `httpx2`

`backend/pyproject.toml:21`, under `[project.optional-dependencies].test`

FastAPI's `TestClient` (used throughout `backend/tests/integration/`)
is built on `httpx`, not a package named `httpx2` — no other file in the
backend references `httpx` at all. This reads as a typo that will
either break `pip install ".[test]"` (and CI once it exists), or, if
`httpx2` happens to resolve to some unrelated package on PyPI, is a
dependency-confusion risk.

**Fix:** verify and most likely correct this to `httpx`.

## High

### 3. Refresh-token flow contradicts the closed architecture decision, added without flagging it

`backend/app/api/auth.py` (`POST /auth/refresh`),
`backend/app/core/security.py` (`create_refresh_token` /
`decode_refresh_token`), `frontend/src/auth/AuthContext.tsx`
(proactive refresh loop)

`ARCHITECTURE.md` §6 states explicitly: *"JWT signed HS256, short
expiry (~1h), no refresh tokens (out of scope)"*, and ADR 0003 lists
refresh tokens among the things "deliberately excluded." `AGENTS.md`'s
own non-negotiable rules say: *"No scope creep: don't add auth flows...
beyond what ARCHITECTURE.md defines without flagging it first"* and
*"stop and ask rather than assuming."*

The implementation adds a real refresh-token flow anyway, with the
security implications that come with it: a 30-day-lived credential
(`refresh_token_expire_seconds = 60 * 60 * 24 * 30`), stored in
`localStorage`/`sessionStorage` on the client, with no rotation and no
server-side revocation on logout — `AuthContext.signOut()` only clears
client-side storage; the token itself stays valid on the server until
it naturally expires.

**Fix:** either remove the refresh-token flow to match the documented
contract, or explicitly update ARCHITECTURE.md/ADR 0003 to record the
decision (with rotation/revocation) — don't leave the code and the
"closed decision" docs disagreeing.

### 4. No concurrency control on the status transition

`backend/app/services/ticket_service.py:90-127` (`change_status`)

`ticket_repository.get_by_id` does a plain `db.get()` — no
`SELECT ... FOR UPDATE`. Under PostgreSQL's default READ COMMITTED
isolation, two concurrent `PATCH /tickets/{id}/status` calls (e.g. two
support agents acting on the same ticket) can both read the same
pre-transition status, both pass `is_valid_transition`, and both
commit — producing two `StatusHistory` rows for what should be a single
transition, and an ambiguous final ticket state.

`ARCHITECTURE.md` calls the status workflow *"the single most important
piece of business logic in the system"* — this is the one place that
most needs to be race-safe, and currently isn't.

**Fix:** `with_for_update()` on the ticket read inside `change_status`,
or a single `UPDATE tickets SET status = :new WHERE id = :id AND
status = :expected` with a rowcount check that raises
`InvalidStatusTransitionError` on 0 rows affected.

## Medium

### 5. Missing indexes on columns every ticket query filters/sorts by

`backend/alembic/versions/0001_create_core_tables.py`

PostgreSQL does not automatically index foreign-key columns.
`tickets.created_by` (filtered on every employee-scoped `GET
/tickets`), `tickets.status`, `tickets.category`, `tickets.priority`
(all filterable per the §5 contract), and `status_history.ticket_id`
(queried on every ticket detail view) have no indexes — meaning full
table scans as ticket volume grows.

**Fix:** cheap to add now via a new migration, before it becomes a
live-data problem.

### 6. Frontend Docker build ignores the lockfile

`frontend/Dockerfile:5-6`

```dockerfile
COPY package.json ./
RUN npm install
```

`package-lock.json` only arrives later via `COPY . .`, after `npm
install` has already run — so the image resolves fresh dependency
versions instead of the ones the repo's lockfile commits to. No
reproducibility between local dev and the built image.

**Fix:** `COPY package.json package-lock.json ./` followed by `RUN npm
ci`.

### 7. README documents CI commands that don't exist yet

`README.md` references `.github/workflows/ci.yml`, but that file
doesn't exist in the repo yet — `AGENTS.md` checklist item 9 (CI) is
still open. Not a bug, just flagging so this doc/reality gap gets
closed once CI is written, not forgotten.

### 8. No reactive 401 handling in the API client

`frontend/src/api/client.ts`

Token renewal is only proactive: a `setTimeout` in `AuthContext.tsx`
scheduled ~30 seconds before expiry. If that timer is delayed (a
backgrounded tab, laptop sleep, clock skew) and a request comes back
401, there's no interceptor to retry after a refresh or force a clean
redirect to `/login` — the user just sees a raw `ApiError`.

### 9. Backend dependencies are unpinned, no lockfile

`backend/pyproject.toml` uses `>=` only for every dependency, with no
`uv.lock` / pip-compile output. Combined with finding #2, backend
builds aren't reproducible over time.

## Low

### 10. `tests/unit/` isn't actually unit-isolated

`backend/tests/unit/test_ticket_service.py` and `test_auth_service.py`
hit a real PostgreSQL `db_session` fixture rather than mocking the
repositories. Not wrong (arguably more valuable coverage), but the
`unit/` vs `integration/` split implies an isolation level that isn't
there, which could mislead a future contributor about what needs a
database to run.

### 11. Tokens kept in `localStorage`/`sessionStorage`

`frontend/src/auth/AuthContext.tsx` — a standard SPA trade-off, but
worth one line in `README.md`'s existing "Trade-offs" section next to
the other documented ones, since it's a real XSS-exposure surface and
isn't called out there today.

### 12. Cosmetic: login placeholder resembles a real credential

`frontend/src/pages/LoginPage.tsx:127` —
`placeholder="tabatha.macedo@email.com"` sits next to the actual seed
accounts (`employee@company.com`). Swap for an obviously fake example
to avoid confusion.

## Strengths

- Layering is genuinely respected: no router touches the database
  directly (confirmed across `api/tickets.py`, `api/auth.py`,
  `api/users.py`) — all DB access flows through `services/` →
  `repositories/`.
- Role checks (`require_role` / `ensure_role`) always re-read the live
  user from the database rather than trusting the JWT's embedded role
  claim, so there's no stale-role privilege-escalation issue.
- The status-transition rule (`is_valid_transition`) correctly rejects
  both skipped steps and backward moves, matching the contract exactly.
- The custom error envelope (`AppError` + `main.py` exception handlers)
  matches the §5 contract precisely, including the fixed `code` enum
  values.
- Test coverage is broad and co-located — nearly a 1:1 test file per
  source file on both backend and frontend.
