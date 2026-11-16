# Backend

Rails 8.1 API-only application. See the [root README](../README.md) for setup, Make targets and architecture.

Quick reference:

- Services with business rules: `app/services`
- GraphQL schema: `app/graphql`; dump with `make graphql-schema`
- Specs: `spec/`; Swagger document: `swagger/v1/swagger.yaml` (regenerate with `make swagger`)
