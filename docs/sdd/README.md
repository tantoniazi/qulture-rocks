# Spec-Driven Development (SDD)

This project is built spec-first. Every feature starts as a user story with
acceptance criteria written in Gherkin, and only then receives code and tests.

## Workflow

1. **Epic** — a business capability, documented in `docs/sdd/epics/`.
2. **User story** — a single "As a user, I want..." item with an ID (`US-x.y`).
3. **Business rules** — invariants that must hold regardless of the interface (kept next to the epic).
4. **Acceptance criteria** — Gherkin scenarios attached to the story. Each scenario maps to automated tests.
5. **Implementation** — backend first (service layer + GraphQL), then frontend, always test-first.
6. **Verification** — `make test` and `make lint` must be green before a story is closed.

GitHub mirrors this structure: one issue per epic, one issue per user story, all
attached to the "Qulture Organogram" project board.

## Index

| Epic | Document | Stories |
| --- | --- | --- |
| EP-01 Authentication | [epics/01-authentication.md](epics/01-authentication.md) | AUTH-1 … AUTH-4 |
| EP-02 Company | [epics/02-company.md](epics/02-company.md) | US-1.1 … US-1.3 |
| EP-03 Employees | [epics/03-employees.md](epics/03-employees.md) | US-2.1 … US-2.3 |
| EP-04 Organogram | [epics/04-organogram.md](epics/04-organogram.md) | US-3.1 … US-3.4 |
| EP-05 Interface | [epics/05-interface.md](epics/05-interface.md) | UI-1 … UI-4 |

## Delivery priority

Stories are delivered in value order for the customer: authentication gates the
system, then companies and employees (the data foundation), then the reporting
lines that make the organogram useful, and finally the interface on top.

## Conventions

- Code, identifiers, tests, commit messages and documentation are in English.
- Business rules live in `backend/app/services`, never in controllers or GraphQL types.
- Every acceptance criterion is traceable to a spec; the spec file names are the
  source of truth for "what does the system do".
