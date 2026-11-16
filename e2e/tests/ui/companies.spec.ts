import { test, expect } from "@playwright/test";
import { signUpThroughUi, createCompanyThroughUi } from "../../support/ui";
import { newUser, newCompanyName } from "../../support/data";

test.describe("Companies screen", () => {
  test("creating a company appears in the list without reloading the page", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);

    const name = newCompanyName();
    await createCompanyThroughUi(page, name);

    await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
  });
});
