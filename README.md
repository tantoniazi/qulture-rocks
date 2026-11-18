# Qulture Organogram

A monolithic application to manage company organograms: a **Rails 8.1 API** (`backend/`)
exposing a **GraphQL** API backed by PostgreSQL, and a **React** frontend (`frontend/`)
that consumes it. Authentication uses **Devise** with JWT.

## Requirements

- Docker and Docker Compose
- GNU Make

Everything else (Ruby, Node, PostgreSQL) runs inside containers.

## Getting started

```bash
make setup     # build images and create/migrate the databases
make db-seed   # optional: demo company and login admin@example.com / password123
make up        # start database, API and frontend
```

| Service   | URL                           |
| --------- | ----------------------------- |
| Frontend  | http://localhost:5173         |
| API       | http://localhost:3000         |
| GraphQL   | `POST http://localhost:3000/graphql` |
| GraphiQL (GraphQL playground, development only) | http://localhost:3000/graphiql |
| Swagger   | http://localhost:3000/api-docs |
| Sidekiq dashboard (basic auth, see Configuration) | http://localhost:3000/sidekiq |
| MailHog (captured emails) | http://localhost:8025         |

The frontend header links to Swagger, GraphiQL and the Sidekiq dashboard.

## Make targets

Run `make help` to list everything. The most used:

| Command | What it does |
| --- | --- |
| `make setup` | Build images and prepare the databases |
| `make up` / `make down` | Start / stop the stack |
| `make logs` | Follow container logs |
| `make rails CMD="routes"` | Run any Rails command in the backend container |
| `make db-migrate` / `make db-seed` / `make db-reset` | Database operations |
| `make test` | Run backend (RSpec) and frontend (Vitest) suites |
| `make test-backend` / `make test-frontend` | Run one suite |
| `make test-e2e` | Start the stack and run the Playwright E2E and API integration tests |
| `make lint` | RuboCop, Brakeman, ESLint and TypeScript checks |
| `make swagger` | Regenerate `backend/swagger/v1/swagger.yaml` from the request specs |
| `make graphql-schema` | Dump the GraphQL schema to `backend/schema.graphql` |

## Architecture

```
qulture-rocks/
├── backend/            Rails 8.1 API-only app (PostgreSQL, Devise, GraphQL, RSpec, rswag)
│   ├── app/models       Persistence and data validations only
│   ├── app/services     Business rules: Companies::*, Employees::*, Hierarchy::*, Auth::*
│   ├── app/graphql      Types, queries and mutations (thin: they call services)
│   └── spec/            Model, service, request and integration (Swagger) specs
├── frontend/           React + TypeScript + Vite, Apollo Client, React Router, Vitest
├── e2e/                Playwright: browser (ui/) and API integration (api/) tests
├── docs/sdd/           Spec-driven development: epics, user stories, Gherkin criteria
├── agents/             Agent definitions used to work on this repository
├── docker-compose.yml  db, redis, backend, sidekiq, mailhog, frontend and e2e services
└── Makefile            Single entry point for every workflow
```

Key decisions:

- **Service layer.** Controllers and GraphQL resolvers never contain business rules. Each
  operation is a small class (`Employees::AssignManager`, `Hierarchy::Peers`, ...) that
  returns a `Result` with `success?`, `record` and `errors`, so expected business failures
  are data, not exceptions.
- **Hierarchy model.** An employee has a single nullable `manager_id`, which enforces "at
  most one manager" at the database level. Loops are detected by walking the manager chain
  before an assignment is saved.
- **GraphQL for the domain, REST for authentication.** The organogram is queried and changed
  through GraphQL. Sign up, sign in and sign out are REST endpoints documented in Swagger
  because they are standard and easy to integrate.
- **Shared state in the frontend.** Server state lives in the Apollo cache; mutations refetch
  the affected queries so the organogram, lists and employee screens stay consistent. The
  session token is kept in `localStorage` and read by the Apollo link on every request.

## API

### Authentication (REST, documented in Swagger)

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create an account; returns `token` and `user` |
| `POST` | `/auth/login` | Sign in; returns `token` and `user` |
| `DELETE` | `/auth/logout` | Revoke the bearer token |
| `POST` | `/auth/password` | Email reset instructions; always answers `202` so no account is revealed |
| `PUT` | `/auth/password` | Set a new password with the token from the email |

Send the token as `Authorization: Bearer <token>`.

Sign-up sends a welcome email, and password reset sends its instructions by email. Both
emails are queued in Redis and delivered by the `sidekiq` service through SMTP; locally they
land in MailHog.

### Domain (GraphQL)

Query `companies(page, perPage)`, `company(id)`, `employee(id)`. Each `Employee` exposes `manager`,
`directReports`, `peers` and `secondLevelReports`.

Lists are paginated with `page` (starts at 1) and `perPage` (default 10, maximum 50). A page
returns `nodes`, `totalCount`, `page`, `perPage` and `totalPages`. Companies are paged with
`companies(page, perPage)`, and a company's employee list with `company.employeePage(page, perPage)`.
`company.employees` returns every employee and is used to draw the organogram.

Mutations: `createCompany`, `createEmployee`, `deleteEmployee`, `assignManager`.
Mutations return an `errors` list with business rule violations; an empty list means success.

```graphql
mutation {
  assignManager(employeeId: "2", managerId: "1") {
    employee { id name manager { name } }
    errors
  }
}
```

## Testing

- **Backend:** RSpec with FactoryBot and shoulda-matchers. Unit specs cover models and
  services; request specs cover the GraphQL endpoint; rswag specs cover the authentication
  endpoints and generate the Swagger document.
- **Frontend:** Vitest with Testing Library covering validation, forms, auth screens and the
  organogram rendering logic.
- **End-to-end:** Playwright in `e2e/`, running in Docker against the real stack: browser tests (`e2e/tests/ui`)
  for authentication, password recovery (reading the reset link from MailHog), companies, pagination and the
  organogram, and HTTP integration tests (`e2e/tests/api`) for the REST and GraphQL contracts. Run `make test-e2e`;
  it starts the stack, including Redis, Sidekiq and MailHog, and waits until it is healthy.
  Tests create their own users and companies, so they can be repeated against the same database.

Run `make test` for the unit and component suites. Specifications and the acceptance criteria they verify
are in [`docs/sdd`](docs/sdd/README.md).

## Configuration

Defaults work out of the box with Docker Compose. Optional environment variables:

| Variable | Default | Used by |
| --- | --- | --- |
| `DEVISE_JWT_SECRET_KEY` | `secret_key_base` | Signing JWT tokens (set it in production) |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |
| `VITE_API_URL` | `http://localhost:3000` | Frontend base URL for the API |
| `DATABASE_URL` | set by Compose | PostgreSQL connection |
| `FRONTEND_PUBLIC_URL` | `http://localhost:5173` | Base of the reset-password link in emails |
| `REDIS_URL` | `redis://redis:6379/0` | Sidekiq queue |
| `SMTP_ADDRESS` / `SMTP_PORT` | `mailhog` / `1025` (development) | Where emails are sent |
| `SMTP_ADDRESS` (required) / `SMTP_PORT` / `SMTP_USERNAME` / `SMTP_PASSWORD` | none / `587` (production) | Production SMTP relay |
| `SIDEKIQ_USERNAME` / `SIDEKIQ_PASSWORD` | unset (dashboard closed) | Basic auth for `/sidekiq`; Compose sets `admin` / `admin` for local development only |

The GraphiQL playground is mounted only in the development environment. Production must set
the SMTP and Sidekiq variables; the application fails to boot in production without `SMTP_ADDRESS`.

### Error messages and languages

Error messages are written in English in the code (`config/locales/en.yml`, and `translate` keys in
`frontend/src/lib/i18n.ts`) and translated to Brazilian Portuguese in `config/locales/pt-BR.yml`,
`config/locales/devise.pt-BR.yml` and the frontend `i18n.ts`. The API answers in the language of the
first `Accept-Language` tag: `pt-BR` or `pt` gets Portuguese, anything else gets English. The frontend
sends the browser language on every request. Emails and screen labels are still English.

## Known limitations

- Companies are shared by every signed-in user; there is no per-company authorization.
- Pictures are stored as URLs; there is no upload.
- The organogram loads every employee of a company (it is not paginated), because the tree needs all of them.
- The companies list is sorted by name; a newly created company appears on its page, not necessarily the first.
