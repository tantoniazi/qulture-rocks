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

## AUTH-5 — Welcome email

*As a new user, I want a welcome email after I sign up, so I know my account exists.*

```gherkin
Feature: Welcome email

  Scenario: Signing up queues a welcome email
    When I sign up with a valid name and email
    Then a welcome email is queued for that address
    And Sidekiq delivers it through the SMTP server (MailHog locally)

  Scenario: An invalid sign-up sends nothing
    When I sign up with an invalid name
    Then no email is queued
```

Covered by: `spec/services/auth/register_spec.rb`, `spec/mailers/user_mailer_spec.rb`, `e2e/tests/ui/auth.spec.ts` (welcome email).

## AUTH-6 — Forgot password

*As a user who forgot my password, I want to reset it from a link sent by email.*

```gherkin
Feature: Password recovery

  Scenario: Requesting reset instructions
    When I submit an email on the forgot-password screen
    Then reset instructions are queued by email for a registered address
    And the response is the same for unknown emails, so no account is revealed

  Scenario: Choosing a new password
    Given I opened the link from the reset email
    When I submit a matching password of at least 8 characters
    Then I can sign in with the new password

  Scenario: An invalid reset token is refused
    When I submit a reset with an unknown token
    Then I see "Reset password token is invalid"
```

Covered by: `spec/services/auth/request_password_reset_spec.rb`, `spec/services/auth/reset_password_spec.rb`, `spec/integration/password_spec.rb`, `e2e/tests/ui/password-reset.spec.ts`.
