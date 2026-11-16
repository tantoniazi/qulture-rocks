# Agents

Roles used to build and review this repository. Each agent works within its scope and follows [`CLAUDE.md`](../CLAUDE.md).

| Agent | Scope | Definition |
| --- | --- | --- |
| Backend engineer | `backend/` — models, services, GraphQL, auth, specs, Swagger | [backend-engineer.md](backend-engineer.md) |
| Frontend engineer | `frontend/` — screens, Apollo queries and mutations, components, tests | [frontend-engineer.md](frontend-engineer.md) |
| Spec reviewer | `docs/sdd/` — checks that code, specs and tests agree | [spec-reviewer.md](spec-reviewer.md) |

## Skills used

The skills live in [`.claude/skills/`](../.claude/skills) so anyone cloning the repository has the same workflow:

- `brainstorming` — explore intent and design before creative work.
- `writing-plans` — turn an approved spec into a step-by-step plan.
- `executing-plans` — carry out a plan with checkpoints.
- `test-driven-development` — red, green, refactor for every business rule.
- `systematic-debugging` — root cause before fixes.
- `verification-before-completion` — run the commands and read the output before claiming success.
- `requesting-code-review` — review checklist before merging.
- `frontend-design` — visual decisions for the React screens.

## Hand-off rules

- An agent that changes behaviour updates the matching epic in `docs/sdd/epics` in the same change.
- Work is done when `make test` and `make lint` pass and the acceptance criteria are covered by specs.
