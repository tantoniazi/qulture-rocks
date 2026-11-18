import { test, expect } from "@playwright/test";
import { graphql, signIn, signOut, signUp } from "../../support/api";
import { newUser } from "../../support/data";

test.describe("Authentication endpoints", () => {
  test("sign up returns 201 with a token and the user", async ({ request }) => {
    const user = newUser();
    const session = await signUp(request, user);

    expect(session.token).toBeTruthy();
    expect(session.user).toMatchObject({ name: user.name, email: user.email });
  });

  test("invalid sign up returns 422 with errors", async ({ request }) => {
    const response = await request.post("/auth/signup", {
      data: { user: { name: "", email: "not-an-email", password: "123", password_confirmation: "123" } },
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).errors.length).toBeGreaterThan(0);
  });

  test("an email already registered in another case is rejected", async ({ request }) => {
    const user = newUser();
    await signUp(request, user);

    const response = await request.post("/auth/signup", {
      data: {
        user: { name: user.name, email: user.email.toUpperCase(), password: user.password, password_confirmation: user.password },
      },
    });
    expect(response.status()).toBe(422);
  });

  test("sign in with correct credentials returns a token", async ({ request }) => {
    const user = newUser();
    await signUp(request, user);

    const response = await signIn(request, user.email, user.password);
    expect(response.status()).toBe(200);
    expect((await response.json()).token).toBeTruthy();
  });

  test("sign in with a wrong password returns 401", async ({ request }) => {
    const user = newUser();
    await signUp(request, user);

    const response = await signIn(request, user.email, "wrong-password");
    expect(response.status()).toBe(401);
  });

  test("sign out revokes the token for the GraphQL endpoint", async ({ request }) => {
    const session = await signUp(request, newUser());
    const before = await graphql(request, "{ companies { id } }", session.token);
    expect(before.status).toBe(200);

    const logout = await signOut(request, session.token);
    expect(logout.status()).toBe(204);

    const after = await graphql(request, "{ companies { id } }", session.token);
    expect(after.status).toBe(401);
  });
});
