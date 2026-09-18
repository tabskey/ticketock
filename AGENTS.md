# AGENTS.md — Internal Support Ticket Portal

This file is the entry point for any AI agent (or human) working on this
codebase. It is deliberately short. It tells you the non-negotiable
rules and *when* to go read something deeper — it does not repeat the
"why" behind each decision.

> **Progressive disclosure rule:** don't read the full `ARCHITECTURE.md`
> or every ADR up front. Do the task in front of you using the rules
> below; open a linked document only when the checklist item you're on
> tells you to. This keeps context small and prevents the agent from
> inventing details that live somewhere else.

## Mission

Implement a support ticket portal (employee submits tickets, support
manages them) per the contract in `ARCHITECTURE.md` §5, without
deviating from the stack and structure already decided (see §2 there).
Do not re-litigate stack choices — they're closed decisions, recorded in
`docs/adr/`.

## Non-negotiable rules

- **Language**: all code, identifiers, commit messages, and ADRs are in
  English. The `README.md` is the only bilingual (PT/EN) document.
- **Clean Code**: no comments except where the *why* genuinely isn't
  obvious from the code itself (e.g. a non-obvious regulatory constraint,
  a workaround for a library bug). Never comment *what* the code does —
  if a comment is needed to explain *what*, rewrite the code instead.
- **Layering**: routers never touch the database directly; business
  rules (especially the status workflow) live in `services/`, never in
  routers or ORM models.
- **Testing**: every new piece of business logic ships with a unit test.
  Every new endpoint ships with an integration test. Coverage must not
  drop below **80%** on either backend or frontend — this is enforced in
  CI, not optional.
- **No scope creep**: don't add auth flows, roles, or entities beyond
  what `ARCHITECTURE.md` defines without flagging it first.

## Checklist

> **Why this is split into phases:** each phase links only the ADR or
> `ARCHITECTURE.md` section relevant to *that step*. This isn't just
> organization — it's a deliberate cost and accuracy control. Loading
> the full `ARCHITECTURE.md` plus every ADR into context on every task
> wastes tokens on information that's irrelevant to the step at hand,
> and counter-intuitively *increases* the chance of hallucination —
> more irrelevant context competes with what actually matters for the
> current task. Pulling in a document only when the phase you're on
> tells you to keeps the working context small, cheap, and focused.
> Treat the checklist itself as your progress tracker: check items off
> as you go instead of restating status elsewhere.

Work through phases in order. Each phase names the one document to open
if you need more context — nothing else.

- [x] **1. Compose skeleton** — `docker-compose.yml`, `nginx/default.conf`,
      empty `backend/` and `frontend/` service Dockerfiles that boot.
      _If you need the routing rationale:_ `docs/adr/0005-reverse-proxy.md`.
- [x] **2. Data layer** — SQLAlchemy models (`User`, `Ticket`,
      `StatusHistory`) + first Alembic migration + seed migration.
      _If you need the schema or seed rationale:_ `docs/adr/0002-database.md`,
      `ARCHITECTURE.md` §4.
- [x] **3. Auth** — `/auth/login`, JWT issuance, `Depends`-based role
      guards.
      _If you need the auth rationale:_ `docs/adr/0003-authentication.md`.
- [x] **4. Ticket endpoints** — CRUD + status transition + status
      history, per the contract.
      _If you need the exact contract:_ `ARCHITECTURE.md` §5.
      _If you need the transition rule:_ `ARCHITECTURE.md` §4 (bottom).
- [x] **5. Backend tests** — unit tests for `services/`, integration
      tests for every route, coverage check ≥ 80%.
- [ ] **6. Frontend** — ticket list (filter/sort), ticket detail
      (history), submission form, login screen. TanStack Query for all
      server state.
- [ ] **7. Frontend tests** — component/hook tests with Vitest + RTL,
      coverage check ≥ 80%.
- [ ] **8. E2E** — Cypress specs for: submit a ticket, filter the list,
      walk a ticket through its full status workflow.
      _If you need the E2E rationale:_ `docs/adr/0004-e2e-testing.md`.
- [ ] **9. CI** — `.github/workflows/ci.yml` with the four jobs described
      in `ARCHITECTURE.md` §8.
- [ ] **10. README** — setup instructions, decisions summary (PT/EN),
      trade-offs, assumptions, "what I'd improve" (mirror
      `ARCHITECTURE.md` §9–10, don't duplicate verbatim — link instead).

## When something is ambiguous

If a checklist item requires a decision that isn't covered by
`ARCHITECTURE.md` or an ADR, stop and ask rather than assuming — don't
add a new entity, role, or dependency to resolve it silently.
