import { test, expect } from "@playwright/test";
import { newCompanyName, newPerson, newUser } from "../../support/data";
import {
  addEmployeeThroughUi,
  createCompanyThroughUi,
  employeeLink,
  employeesCard,
  openCompany,
  signUpThroughUi,
} from "../../support/ui";

test.describe("Organogram and employees", () => {
  let companyName: string;
  const manager = newPerson("Manager");
  const report = newPerson("Report");

  test.beforeEach(async ({ page }) => {
    await signUpThroughUi(page, newUser());
    companyName = newCompanyName();
    await createCompanyThroughUi(page, companyName);
    await openCompany(page, companyName);
    await addEmployeeThroughUi(page, manager);
    await addEmployeeThroughUi(page, report);
  });

  test("assigning a manager draws the reporting line in the organogram", async ({ page }) => {
    await employeeLink(page, report.name).click();
    await page.getByLabel("Reports to").selectOption({ label: manager.name });
    await page.getByRole("button", { name: "Save manager" }).click();
    await expect(page.getByRole("link", { name: manager.name })).toBeVisible();

    await openCompanyFromEmployee(page, companyName);
    const chart = page.getByLabel("Organogram");
    await expect(chart.getByRole("link", { name: manager.name })).toBeVisible();
    await expect(chart.getByRole("link", { name: report.name })).toBeVisible();
  });

  test("the manager's page lists the direct report", async ({ page }) => {
    await employeeLink(page, report.name).click();
    await page.getByLabel("Reports to").selectOption({ label: manager.name });
    await page.getByRole("button", { name: "Save manager" }).click();
    await expect(page.getByRole("link", { name: manager.name })).toBeVisible();

    await page.getByRole("link", { name: manager.name }).click();
    const directReports = page.locator("section.card", { has: page.getByRole("heading", { name: "Direct reports" }) });
    await expect(directReports.getByRole("link", { name: report.name })).toBeVisible();
  });

  test("a loop in the hierarchy is refused with a clear message", async ({ page }) => {
    await employeeLink(page, report.name).click();
    await page.getByLabel("Reports to").selectOption({ label: manager.name });
    await page.getByRole("button", { name: "Save manager" }).click();
    await expect(page.getByRole("link", { name: manager.name })).toBeVisible();

    await page.getByRole("link", { name: manager.name }).click();
    await page.getByLabel("Reports to").selectOption({ label: report.name });
    await page.getByRole("button", { name: "Save manager" }).click();

    await expect(page.getByRole("alert")).toHaveText("Assignment would create a hierarchy loop");
  });

  test("removing an employee takes them out of the company", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.accept());
    const row = employeesCard(page).locator("li", { has: page.getByRole("link", { name: report.name, exact: true }) });
    await row.getByRole("button", { name: "Remove" }).click();

    await expect(employeeLink(page, report.name)).toHaveCount(0);
    await expect(employeeLink(page, manager.name)).toBeVisible();
  });
});

async function openCompanyFromEmployee(page: import("@playwright/test").Page, name: string) {
  await page.getByRole("link", { name: /Back to/ }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
}
