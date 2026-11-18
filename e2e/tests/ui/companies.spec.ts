import { test, expect } from "@playwright/test";
import { newCompanyName, newUser } from "../../support/data";
import { createCompanyThroughUi, signUpThroughUi } from "../../support/ui";

test.describe("Companies", () => {
  test.beforeEach(async ({ page }) => {
    await signUpThroughUi(page, newUser());
  });

  test("a new company appears in the list", async ({ page }) => {
    const name = newCompanyName();
    await createCompanyThroughUi(page, name);

    await expect(page.getByRole("link", { name })).toContainText("0 employees");
  });

  test("a duplicated company name shows the validation error", async ({ page }) => {
    const name = newCompanyName();
    await createCompanyThroughUi(page, name);

    await page.getByLabel("Company name").fill(name.toUpperCase());
    await page.getByRole("button", { name: "Create company" }).click();

    await expect(page.getByRole("alert")).toContainText("Name has already been taken");
  });
});
