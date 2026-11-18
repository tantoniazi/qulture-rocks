# CLAUDE.md — Qulture Organogram

Guidance for AI agents and contributors working in this repository.

## Project

Monorepo for an organogram application:

- `backend/` — Rails 8.1 API-only, PostgreSQL, Devise + JWT, GraphQL (`graphql` gem), RSpec, rswag (Swagger).
- `frontend/` — React 19 + TypeScript + Vite, Apollo Client, React Router, Vitest + Testing Library.
- `docs/sdd/` — specifications (epics, user stories, Gherkin). Specs come before code.
- `e2e/` — Playwright end-to-end tests (browser and API integration) run against the Docker stack.
- `agents/` — role definitions for agents working on this repo.

## Non-negotiable rules

1. **Everything in English**: code, identifiers, comments, tests, commit messages, docs, UI copy.
2. **Use Make and Docker** for every workflow. Do not install Ruby or Node on the host.
   - `make setup`, `make up`, `make test`, `make lint`, `make swagger`, `make graphql-schema`.
3. **Business rules live in services** (`backend/app/services`). Models hold data validations;
   GraphQL types and mutations only translate input/output and call services.
4. **Clean code**: small methods, intention-revealing names, no dead code, no commented-out code,
   early returns, no speculative abstractions.
5. **Test-first** for business rules: write or update the spec (SDD) and the failing test, then the code.
6. **Keep the docs current**: when behaviour changes, update the epic in `docs/sdd/epics`, the
   Swagger document (`make swagger`) and the README.
7. Do not commit secrets. `.env*` files and `master.key` are ignored.

## Conventions

- Ruby: RuboCop (`rubocop-rails-omakase`) must pass; Brakeman must report no warnings.
- Services return `ApplicationService::Result` (`success?`, `record`, `errors`); they do not raise for business failures.
- Hierarchy queries are `ApplicationQuery` objects returning relations.
- Frontend: function components, hooks, no class components. Server data comes from Apollo;
  do not copy it into React state. Forms keep local state only for their inputs.
- Frontend tests live next to the code (`*.test.ts(x)`); Gherkin scenarios in the epics name the tests that cover them.

## Commands

```bash
make setup          # first time: build images and prepare databases
make up             # start the stack (API :3000, frontend :5173)
make test           # RSpec + Vitest (unit and component)
make test-e2e       # Playwright: UI and API integration tests against the running stack (starts it if needed)
make lint           # RuboCop, Brakeman, ESLint, TypeScript
make swagger        # regenerate Swagger after changing request specs in backend/spec/integration
make graphql-schema # regenerate backend/schema.graphql
```

## Working with agents

See [`agents/README.md`](agents/README.md) for the roles and the skills used in this project.
Skills in `.claude/skills/` are copies of the Superpowers workflow skills used here:
brainstorm and plan before building, TDD, systematic debugging, verification before claiming success.
