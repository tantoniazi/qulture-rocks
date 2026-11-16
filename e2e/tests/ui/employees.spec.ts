import { test, expect } from "@playwright/test";
import { signUpThroughUi, gotoCompany } from "../../support/ui";
import {
  createCompanyViaGraphQL,
  createEmployeeViaGraphQL,
  graphql,
} from "../../support/api";
import { newUser, newCompanyName, newPerson } from "../../support/data";

test.describe("Employee screen", () => {
  test("shows manager, direct reports, peers and second-level reports", async ({ page }) => {
    const user = newUser();
    await signUpThroughUi(page, user);

    // Recover the session token from localStorage so we can seed data via GraphQL.
    const token = await page.evaluate(() => {
      const raw = window.localStorage.getItem("qulture.session");
      return raw ? (JSON.parse(raw) as { token: string }).token : null;
    });

    const company = newCompanyName();
    const companyId = await createCompanyViaGraphQL(page.request, token, company);

    const carla = newPerson("Carla");
    const ana = newPerson("Ana");
    const bruno = newPerson("Bruno");
    const diego = newPerson("Diego");
    const carlaId = await createEmployeeViaGraphQL(page.request, token, companyId, carla);
    const anaId = await createEmployeeViaGraphQL(page.request, token, companyId, ana);
    const brunoId = await createEmployeeViaGraphQL(page.request, token, companyId, bruno);
    const diegoId = await createEmployeeViaGraphQL(page.request, token, companyId, diego);

    // Ana and Bruno report to Carla; Diego reports to Ana.
    await graphql(
      page.request,
      `mutation { assignManager(employeeId: "${anaId}", managerId: "${carlaId}") { employee { id } errors } }`,
      token,
    );
    await graphql(
      page.request,
      `mutation { assignManager(employeeId: "${brunoId}", managerId: "${carlaId}") { employee { id } errors } }`,
      token,
    );
    await graphql(
      page.request,
      `mutation { assignManager(employeeId: "${diegoId}", managerId: "${anaId}") { employee { id } errors } }`,
      token,
    );

    // Carla's screen: direct reports Ana and Bruno; second-level Diego.
    await gotoCompany(page, companyId, company);
    await page.getByRole("link", { name: carla.name }).last().click();
    await expect(page.getByRole("heading", { name: carla.name })).toBeVisible();

    await expect(page.getByRole("link", { name: ana.name }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: bruno.name }).last()).toBeVisible();
    await expect(page.getByText("Direct reports")).toBeVisible();
    await expect(page.getByText("Second-level reports")).toBeVisible();
    await expect(page.getByRole("link", { name: diego.name }).last()).toBeVisible();

    // Ana's screen: manager Carla, peer Bruno.
    await page.getByRole("link", { name: /← Back to/ }).click();
    await gotoCompany(page, companyId, company);
    await page.getByRole("link", { name: ana.name }).last().click();
    await expect(page.locator('p', { hasText: /Reports to/ })).toBeVisible();
    await expect(page.getByRole("link", { name: carla.name }).last()).toBeVisible();
    await expect(page.getByText("Peers")).toBeVisible();
    await expect(page.getByRole("link", { name: bruno.name }).last()).toBeVisible();
  });
});
