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
    `mutation { createEmployee(companyId: "${companyId}", name: "${person.name}", email: "${person.email}") { employee { id } errors } }`,
    token,
  );
  return data.data?.createEmployee.employee.id;
}

async function employeeIdByName(request: any, token: string, companyId: string, name: string) {
  const data = await graphql(request, `{ company(id: "${companyId}") { employees { id name email } } }`, token);
  return (data.data?.company.employees as { id: string; name: string }[]).find((e) => e.name === name)?.id;
}

test.describe("Organogram (GraphQL)", () => {
  test("assigns a manager and exposes hierarchy queries", async ({ request }) => {
    const { session, companyId } = await setupCompany(request, "Qulture");
    const bossId = await addEmployee(request, session.token, companyId, newPerson("Boss"));
    const anaId = await addEmployee(request, session.token, companyId, newPerson("Ana"));
    const brunoId = await addEmployee(request, session.token, companyId, newPerson("Bruno"));
    const carlaId = await addEmployee(request, session.token, companyId, newPerson("Carla"));

    await graphql(request, `mutation { assignManager(employeeId: "${anaId}", managerId: "${bossId}") { employee { id } errors } }`, session.token);
    await graphql(request, `mutation { assignManager(employeeId: "${brunoId}", managerId: "${bossId}") { employee { id } errors } }`, session.token);
    await graphql(request, `mutation { assignManager(employeeId: "${carlaId}", managerId: "${anaId}") { employee { id } errors } }`, session.token);

    const data = await graphql(
      request,
      `{
        employee(id: "${bossId}") { directReports { name } secondLevelReports { name } }
        peersOf: employee(id: "${anaId}") { peers { name } manager { name } }
      }`,
      session.token,
    );
    const direct = data.data?.employee.directReports.map((r: { name: string }) => r.name);
    expect(direct).toEqual(expect.arrayContaining([expect.stringContaining("Ana"), expect.stringContaining("Bruno")]));
    expect(data.data?.employee.secondLevelReports.map((r: { name: string }) => r.name)).toEqual([expect.stringContaining("Carla")]);
    expect(data.data?.peersOf.peers.map((r: { name: string }) => r.name)).toEqual([expect.stringContaining("Bruno")]);
    expect(data.data?.peersOf.manager.name).toEqual(expect.stringContaining("Boss"));
  });

  test("rejects a hierarchy loop", async ({ request }) => {
    const { session, companyId } = await setupCompany(request, "Qulture");
    const bossId = await addEmployee(request, session.token, companyId, newPerson("Boss"));
    const anaId = await addEmployee(request, session.token, companyId, newPerson("Ana"));

    await graphql(request, `mutation { assignManager(employeeId: "${anaId}", managerId: "${bossId}") { employee { id } errors } }`, session.token);

    const data = await graphql(request, `mutation { assignManager(employeeId: "${bossId}", managerId: "${anaId}") { employee { id } errors } }`, session.token);
    expect(data.data?.assignManager.errors).toContain("Assignment would create a hierarchy loop");
  });
});
