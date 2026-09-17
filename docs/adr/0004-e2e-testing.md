# ADR 0004: E2E testing — Cypress

## Status
Accepted

## Context
The project requires end-to-end coverage of the critical user flows
(submit a ticket, filter/sort the list, walk a ticket through its status
workflow) on top of unit and integration tests, running both locally and
in CI against the Dockerized stack.

## Decision
Use **Cypress** for E2E tests.

## Rationale
- Prior hands-on experience with Cypress on this team means faster,
  more reliable test authoring than picking up a new tool for this
  scope.
- Cypress's built-in retry/auto-wait behavior fits a UI backed by
  TanStack Query (async data fetching, loading states) without manual
  polling logic in the tests.
- Runs headless in GitHub Actions with an official action
  (`cypress-io/github-action`), keeping CI setup simple.

## Alternatives considered
- **Playwright**: comparable capability and often faster in CI, but would
  mean ramping up on a new tool for no material benefit at this scope —
  not justified for a handful of critical-path E2E tests.

## Consequences
- E2E tests run against the full `docker-compose` stack (via Nginx),
  not against the Vite dev server, so they exercise the same reverse
  proxy routing used in "production."
- Kept intentionally narrow: a handful of critical paths, not exhaustive
  UI coverage — that's what the unit/integration layers are for.
