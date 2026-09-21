# ADR 0006: Post-review hardening

## Status
Accepted

## Context
A senior code review (`CODE_REVIEW.md`) of the finished prototype surfaced
one security-critical issue, one undocumented deviation from a previously
closed decision, a race condition on the status workflow, and a set of
reproducibility/documentation gaps. The prototype had already reached its
functional scope, so the goal here is hardening and bringing the code and
the contracts back into agreement — not new features.

The review's items map onto six decisions worth recording, either because
they change a documented contract or because they are the kind of choice a
future contributor would otherwise re-litigate:

1. a public default `JWT_SECRET_KEY` that silently works when `.env` is
   missing;
2. a refresh-token flow that contradicts ADR 0003 and `ARCHITECTURE.md` §6,
   which list refresh tokens as deliberately excluded;
3. a status transition that is not safe under concurrent requests;
4. missing indexes on the columns every ticket query filters/sorts by;
5. unpinned backend dependencies;
6. a CI pipeline referenced by the README that was never implemented.

## Decision
Adopt the following, superseding ADR 0003 on the refresh-token point only:

1. **Fail fast on the JWT secret.** `JWT_SECRET_KEY` becomes a required
   setting with no default; the app refuses to start if it is unset.
2. **Keep and formalize refresh tokens.** The refresh-token flow stays, but
   is now a documented part of the security model (this ADR plus an updated
   `ARCHITECTURE.md` §5/§6), and is hardened with **rotation** and
   **server-side revocation**: every refresh token carries a `jti`, is
   persisted, is revoked when used, and is revoked on logout.
3. **Race-safe status transitions.** `change_status` takes a row lock
   (`SELECT ... FOR UPDATE`) so two concurrent support actions cannot both
   pass the transition check.
4. **Index the query columns.** A migration adds indexes on
   `tickets.created_by`, `tickets.status`, `tickets.category`,
   `tickets.priority`, and `status_history.ticket_id`.
5. **Pin backend dependencies** to exact versions in `pyproject.toml`.
6. **CI is out of scope** for this submission (see `AGENTS.md` item 9,
   struck through). The README no longer points at a workflow that does not
   exist.

Supporting client/infra fixes ship with the same change: the API client
handles a reactive `401` (refresh once, retry, otherwise sign out), and the
frontend image installs from the lockfile (`npm ci`).

## Rationale
- The public secret is the only finding with an exploitable security impact:
  a known HS256 key lets anyone forge an access token for **any** role,
  including `support`. Failing fast is the smallest change that removes the
  footgun; keeping a "dev default" that silently works is exactly the trap
  the review flagged.
- Refresh tokens were already implemented and tested. Removing them would be
  scope churn and a UX regression; the honest fix is to record the decision
  (the docs were the thing that was wrong) and close the security gap the
  review actually cared about — a long-lived, non-rotating, non-revocable
  credential. Rotation plus a revocation store is what makes keeping them
  defensible.
- `ARCHITECTURE.md` calls the status workflow "the single most important
  piece of business logic in the system." Under READ COMMITTED, two
  concurrent `PATCH /status` calls can both read the pre-transition status
  and both commit. A row lock is the minimal, standard remedy.
- Indexes and dependency pinning are cheap now and expensive later; neither
  changes behaviour, so they carry no review risk.
- CI was never built; documenting it as out of scope is more honest than
  leaving a README link to a non-existent file. Actual CI is left as the
  first item of "what I'd improve with more time."

## Alternatives considered
- **Keep the insecure default and only warn.** Rejected: a warning in logs is
  trivially ignored, and the default is in git history — the key is public by
  construction.
- **Remove the refresh-token flow to match ADR 0003 verbatim.** Viable and
  less code, but discards working functionality and forces the short-lived
  access token to be re-minted by a full login every hour; rejected in favour
  of formalizing the deviation.
- **Shorten the refresh TTL instead of adding rotation/revocation.**
  Rejected: a shorter-lived but still non-revocable token doesn't fix logout,
  and lengthens the re-login friction the flow exists to avoid.
- **`SELECT ... FOR UPDATE`** instead of the conditional
  `UPDATE ... WHERE status = :expected` with a rowcount check. Also correct,
  but it means holding a row lock across the read-then-write sequence in
  `change_status`; the conditional update leaves that structure unchanged and
  is easier to exercise in a unit test.
- **Introduce `uv`/`poetry` with a lockfile.** Rejected for now: the backend
  builds with plain `pip` over `pyproject.toml` (hatchling); adding a package
  manager is new tooling the stack never agreed to. Exact pins are the
  lighter fix; a transitive lockfile remains a future improvement.

## Consequences
- **Breaking**: any environment without `JWT_SECRET_KEY` (including the
  previously "zero-config" quickstart) now fails to boot. The README,
  `.env.example`, and the test suite were updated in the same change.
- A new `refresh_tokens` table and migration (`0007`) are required; login now
  persists a row per issued refresh token, refresh rotates it, and logout
  revokes it.
- Two migrations land with this ADR (`0006` indexes, `0007` refresh store),
  chained after `0005`.
- ADR 0003 is superseded **only** on the "no refresh tokens" statement; its
  two-role model and the rest of its reasoning remain in force.
