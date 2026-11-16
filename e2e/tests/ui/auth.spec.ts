import { test, expect } from "@playwright/test";
import { signUpThroughUi } from "../../support/ui";
import { newUser } from "../../support/data";

test.describe("Authentication screens", () => {
  test("signing up redirects to the companies list", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
  });

  test("signing up shows field errors before calling the API", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name", { exact: true }).fill("Ana");
    await page.getByLabel("Email", { exact: true }).fill("ana@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("different");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    // still on the sign-up screen: no request was sent
    await expect(page).toHaveURL("/signup");
  });
});
