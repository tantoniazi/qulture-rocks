# EP-01 — Authentication

**Goal:** only registered users can read or change the organogram. Authentication is
handled by Devise (password hashing and validations) with JWT bearer tokens for the API.

**Rationale:** the challenge brief says authentication is optional, but the product
needs sign-up and sign-in screens, so the API protects its data from day one.

## Business rules

- Email is unique and case-insensitive.
- Password has at least 8 characters.
- A token is valid for 24 hours.
- Signing out revokes the current token (its `jti` is stored in a denylist).

## AUTH-1 — Sign up

*As a visitor, I want to create an account so that I can access the organogram.*

```gherkin
Feature: Sign up

  Scenario: Creating an account with valid data
    Given I am not registered
    When I sign up with name "Ana", email "ana@example.com" and a matching password of 8+ characters
    Then I receive a 201 response
    And the response contains a JWT token and my user data

  Scenario: Rejecting an invalid sign up
    When I sign up with an empty name, an invalid email and a short password
    Then I receive a 422 response
    And the response lists the validation errors

  Scenario: Rejecting an email that is already registered
    Given a user "ana@example.com" exists
    When I sign up with email "ANA@example.com"
    Then I receive a 422 response
```

Covered by: `spec/integration/auth_spec.rb`, `spec/services/auth/register_spec.rb`, `spec/models/user_spec.rb`.

## AUTH-2 — Sign in

*As a registered user, I want to sign in so that I can use the system.*

```gherkin
Feature: Sign in

  Scenario: Signing in with correct credentials
    Given a user "ana@example.com" with password "password123" exists
    When I sign in with "ana@example.com" and "password123"
    Then I receive a 200 response with a JWT token

  Scenario: Signing in with a wrong password
    Given a user "ana@example.com" exists
    When I sign in with "ana@example.com" and a wrong password
    Then I receive a 401 response with "Invalid email or password"
```

Covered by: `spec/integration/auth_spec.rb`, `spec/services/auth/sign_in_spec.rb`.

## AUTH-3 — Sign out

*As a signed-in user, I want to sign out so that my token can no longer be used.*

```gherkin
Feature: Sign out

  Scenario: Revoking the current token
    Given I am signed in
    When I call sign out with my token
    Then I receive a 204 response
    And the same token is rejected by the GraphQL endpoint

  Scenario: Signing out with an invalid token
    When I call sign out with a malformed token
    Then I receive a 401 response
```

Covered by: `spec/integration/auth_spec.rb`, `spec/services/auth/sign_out_spec.rb`.

## AUTH-4 — Protected data

*As the system owner, I want every data operation to require authentication.*

```gherkin
Feature: Protected GraphQL endpoint

  Scenario: Requests without a token are rejected
    When I send any GraphQL query without an Authorization header
    Then I receive a 401 response
```

Covered by: `spec/requests/graphql_spec.rb`.
