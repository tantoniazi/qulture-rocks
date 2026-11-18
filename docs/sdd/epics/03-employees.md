# EP-03 — Employees

**Goal:** companies register the people who belong to them.

## Business rules

- An employee belongs to exactly one company.
- Name and email are required; the email is unique within the company (case-insensitive),
  but the same email may exist in different companies.
- Picture is optional and must be an `http(s)` URL.
- Deleting an employee does not delete their reports: they become employees without a manager.

## US-2.1 — Add an employee to a company

*As a user, I want to add an employee to a company (attributes: `name`, `email`, `picture`).*

```gherkin
Feature: Add employee

  Scenario: Adding an employee with a picture
    Given a company "Qulture" exists
    When I add an employee "Ana" with email "ana@example.com" and a picture URL to "Qulture"
    Then the employee is returned belonging to "Qulture"

  Scenario: Adding an employee without a picture
    When I add an employee "Ana" with email "ana@example.com" and no picture
    Then the employee is created with an empty picture

  Scenario: Rejecting a duplicated email inside the same company
    Given "ana@example.com" already works at "Qulture"
    When I add another employee with email "ana@example.com" to "Qulture"
    Then the errors list is not empty

  Scenario: Rejecting an invalid picture URL
    When I add an employee with picture "not a url"
    Then the errors list mentions the picture
```

Covered by: `spec/services/employees/create_spec.rb`, `spec/models/employee_spec.rb`, `spec/requests/graphql_spec.rb`.

## US-2.2 — List a company's employees

*As a user, I want to list the employees of a company.*

```gherkin
Feature: List employees

  Scenario: Listing employees of a company
    Given "Qulture" has employees "Ana" and "Bruno"
    When I query the company's employees
    Then I receive both employees ordered by name

  Scenario: Paginating a company's employees
    Given "Qulture" has 11 employees
    When I query the first page of its employees
    Then I receive 10 employees and the total count of 11
```

Covered by: `spec/requests/graphql_pagination_spec.rb`, `spec/requests/graphql_spec.rb`.

## US-2.3 — Remove an employee

*As a user, I want to delete an employee from a company.*

```gherkin
Feature: Remove employee

  Scenario: Deleting an employee
    Given an employee "Ana" exists
    When I delete "Ana"
    Then the operation succeeds
    And "Ana" no longer exists

  Scenario: Deleting a manager keeps the reports
    Given "Ana" manages "Bruno"
    When I delete "Ana"
    Then "Bruno" still exists and has no manager
```

Covered by: `spec/services/employees/destroy_spec.rb`, `spec/requests/graphql_spec.rb`.
