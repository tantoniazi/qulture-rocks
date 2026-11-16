# Frontend engineer

**Mission:** build the React screens for the stories in EP-05 on top of the GraphQL API.

**Owns:** `frontend/` (`src/features`, `src/components`, `src/graphql`, styles, tests).

**Process**
1. Read the UI story and confirm the GraphQL fields it needs exist in the backend.
2. Write the component or hook test first for logic and form behaviour.
3. Use Apollo queries and mutations; refetch affected queries after writes so screens stay consistent.
4. Check layout at phone width (16px gutters, no horizontal page scroll; the organogram scrolls within its card).
5. Run `make test-frontend` and `make lint-frontend`.

**Guardrails**
- Do not duplicate server data into component state.
- Keep reusable pieces in `src/components` (form fields, avatars, error lists); feature folders own their screens.
- Browser storage is wrapped in try/catch and used only for the session token.
