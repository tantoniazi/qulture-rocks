# EP-04 — Organogram

**Goal:** express who reports to whom and expose the reporting lines around an employee.

## Business rules

- Both employees of a reporting line must belong to the same company.
- Each employee has at most one manager. Assigning a new manager replaces the previous one.
- An employee cannot manage themselves.
- No loops: a person below a leader in the hierarchy cannot be that leader's leader.
- "Peers" are the other people who share the same manager.
- "Second-level reports" are the reports of the employee's direct reports.

## US-3.1 — Assign a manager

*As a user, I want to set an employee as the manager of another employee.*

```gherkin
Feature: Assign manager

  Scenario: Assigning a manager in the same company
    Given "Ana" and "Bruno" work at "Qulture"
    When I make "Ana" the manager of "Bruno"
    Then "Bruno" reports to "Ana"

  Scenario: Replacing an existing manager
    Given "Bruno" reports to "Ana"
    When I make "Carla" the manager of "Bruno"
    Then "Bruno" reports to "Carla" only

  Scenario: Removing a manager
    Given "Bruno" reports to "Ana"
    When I assign no manager to "Bruno"
    Then "Bruno" has no manager

  Scenario: Rejecting a manager from another company
    Given "Ana" works at "Qulture" and "Bruno" works at "Acme"
    When I make "Ana" the manager of "Bruno"
    Then the errors list contains "Manager must belong to the same company"

  Scenario: Rejecting self-management
    When I make "Ana" the manager of "Ana"
    Then the errors list contains "An employee cannot be their own manager"

  Scenario: Rejecting a loop
    Given "Bruno" reports to "Ana" and "Carla" reports to "Bruno"
    When I make "Carla" the manager of "Ana"
    Then the errors list contains "Assignment would create a hierarchy loop"
```

Covered by: `spec/services/employees/assign_manager_spec.rb`, `spec/requests/graphql_spec.rb`.

## US-3.2 — List peers

*As a user, I want to list the peers of an employee (everyone who shares their manager).*

```gherkin
Feature: Peers

  Scenario: Listing peers
    Given "Ana" and "Bruno" report to "Carla"
    When I query the peers of "Ana"
    Then I receive "Bruno" and not "Ana"

  Scenario: An employee without a manager has no peers
    When I query the peers of "Carla"
    Then the list is empty
```

Covered by: `spec/services/hierarchy/peers_spec.rb`.

## US-3.3 — List direct reports

*As a user, I want to list the people who report directly to an employee.*

```gherkin
Feature: Direct reports

  Scenario: Listing direct reports
    Given "Ana" and "Bruno" report to "Carla" and "Diego" reports to "Ana"
    When I query the direct reports of "Carla"
    Then I receive "Ana" and "Bruno" only
```

Covered by: `spec/services/hierarchy/direct_reports_spec.rb`, `spec/requests/graphql_spec.rb`.

## US-3.4 — List second-level reports

*As a user, I want to list the reports of an employee's direct reports.*

```gherkin
Feature: Second-level reports

  Scenario: Listing second-level reports
    Given "Ana" reports to "Carla" and "Diego" reports to "Ana"
    When I query the second-level reports of "Carla"
    Then I receive "Diego" only
```

Covered by: `spec/services/hierarchy/second_level_reports_spec.rb`.
