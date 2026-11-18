# EP-05 — Interface

**Goal:** a React application consumes the GraphQL API and makes the organogram easy to
read and maintain. Server state is owned by Apollo Client; local state is limited to form inputs.

## UI-1 — Sign up and sign in screens

```gherkin
Feature: Authentication screens

  Scenario: Signing in redirects to the companies list
    Given I am on the sign-in screen
    When I submit valid credentials
    Then I am redirected to the companies list

  Scenario: Signing up shows field errors before calling the API
    Given I am on the sign-up screen
    When I submit mismatching passwords
    Then I see "Passwords do not match" and no request is sent
```

Covered by: `frontend/src/features/auth/*.test.tsx`.

## UI-2 — Companies screen

```gherkin
Feature: Companies screen

  Scenario: Creating a company refreshes the list
    Given I am on the companies screen
    When I create a company
    Then it appears in the list without reloading the page
```

Covered by: `e2e/tests/ui/companies.spec.ts` (a new company appears in the list).

## UI-3 — Organogram view

*The company screen draws the hierarchy from the employees and their managers, like the challenge's reference chart.*

```gherkin
Feature: Organogram

  Scenario: Rendering the hierarchy
    Given "Ana" manages "Bruno" and "Carla"
    When I open the company
    Then I see "Ana" at the top and "Bruno" and "Carla" below her

  Scenario: Empty company
    Given a company without employees
    When I open the company
    Then I see a message inviting me to add the first employee
```

Covered by: `frontend/src/features/organogram/*.test.ts(x)` (rendering) and `e2e/tests/ui/companies.spec.ts` (empty company).

## UI-4 — Employee screen

```gherkin
Feature: Employee screen

  Scenario: Showing the reporting lines
    Given I open an employee
    Then I see their manager, direct reports, peers and second-level reports
    And I can change their manager from a list of employees of the same company
```

Covered by: `e2e/tests/ui/organogram.spec.ts` (manager, direct reports, peers, second-level reports and manager change).

## UI-5 — Developer tools in the header

*As a developer, I want the API documentation and tools one click away.*

```gherkin
Feature: Developer tools

  Scenario: Swagger, GraphiQL and Sidekiq are linked from the top bar
    When I open any screen
    Then the header links to the Swagger documentation, GraphiQL and the Sidekiq dashboard
```

Covered by: `e2e/tests/ui/companies.spec.ts` (developer tools are linked from the header).

## UI-6 — Paginated lists

*As a user with many companies or employees, I want to browse them page by page.*

```gherkin
Feature: Paginated lists

  Scenario: Moving to the next page of companies
    Given there are more companies than fit on one page
    When I press "Next"
    Then the URL shows the next page and the screen shows "Page 2 of N"
```

Covered by: `e2e/tests/ui/companies.spec.ts` (paginated list), `frontend/src/components/Pagination.test.tsx`, `frontend/src/lib/pagination.test.ts`.

## UI-7 — Forgot and reset password screens

*As a user who forgot my password, I want screens to request and set a new one.*

```gherkin
Feature: Password recovery screens

  Scenario: Asking for reset instructions
    Given I am on the sign-in screen
    When I follow "Forgot your password?" and submit my email
    Then I see "Check your email"

  Scenario: Setting a new password
    Given I opened the reset link from the email
    When I enter a matching password of at least 8 characters
    Then I see "Password updated"
```

Covered by: `e2e/tests/ui/password-reset.spec.ts`, `frontend/src/features/auth/validation.test.ts`.
