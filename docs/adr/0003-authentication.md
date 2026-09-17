# ADR 0003: Authentication — JWT with two fixed roles

## Status
Accepted

## Context
The assignment's business rules don't mention authentication at all —
strictly, the core CRUD flow could ship with no auth. But "employees
submit tickets" and "support manages tickets" implies two distinct
actors with different permissions (an employee shouldn't see or edit
another employee's ticket; only support can change status).

## Decision
Add a minimal **JWT-based** auth layer with exactly two roles:
`employee` and `support`. No registration flow — two seed users only
(see [ADR 0002](0002-database.md)).

## Rationale
- Without any notion of "who created this ticket," the "employees submit
  tickets" rule can't be meaningfully enforced (anyone could see/edit
  anyone's ticket), which undercuts the point of the exercise.
- JWT is stateless, requires no session store, and is the standard,
  expected pattern for a REST API — appropriate weight for the scope.
- Deliberately **not** building: registration, password reset, refresh
  tokens, OAuth. All of that is real complexity a production system would
  need, but none of it changes the reviewer's ability to evaluate the
  core ticket-management logic, so it's left out and listed under
  "what I'd improve with more time."

## Alternatives considered
- **No auth**: simplest, but makes "employee" vs "support" a purely
  cosmetic distinction with no enforcement, weakening the demonstration
  of authorization logic.
- **Full user management (signup, roles table, admin UI)**: out of
  proportion to a 4-endpoint prototype; would shift review focus away
  from the ticket domain itself.

## Consequences
- Two hardcoded seed accounts are the only way into the system — fine
  for a prototype, explicitly called out as a limitation in the README.
- Authorization checks live in `services/`, not in the router layer, so
  they're covered by the same unit tests as the status workflow.
