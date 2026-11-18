import { expect, type Locator, type Page } from "@playwright/test";

interface Credentials {
  name: string;
  email: string;
  password: string;
}

export async function signUpThroughUi(page: Page, user: Credentials) {
  await page.goto("/signup");
  await page.getByLabel("Name", { exact: true }).fill(user.name);
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
}

export async function signInThroughUi(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function signOutThroughUi(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export async function createCompanyThroughUi(page: Page, name: string) {
  // Wait for the companies list to load before acting, so the test never races the initial query.
  const listLoaded = page.waitForResponse((response) => isOperation(response.request().postData(), "Companies"));
  await page.goto("/");
  await listLoaded;
  await page.getByLabel("Company name").fill(name);
  await page.getByRole("button", { name: "Create company" }).click();
  // The form clears only after the server accepted the company.
  await expect(page.getByLabel("Company name")).toHaveValue("");
}

// The list is sorted by name and paginated, so a company may sit on any page.
export async function goToCompanyInList(page: Page, name: string) {
  const link = page.getByRole("link", { name });
  const next = page.getByRole("button", { name: "Next" });
  await expect(page.locator("a.company-card").first()).toBeVisible();

  for (let current = 1; (await link.count()) === 0; current += 1) {
    await expect(next, `${name} is not on any page of the company list`).toBeEnabled();
    await Promise.all([
      page.waitForResponse((response) => isOperation(response.request().postData(), "Companies")),
      next.click(),
    ]);
    await expect(page.getByText(new RegExp(`^Page ${current + 1} of \\d+$`))).toBeVisible();
  }
  await expect(link).toBeVisible();
}

export async function openCompany(page: Page, name: string) {
  await goToCompanyInList(page, name);
  await page.getByRole("link", { name }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
}

// The "Add employee" card is the one containing that heading.
export function addEmployeeCard(page: Page): Locator {
  return page.locator("section.card", { has: page.getByRole("heading", { name: "Add employee" }) });
}

export async function addEmployeeThroughUi(page: Page, person: { name: string; email: string }) {
  const card = addEmployeeCard(page);
  await card.getByLabel("Name", { exact: true }).fill(person.name);
  await card.getByLabel("Email", { exact: true }).fill(person.email);
  await card.getByRole("button", { name: "Add employee" }).click();
  await expect(employeeLink(page, person.name)).toBeVisible();
}

// Employee names appear both in the organogram and in the employee list, so the list is scoped explicitly.
export function employeesCard(page: Page): Locator {
  return page.locator("section.card", { has: page.getByRole("heading", { name: "Employees" }) });
}

export function employeeLink(page: Page, name: string): Locator {
  return employeesCard(page).getByRole("link", { name });
}

export function isOperation(body: string | null, operationName: string): boolean {
  return (body ?? "").includes(`"operationName":"${operationName}"`);
}
