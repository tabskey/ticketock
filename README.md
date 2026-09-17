# Internal Support Ticket Portal

A small full-stack prototype for submitting and managing internal
support tickets. Built with React + Vite, FastAPI, and PostgreSQL,
running behind Nginx via Docker Compose.

📄 Full architecture, diagrams, and ADRs: [`ARCHITECTURE.md`](ARCHITECTURE.md)
🤖 Contributor / agent guide: [`AGENTS.md`](AGENTS.md)

---

## 🇬🇧 English

### Getting started

Requirements: Docker and Docker Compose.

```bash
git clone <repo-url>
cd support-portal
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

# Frontend — unit + integration, coverage gate at 80%
docker compose exec frontend npm run test -- --coverage

# E2E (Cypress, against the full stack)
npm --prefix frontend run cypress:run
```

The same commands run in CI on every push/PR — see
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Key technical decisions

| Decision | Choice | Details |
|---|---|---|
| Backend framework | FastAPI | [ADR 0001](docs/adr/0001-backend-framework.md) |
| Database | PostgreSQL + Alembic | [ADR 0002](docs/adr/0002-database.md) |
| Authentication | JWT, 2 fixed roles | [ADR 0003](docs/adr/0003-authentication.md) |
| E2E testing | Cypress | [ADR 0004](docs/adr/0004-e2e-testing.md) |
| Reverse proxy | Nginx + Docker Compose | [ADR 0005](docs/adr/0005-reverse-proxy.md) |

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

### Assumptions

- Two roles (`employee`, `support`) are sufficient; no admin UI.
- Ticket categories (`IT`, `Facilities`, `HR`) are a fixed enum, not a
  configurable table.
- Single-tenant application, no multi-company support.

### What I'd improve with more time

- Configurable categories (DB-backed instead of enum).
- Refresh tokens and session revocation.
- Optimistic UI updates on status change.
- Rate limiting on `/auth/login`.
- Structured logging with a correlation ID propagated from Nginx
  through the backend.
- Audit log for ticket edits, not just status changes.

---

## 🇧🇷 Português

### Como rodar

Requisitos: Docker e Docker Compose.

```bash
git clone <repo-url>
cd support-portal
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

# Frontend — unitário + integração, gate de cobertura em 80%
docker compose exec frontend npm run test -- --coverage

# E2E (Cypress, contra a stack completa)
npm --prefix frontend run cypress:run
```

Os mesmos comandos rodam na esteira de CI a cada push/PR — ver
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Decisões técnicas principais

| Decisão | Escolha | Detalhes |
|---|---|---|
| Framework backend | FastAPI | [ADR 0001](docs/adr/0001-backend-framework.md) |
| Banco de dados | PostgreSQL + Alembic | [ADR 0002](docs/adr/0002-database.md) |
| Autenticação | JWT, 2 papéis fixos | [ADR 0003](docs/adr/0003-authentication.md) |
| Testes E2E | Cypress | [ADR 0004](docs/adr/0004-e2e-testing.md) |
| Proxy reverso | Nginx + Docker Compose | [ADR 0005](docs/adr/0005-reverse-proxy.md) |

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

### Suposições

- Dois papéis (`employee`, `support`) são suficientes; sem UI de admin.
- Categorias de ticket (`TI`, `Instalações`, `RH`) são um enum fixo, não
  uma tabela configurável.
- Aplicação single-tenant, sem suporte a múltiplas empresas.

### O que eu melhoraria com mais tempo

- Categorias configuráveis (via banco, não enum).
- Refresh tokens e revogação de sessão.
- Atualização otimista de UI na troca de status.
- Rate limiting em `/auth/login`.
- Logging estruturado com correlation ID propagado do Nginx até o
  backend.
- Log de auditoria para edições de ticket, não só mudanças de status.
