import { test, expect } from "@playwright/test";
import { signUpThroughUi, gotoCompany } from "../../support/ui";
import {
  createCompanyViaGraphQL,
  createEmployeeViaGraphQL,
  graphql,
} from "../../support/api";
import { newUser, newCompanyName, newPerson } from "../../support/data";

test.describe("Organogram view", () => {
  test("an empty company invites to add the first employee", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);

    const token = await page.evaluate(() => {
      const raw = window.localStorage.getItem("qulture.session");
      return raw ? (JSON.parse(raw) as { token: string }).token : null;
    });

    const company = newCompanyName();
    const companyId = await createCompanyViaGraphQL(page.request, token, company);
    await gotoCompany(page, companyId, company);

    await expect(page.getByText(/Add the first one to start the organogram/)).toBeVisible();
  });

  test("renders the hierarchy from employees and their managers", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);

    const token = await page.evaluate(() => {
      const raw = window.localStorage.getItem("qulture.session");
      return raw ? (JSON.parse(raw) as { token: string }).token : null;
    });

    const company = newCompanyName();
    const companyId = await createCompanyViaGraphQL(page.request, token, company);

    const ana = newPerson("Ana");
    const bruno = newPerson("Bruno");
    const anaId = await createEmployeeViaGraphQL(page.request, token, companyId, ana);
    const brunoId = await createEmployeeViaGraphQL(page.request, token, companyId, bruno);

    // Make Ana the manager of Bruno via the GraphQL API.
    await graphql(
      page.request,
      `mutation { assignManager(employeeId: "${brunoId}", managerId: "${anaId}") { employee { id } errors } }`,
      token,
    );

    // Open the organogram and inspect the hierarchy.
    await gotoCompany(page, companyId, company);

    await expect(page.getByRole("link", { name: ana.name }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: bruno.name }).last()).toBeVisible();
  });
});
