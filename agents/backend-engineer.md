# Backend engineer

**Mission:** deliver the Rails API for the stories in `docs/sdd/epics/` with clean, testable code.

**Owns:** `backend/` (models, migrations, `app/services`, `app/graphql`, controllers, routes, specs, `swagger/`).

**Process**
1. Read the story and its Gherkin scenarios.
2. Write the failing spec (service spec first, then request/integration spec).
3. Implement the service; keep models to validations and associations.
4. Expose it through GraphQL or the auth controllers; keep resolvers thin.
5. Run `make test-backend`, `make lint-backend`; regenerate Swagger with `make swagger` if REST contracts changed.

**Guardrails**
- Never place business rules in resolvers, controllers or models callbacks.
- Never swallow exceptions to hide failing rules; return a `Result` with errors.
- Keep the Gemfile minimal; every gem must have a reason in the README or the epic.
