import { test, expect } from "@playwright/test";
import { signUp, signIn, graphql } from "../../support/api";
import { newUser } from "../../support/data";

test.describe("Authentication (REST)", () => {
  test("sign up with valid data returns 201, token and user", async ({ request }) => {
    const user = newUser();
    const session = await signUp(request, user);

    expect(session.token).toBeTruthy();
    expect(session.user.email).toBe(user.email);
    expect(session.user.name).toBe(user.name);
  });

  test("rejects an invalid sign up with 422", async ({ request }) => {
    const response = await request.post("/auth/signup", {
      data: { user: { name: "", email: "bad", password: "123", password_confirmation: "123" } },
    });
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.errors).toBeTruthy();
  });

  test("rejects an email that is already registered (case-insensitive)", async ({ request }) => {
    const user = newUser();
    await signUp(request, user);

    const response = await request.post("/auth/signup", {
      data: {
        user: {
          name: user.name,
          email: user.email.toUpperCase(),
          password: "password123",
          password_confirmation: "password123",
        },
      },
    });
    expect(response.status()).toBe(422);
  });

  test("sign in with correct credentials returns a token", async ({ request }) => {
    const user = newUser();
    await signUp(request, user);

    const session = await signIn(request, { email: user.email, password: user.password });
    expect(session.token).toBeTruthy();
    expect(session.user.email).toBe(user.email);
  });

  test("sign in with a wrong password returns 401", async ({ request }) => {
    const user = newUser();
    await signUp(request, user);

    const response = await request.post("/auth/login", {
      data: { user: { email: user.email, password: "wrong-password" } },
    });
    expect(response.status()).toBe(401);
  });

  test("sign out revokes the token and GraphQL rejects it", async ({ request }) => {
    const user = newUser();
    const session = await signUp(request, user);

    const logout = await request.delete("/auth/logout", {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    expect(logout.status()).toBe(204);

    const gql = await graphql(request, "{ companies { id } }", session.token);
    expect(gql.status).toBe(401);
  });
});
