import { test, expect } from "@playwright/test";
import { newCompanyName, newUser } from "../../support/data";
import { graphql } from "../../support/api";
import { createCompanyThroughUi, goToCompanyInList, openCompany, signUpThroughUi } from "../../support/ui";

test.describe("Companies", () => {
  test.beforeEach(async ({ page }) => {
    await signUpThroughUi(page, newUser());
  });

  test("developer tools are linked from the header", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Swagger" })).toHaveAttribute("href", /\/api-docs$/);
    await expect(page.getByRole("link", { name: "GraphiQL" })).toHaveAttribute("href", /\/graphiql$/);
    await expect(page.getByRole("link", { name: "Sidekiq" })).toHaveAttribute("href", /\/sidekiq$/);
  });

  test("the company list is paginated", async ({ page, request }) => {
    const token: string = await page.evaluate(() => JSON.parse(window.localStorage.getItem("qulture.session") ?? "null").token);
    for (let index = 0; index < 11; index += 1) {
      await graphql(request, `mutation { createCompany(name: "${newCompanyName()}") { company { id } errors } }`, token);
    }

    await page.goto("/");
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();

    await expect(page).toHaveURL(/\?page=2$/);
    await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();
  });

  test("a new company appears in the list", async ({ page }) => {
    const name = newCompanyName();
    await createCompanyThroughUi(page, name);

    await goToCompanyInList(page, name);
    await expect(page.getByRole("link", { name })).toContainText("0 employees");
  });

  test("a company without employees invites the first employee", async ({ page }) => {
    const name = newCompanyName();
    await createCompanyThroughUi(page, name);
    await openCompany(page, name);

    await expect(page.getByText("No employees yet. Add the first one to start the organogram.")).toBeVisible();
  });

  test("a duplicated company name shows the validation error", async ({ page }) => {
    const name = newCompanyName();
    await createCompanyThroughUi(page, name);

    await page.getByLabel("Company name").fill(name.toUpperCase());
    await page.getByRole("button", { name: "Create company" }).click();

    await expect(page.getByRole("alert")).toContainText("Name has already been taken");
  });
});
