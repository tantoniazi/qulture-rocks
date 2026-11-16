import { test, expect } from "@playwright/test";
import { signUp, graphql } from "../../support/api";
import { newUser, newCompanyName, newPerson } from "../../support/data";

async function setupCompany(request: any, name: string) {
  const session = await signUp(request, newUser());
  await graphql(request, `mutation { createCompany(name: "${name}") { company { id } errors } }`, session.token);
  const companies = await graphql(request, "{ companies { id name } }", session.token);
  const companyId = (companies.data?.companies as { id: string; name: string }[]).find(
    (c) => c.name === name,
  )!.id;
  return { session, companyId };
}

async function addEmployee(request: any, token: string, companyId: string, person: { name: string; email: string }) {
  const data = await graphql(
    request,
    `mutation { createEmployee(companyId: "${companyId}", name: "${person.name}", email: "${person.email}") { employee { id name email } errors } }`,
    token,
  );
  return data.data?.createEmployee;
}

async function employeeIdByName(request: any, token: string, companyId: string, name: string) {
  const data = await graphql(request, `{ company(id: "${companyId}") { employees { id name email } } }`, token);
  return (data.data?.company.employees as { id: string; name: string }[]).find((e) => e.name === name)?.id;
}

test.describe("Employees (GraphQL)", () => {
  test("adds an employee to a company", async ({ request }) => {
    const { session, companyId } = await setupCompany(request, "Qulture");
    const person = newPerson("Ana");
    const result = await addEmployee(request, session.token, companyId, person);

    expect(result.employee.name).toBe(person.name);
    expect(result.employee.email).toBe(person.email);
    expect(result.errors).toEqual([]);
  });

  test("rejects a duplicated email inside the same company", async ({ request }) => {
    const { session, companyId } = await setupCompany(request, "Qulture");
    const person = newPerson("Ana");
    await addEmployee(request, session.token, companyId, person);

    const data = await graphql(
      request,
      `mutation { createEmployee(companyId: "${companyId}", name: "Ana 2", email: "${person.email}") { employee { id } errors } }`,
      session.token,
    );
    expect(data.data?.createEmployee.errors.length).toBeGreaterThan(0);
  });

  test("deletes an employee and keeps the reports without a manager", async ({ request }) => {
    const { session, companyId } = await setupCompany(request, "Qulture");
    const ana = newPerson("Ana");
    const bruno = newPerson("Bruno");
    await addEmployee(request, session.token, companyId, ana);
    await addEmployee(request, session.token, companyId, bruno);

    const anaId = await employeeIdByName(request, session.token, companyId, ana.name);
    const brunoId = await employeeIdByName(request, session.token, companyId, bruno.name);

    // make Ana the manager of Bruno
    await graphql(request, `mutation { assignManager(employeeId: "${brunoId}", managerId: "${anaId}") { employee { id } errors } }`, session.token);

    // delete Ana
    const del = await graphql(request, `mutation { deleteEmployee(employeeId: "${anaId}") { success errors } }`, session.token);
    expect(del.data?.deleteEmployee.success).toBe(true);

    // Bruno still exists and has no manager
    const after = await graphql(request, `{ employee(id: "${brunoId}") { id manager { id } } }`, session.token);
    expect(after.data?.employee.manager).toBeNull();
  });
});
