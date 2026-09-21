# 🐾 TicketTock

> **Todo chamado merece uma patinha amiga.**
> *Um miado de distância da solução.*

A small internal support portal designed to make the journey from **"deu problema"** to **"resolvido!"** simple, clear, and a little more charming.

TicketTock allows employees to submit and track support tickets while giving the support team a dedicated workspace to manage, filter, and update them.

The project was built as a full-stack prototype, with an emphasis on **clear architecture, role-based access, testing, containerization, and practical engineering decisions** rather than unnecessary complexity.

---

## 🐱 What is TicketTock?

TicketTock is an internal support ticket portal with two user roles:

| Role            | What they can do                               |
| --------------- | ---------------------------------------------- |
| 🐾 **Employee** | Create tickets and track their own requests    |
| 🛠️ **Support** | View, filter, sort, and manage support tickets |

Tickets contain:

* Title and description
* Category
* Priority
* Status
* Creation date
* Ownership / requester information

The interface was designed around a simple idea:

**support software doesn't have to look like enterprise software from 2007.** 🐈

---

## ✨ Features

### 🐾 Employee

* Login with JWT authentication
* Create support tickets
* Choose category and priority
* View submitted tickets
* Track ticket status
* Only access their own tickets

### 🛠️ Support

* View all tickets
* Filter by:

  * Status
  * Category
  * Priority
* Sort by:

  * Date
  * Priority
* Update ticket status
* Manage tickets through a dedicated support interface

### 🔐 Authentication & security

* JWT-based authentication
* Two fixed roles
* Short-lived access tokens
* Refresh token rotation
* Server-side refresh token revocation
* Fail-fast startup when `JWT_SECRET_KEY` is missing
* No insecure default secret
* Role-based authorization enforced by the backend

> This is a prototype, so authentication intentionally does not include registration or full user management.

---

## 🎨 The interface

TicketTock has three main screens:

**Login · Employee · Support**

The UI uses a playful cat-themed visual language while keeping the actual workflows straightforward.

The goal was not just to make the interface "cute", but to make a support portal that feels approachable without sacrificing usability.

---

## 🧰 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Cypress

### Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* Pytest
* JWT authentication

### Infrastructure

* PostgreSQL
* Nginx
* Docker
* Docker Compose

### Testing

* Backend unit + integration tests
* Frontend unit + integration tests
* Cypress E2E tests
* 80% coverage gates

---

## 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │      Browser     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      Nginx       │
                    │  Reverse Proxy   │
                    └───────┬──────────┘
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
        ┌────────────────┐    ┌────────────────┐
        │    Frontend    │    │     Backend    │
        │ React + Vite   │───▶│    FastAPI     │
        └────────────────┘    └───────┬────────┘
                                      │
                                      ▼
                              ┌────────────────┐
                              │   PostgreSQL   │
                              └────────────────┘
```

The application runs as four main services:

```text
nginx
frontend
backend
db
```

Docker Compose keeps the entire stack reproducible without requiring local Node or Python installations.

---

## 🧠 Engineering decisions

This project intentionally favors **simple solutions with explicit trade-offs**.

| Concern           | Decision                     |
| ----------------- | ---------------------------- |
| Backend           | FastAPI                      |
| Database          | PostgreSQL + Alembic         |
| Authentication    | JWT with two fixed roles     |
| E2E               | Cypress                      |
| Reverse proxy     | Nginx                        |
| Local environment | Docker Compose               |
| API errors        | Simple custom error envelope |
| Seed data         | Alembic migration            |

The reasoning behind each major decision is documented through ADRs.

📐 **Architecture & diagrams:** [`ARCHITECTURE.md`](ARCHITECTURE.md)

📚 **Architecture Decision Records:** [`docs/adr/`](docs/adr/)

🤖 **Contributor / agent guide:** [`AGENTS.md`](AGENTS.md)

---

## ⚖️ Trade-offs

### PostgreSQL instead of SQLite

Adds another container, but provides native enums and better parity with a realistic deployment environment.

### Two fixed roles instead of full user management

The prototype only needs to demonstrate the authorization boundary:

> **employees see their own tickets; support sees the tickets they need to manage.**

Building registration, password recovery, administration, etc. would add complexity without improving the core problem being demonstrated.

### Seed data through Alembic

Seed users live in a migration instead of a startup script.

This makes the database state reproducible and versioned, at the cost of one extra command during the first setup.

### Custom error envelope instead of full RFC 7807

The API uses a small, consistent error structure that provides everything the frontend needs without introducing a specification whose additional fields aren't currently used.

### Browser storage for tokens

Access and refresh tokens are stored in browser storage, which introduces a real XSS exposure surface.

The risk is partially mitigated through short-lived access tokens and server-side refresh-token revocation, but it is **not eliminated**.

See [ADR 0006](docs/adr/0006-post-review-hardening.md).

---

## 🚀 Getting Started

### Requirements

* Docker
* Docker Compose

### 1. Clone the repository

```bash
git clone <repo-url>
cd support-portal
```

### 2. Configure the environment

The backend requires a real `JWT_SECRET_KEY` and refuses to start without one.

```bash
cp .env.example .env
```

Then set:

```env
JWT_SECRET_KEY=<your-secret>
```

`.env` is git-ignored and should never be committed.

### 3. Start the stack

```bash
docker compose up --build
```

This starts:

```text
nginx      → http://localhost
frontend
backend
db
```

### 4. Run the database migrations

Once the backend container is running:

```bash
docker compose exec backend alembic upgrade head
```

This also creates the seed users.

### 🔑 Demo accounts

| Role        | Email                  | Password      |
| ----------- | ---------------------- | ------------- |
| 🐾 Employee | `employee@company.com` | `employee123` |
| 🛠️ Support | `support@company.com`  | `support123`  |

> These credentials are intended for local development only.

---

## 🧪 Testing

### Backend

Unit and integration tests with an 80% coverage gate:

```bash
docker compose exec backend pytest --cov=app --cov-fail-under=80
```

The backend tes
