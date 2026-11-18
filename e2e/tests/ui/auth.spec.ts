import { test, expect } from "@playwright/test";
import { newUser } from "../../support/data";
import { waitForEmail } from "../../support/mail";
import { signInThroughUi, signOutThroughUi, signUpThroughUi } from "../../support/ui";

test.describe("Authentication", () => {
  test("visitors are sent to the sign-in screen", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("signing up lands on the companies list with the user's name", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);

    await expect(page).toHaveURL("/");
    await expect(page.getByText(user.name)).toBeVisible();
  });

  test("signing up sends a welcome email", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);

    const body = await waitForEmail(user.email, "Welcome to Qulture Organogram");
    expect(body).toContain(`Hi ${user.name}`);
  });

  test("passwords that do not match are rejected before any request", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name", { exact: true }).fill("Ana");
    await page.getByLabel("Email", { exact: true }).fill("ana@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("different1");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("alert")).toHaveText("Passwords do not match");
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("a wrong password shows the server error", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);
    await signOutThroughUi(page);

    await signInThroughUi(page, user.email, "wrong-password");
    await expect(page.getByRole("alert")).toHaveText("Invalid email or password");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signing out blocks protected screens until signing in again", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);
    await signOutThroughUi(page);

    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);

    await signInThroughUi(page, user.email, user.password);
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
  });
});
