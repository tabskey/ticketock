🐾 TicketTock

Todo chamado merece uma patinha amiga.
Um miado de distância da solução.


A small full-stack prototype for submitting and managing internal
support tickets. Built with React + Vite, FastAPI, and PostgreSQL,
running behind Nginx via Docker Compose.

📄 Full architecture, diagrams, and ADRs: [`ARCHITECTURE.md`](ARCHITECTURE.md)
🤖 Contributor / agent guide: [`AGENTS.md`](AGENTS.md)

---

## 🇬🇧 English

### Getting started

Requirements: Docker and Docker Compose.

The backend requires a `JWT_SECRET_KEY` and refuses to start without one —
there is no insecure default. Copy [`.env.example`](.env.example) to `.env`
and set a real value (`.env` is git-ignored, so it never gets committed):

```bash
git clone <repo-url>
cd support-portal
cp .env.example .env   # then set a real JWT_SECRET_KEY
docker compose up --build
```

This starts four services: `nginx` (`http://localhost`), `frontend`,
`backend`, and `db`. On first boot, run migrations (including the seed
users) once the `backend` container is up:

```bash
docker compose exec backend alembic upgrade head
```

Seed accounts (see [ADR 0003](docs/adr/0003-authentication.md)):

| Role | Email | Password |
|---|---|---|
| Employee | `employee@company.com` | `employee123` |
| Support | `support@company.com` | `support123` |

### Running tests

```bash
# Backend — unit + integration, coverage gate at 80%
docker compose exec backend pytest --cov=app --cov-fail-under=80

# Frontend — unit + integration, coverage gate at 80% (runs in its own
# container, so no local Node install is needed)
docker compose --profile test run --rm frontend-test

# E2E (Cypress, against the full stack)
cd frontend && npm run e2e
```

The backend `tests/unit/` suite exercises a real PostgreSQL database (via the
shared `db_session` fixture) rather than mocking the repositories — valuable
coverage, but it still needs the database to run.

A GitHub Actions pipeline (lint, both test suites with the coverage gates,
image build, E2E) is designed in
[`ARCHITECTURE.md` §8](ARCHITECTURE.md) but not yet built; the commands above
are currently run manually.

### Key technical decisions

| Decision | Choice | Details |
|---|---|---|
| Backend framework | FastAPI | [ADR 0001](docs/adr/0001-backend-framework.md) |
| Database | PostgreSQL + Alembic | [ADR 0002](docs/adr/0002-database.md) |
| Authentication | JWT, 2 fixed roles | [ADR 0003](docs/adr/0003-authentication.md) |
| E2E testing | Cypress | [ADR 0004](docs/adr/0004-e2e-testing.md) |
| Reverse proxy | Nginx + Docker Compose | [ADR 0005](docs/adr/0005-reverse-proxy.md) |
| Post-review hardening | Fail-fast secret, refresh rotation, race-safe transitions | [ADR 0006](docs/adr/0006-post-review-hardening.md) |

### Trade-offs

- **PostgreSQL over SQLite**: one extra container, in exchange for
  native enums and closer parity with a real deployment target.
- **JWT with two hardcoded roles, no registration**: enough to enforce
  "employees see only their own tickets" without building full user
  management, which was out of scope for this prototype.
- **Seed data lives in an Alembic migration**, not a startup script —
  reproducible and versioned, at the cost of one extra command on first
  boot.
- **Simple custom error envelope** instead of a full RFC 7807
  implementation — consistent and easy to consume from the frontend,
  without adopting a spec whose extra fields wouldn't be used here.
- **Tokens kept in `localStorage`/`sessionStorage`** — a standard SPA
  trade-off, but a real XSS-exposure surface: an injected script can read
  the refresh token. Mitigated by the short access-token TTL and the
  server-side refresh-token revocation (see
  [ADR 0006](docs/adr/0006-post-review-hardening.md)), not eliminated.

### Assumptions

In short: two fixed roles are enough, ticket categories are a fixed enum
(not a configurable table), and the app is single-tenant. The full list
lives in [`ARCHITECTURE.md` §9](ARCHITECTURE.md).

### What I'd improve with more time

Configurable (DB-backed) categories, a CI pipeline, optimistic UI updates
on status change, login rate limiting, structured logging, and an audit
log for ticket edits — the full list lives in
[`ARCHITECTURE.md` §10](ARCHITECTURE.md).

---

## 🇧🇷 Português

### Como rodar

Requisitos: Docker e Docker Compose.

O backend exige um `JWT_SECRET_KEY` e não sobe sem ele — não há mais
segredo padrão inseguro. Copie [`.env.example`](.env.example) para `.env`
e defina um valor de verdade (`.env` está no `.gitignore`, então nunca é
commitado):

```bash
git clone <repo-url>
cd support-portal
cp .env.example .env   # depois defina um JWT_SECRET_KEY de verdade
docker compose up --build
```

Isso sobe quatro serviços: `nginx` (`http://localhost`), `frontend`,
`backend` e `db`. Na primeira execução, rode as migrations (que incluem
o seed de usuários) depois que o container `backend` estiver de pé:

```bash
docker compose exec backend alembic upgrade head
```

Contas de seed (ver [ADR 0003](docs/adr/0003-authentication.md)):

| Papel | E-mail | Senha |
|---|---|---|
| Funcionário | `employee@company.com` | `employee123` |
| Suporte | `support@company.com` | `support123` |

### Rodando os testes

```bash
# Backend — unitário + integração, gate de cobertura em 80%
docker compose exec backend pytest --cov=app --cov-fail-under=80

# Frontend — unitário + integração, gate de cobertura em 80% (roda em um
# container próprio, então não precisa de Node instalado na máquina)
docker compose --profile test run --rm frontend-test

# E2E (Cypress, contra a stack completa)
cd frontend && npm run e2e
```

A suíte `tests/unit/` do backend roda contra um PostgreSQL real (via a fixture
compartilhada `db_session`), não com mocks dos repositórios — cobertura
valiosa, mas ainda depende do banco para rodar.

Uma esteira de GitHub Actions (lint, as duas suítes com os gates de cobertura,
build das imagens, E2E) está desenhada em
[`ARCHITECTURE.md` §8](ARCHITECTURE.md), mas ainda não foi construída; por ora
os comandos acima rodam manualmente.

### Decisões técnicas principais

| Decisão | Escolha | Detalhes |
|---|---|---|
| Framework backend | FastAPI | [ADR 0001](docs/adr/0001-backend-framework.md) |
| Banco de dados | PostgreSQL + Alembic | [ADR 0002](docs/adr/0002-database.md) |
| Autenticação | JWT, 2 papéis fixos | [ADR 0003](docs/adr/0003-authentication.md) |
| Testes E2E | Cypress | [ADR 0004](docs/adr/0004-e2e-testing.md) |
| Proxy reverso | Nginx + Docker Compose | [ADR 0005](docs/adr/0005-reverse-proxy.md) |
| Endurecimento pós-review | Segredo fail-fast, rotação de refresh, transições sem corrida | [ADR 0006](docs/adr/0006-post-review-hardening.md) |

### Trade-offs

- **PostgreSQL em vez de SQLite**: um container a mais, em troca de
  enums nativos e maior fidelidade com um ambiente de deploy real.
- **JWT com dois papéis fixos, sem cadastro**: suficiente pra garantir
  "funcionário só vê os próprios tickets" sem construir gestão de
  usuários completa, fora do escopo do protótipo.
- **Seed de dados via migration do Alembic**, não script de startup —
  reproduzível e versionado, ao custo de um comando extra na primeira
  execução.
- **Envelope de erro próprio e simples**, em vez de RFC 7807 completo —
  consistente e fácil de consumir no frontend, sem adotar uma spec cujos
  campos extras não seriam usados aqui.
- **Tokens guardados em `localStorage`/`sessionStorage`** — trade-off padrão
  de SPA, mas uma superfície real de exposição a XSS: um script injetado
  consegue ler o refresh token. Mitigado pelo TTL curto do access token e pela
  revogação server-side do refresh token (ver
  [ADR 0006](docs/adr/0006-post-review-hardening.md)), não eliminado.

### Suposições

Resumindo: dois papéis fixos bastam, as categorias de ticket são um enum
fixo (não uma tabela configurável) e a aplicação é single-tenant. A lista
completa está em [`ARCHITECTURE.md` §9](ARCHITECTURE.md).

### O que eu melhoraria com mais tempo

Categorias configuráveis (via banco), uma esteira de CI, atualização
otimista de UI na troca de status, rate limiting no login, logging
estruturado e log de auditoria para edições de ticket — a lista completa
está em [`ARCHITECTURE.md` §10](ARCHITECTURE.md).
