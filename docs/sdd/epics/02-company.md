# EP-02 — Company

**Goal:** users can register companies and browse them. A company is the boundary
of an organogram: employees and reporting lines never cross companies.

## Business rules

- A company has a name (up to 120 characters), unique regardless of letter case.
- Companies are shared by all authenticated users (the system is single-tenant).

## US-1.1 — Create a company

*As a user, I want to create a company (attributes: `name`).*

```gherkin
Feature: Create company

  Scenario: Creating a company
    Given I am signed in
    When I create a company named "Qulture"
    Then the company is returned with an id and its name
    And the errors list is empty

  Scenario: Rejecting a blank name
    When I create a company with an empty name
    Then the errors list contains "Name can't be blank"
    And no company is created

  Scenario: Rejecting a duplicated name
    Given a company named "Qulture" exists
    When I create a company named "QULTURE"
    Then the errors list is not empty
```

Covered by: `spec/services/companies/create_spec.rb`, `spec/requests/graphql_spec.rb`.

## US-1.2 — List companies

*As a user, I want to list the companies in the system.*

```gherkin
Feature: List companies

  Scenario: Listing companies alphabetically
    Given companies "Zeta" and "Alpha" exist
    When I query the companies
    Then I receive "Alpha" followed by "Zeta"
```

Covered by: `spec/requests/graphql_spec.rb`.

## US-1.3 — View a company

*As a user, I want to see a company and its employees.*

```gherkin
Feature: View company

  Scenario: Viewing an existing company
    Given a company "Qulture" with employees exists
    When I query the company by its id
    Then I receive its name and its employees

  Scenario: Viewing an unknown company
    When I query a company with an id that does not exist
    Then the company is null
```

Covered by: `spec/requests/graphql_spec.rb`.
