import { expect, type Page } from "@playwright/test";

export async function signUpThroughUi(page: Page, user: { name: string; email: string; password: string }) {
  await page.goto("/signup");
  await page.getByLabel("Name", { exact: true }).fill(user.name);
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
}

export async function signOutThroughUi(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export async function createCompanyThroughUi(page: Page, name: string) {
  await page.goto("/");
  await page.getByLabel("Company name").fill(name);
  await page.getByRole("button", { name: "Create company" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);
  await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
}

export async function openCompany(page: Page, name: string) {
  await page.getByRole("link", { name: new RegExp(name) }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await page.waitForLoadState("networkidle");
}

export async function gotoCompany(page: Page, companyId: string, companyName: string) {
  await page.goto(`/companies/${companyId}`);
  await expect(page.getByRole("heading", { name: companyName })).toBeVisible();
  await page.waitForLoadState("networkidle");
}

export async function addEmployeeThroughUi(page: Page, person: { name: string; email: string }) {
  await page.locator('h2:has-text("Add employee")').waitFor({ state: "visible", timeout: 15000 });
  await page.getByLabel("Name", { exact: true }).fill(person.name);
  await page.getByLabel("Email", { exact: true }).fill(person.email);
  await page.getByRole("button", { name: "Add employee" }).click();
  await expect(page.getByRole("link", { name: person.name })).toBeVisible();
}
