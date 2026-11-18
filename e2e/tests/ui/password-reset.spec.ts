import { test, expect } from "@playwright/test";
import { newUser } from "../../support/data";
import { extractResetToken, waitForEmail } from "../../support/mail";
import { signInThroughUi, signOutThroughUi, signUpThroughUi } from "../../support/ui";

test.describe("Password recovery", () => {
  test("a forgotten password is reset from the link in the email", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);
    await signOutThroughUi(page);

    await page.goto("/forgot-password");
    await page.getByLabel("Email", { exact: true }).fill(user.email);
    await page.getByRole("button", { name: "Send instructions" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

    const body = await waitForEmail(user.email, "Reset password instructions");
    await page.goto(`/reset-password?token=${extractResetToken(body)}`);

    const newPassword = "brand-new-password";
    await page.getByLabel("New password", { exact: true }).fill(newPassword);
    await page.getByLabel("Confirm password").fill(newPassword);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();

    await signInThroughUi(page, user.email, newPassword);
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
  });

  test("the reset form rejects a password that is too short", async ({ page }) => {
    await page.goto("/reset-password?token=anything");
    await page.getByLabel("New password", { exact: true }).fill("short");
    await page.getByLabel("Confirm password").fill("short");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByRole("alert")).toHaveText("Password must have at least 8 characters");
  });

  test("a reset link with an invalid token is refused by the server", async ({ page }) => {
    await page.goto("/reset-password?token=not-a-real-token");
    await page.getByLabel("New password", { exact: true }).fill("brand-new-password");
    await page.getByLabel("Confirm password").fill("brand-new-password");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByRole("alert")).toHaveText("Reset password token is invalid");
  });
});
