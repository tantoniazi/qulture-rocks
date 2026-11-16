import { test, expect } from "@playwright/test";
import { signUp, graphql } from "../../support/api";
import { newUser, newCompanyName } from "../../support/data";

async function createCompany(request: any, token: string, name: string) {
  const data = await graphql(request, `mutation { createCompany(name: "${name}") { company { id name } errors } }`, token);
  return data.data?.createCompany;
}

async function companyIdByName(request: any, token: string, name: string) {
  const data = await graphql(request, "{ companies { id name } }", token);
  const company = data.data?.companies.find((c: { name: string }) => c.name === name);
  return company?.id ?? null;
}

test.describe("Companies (GraphQL)", () => {
  test("lists companies ordered by name", async ({ request }) => {
    const session = await signUp(request, newUser());
    await createCompany(request, session.token, "Zeta");
    await createCompany(request, session.token, "Alpha");

    const data = await graphql(request, "{ companies { name } }", session.token);
    const names = (data.data?.companies as { name: string }[]).map((c) => c.name);
    const alpha = names.indexOf("Alpha");
    const zeta = names.indexOf("Zeta");
    expect(alpha).toBeGreaterThanOrEqual(0);
    expect(zeta).toBeGreaterThanOrEqual(0);
    expect(alpha).toBeLessThan(zeta);
  });

  test("creates a company", async ({ request }) => {
    const session = await signUp(request, newUser());
    const name = newCompanyName();
    const payload = await createCompany(request, session.token, name);

    expect(payload.company.name).toBe(name);
    expect(payload.errors).toEqual([]);
  });

  test("returns errors for a blank company name", async ({ request }) => {
    const session = await signUp(request, newUser());
    const data = await graphql(request, 'mutation { createCompany(name: "") { company { id } errors } }', session.token);
    expect(data.data?.createCompany.errors).toContain("Name can't be blank");
  });

  test("views an existing company and returns null for an unknown one", async ({ request }) => {
    const session = await signUp(request, newUser());
    const name = newCompanyName();
    const payload = await createCompany(request, session.token, name);
    const id = payload.company.id;

    const view = await graphql(request, `{ company(id: "${id}") { id name } }`, session.token);
    expect(view.data?.company.name).toBe(name);

    const unknown = await graphql(request, '{ company(id: "00000000-0000-0000-0000-000000000000") { id name } }', session.token);
    expect(unknown.data?.company).toBeNull();
  });
});
