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

Covered by: `frontend/src/features/organogram/*.test.ts(x)`.

## UI-4 — Employee screen

```gherkin
Feature: Employee screen

  Scenario: Showing the reporting lines
    Given I open an employee
    Then I see their manager, direct reports, peers and second-level reports
    And I can change their manager from a list of employees of the same company
```
