import { test, expect, type APIRequestContext } from "@playwright/test";
import { graphql, signUp, type CompanyRef, type EmployeeRef } from "../../support/api";
import { newCompanyName, newPerson, newUser } from "../../support/data";

interface CreateCompanyData {
  createCompany: { company: CompanyRef | null; errors: string[] };
}

interface CreateEmployeeData {
  createEmployee: { employee: EmployeeRef | null; errors: string[] };
}

interface AssignManagerData {
  assignManager: { employee: EmployeeRef | null; errors: string[] };
}

interface HierarchyData {
  employee: {
    directReports: EmployeeRef[];
    peers: EmployeeRef[];
    secondLevelReports: EmployeeRef[];
  } | null;
}

async function authenticatedSession(request: APIRequestContext) {
  const session = await signUp(request, newUser());
  return session.token;
}

async function createCompany(request: APIRequestContext, token: string, name: string): Promise<CompanyRef> {
  const result = await graphql<CreateCompanyData>(
    request,
    `mutation { createCompany(name: "${name}") { company { id name } errors } }`,
    token,
  );
  const company = result.data?.createCompany.company;
  if (!company) throw new Error(`createCompany failed: ${JSON.stringify(result.data)}`);
  return company;
}

async function createEmployee(request: APIRequestContext, token: string, companyId: string, person: { name: string; email: string }) {
  const result = await graphql<CreateEmployeeData>(
    request,
    `mutation { createEmployee(companyId: "${companyId}", name: "${person.name}", email: "${person.email}") { employee { id name } errors } }`,
    token,
  );
  const employee = result.data?.createEmployee.employee;
  if (!employee) throw new Error(`createEmployee failed: ${JSON.stringify(result.data)}`);
  return employee;
}

test.describe("GraphQL API integration", () => {
  test("requests without a token are rejected", async ({ request }) => {
    const result = await graphql(request, "{ companies { id } }");
    expect(result.status).toBe(401);
  });

  test("companies can be created and listed", async ({ request }) => {
    const token = await authenticatedSession(request);
    const name = newCompanyName();
    const created = await createCompany(request, token, name);

    const listed = await graphql<{ companies: CompanyRef[] }>(request, "{ companies { id name } }", token);
    expect(listed.data?.companies.map((company) => company.id)).toContain(created.id);
  });

  test("a company name is unique regardless of case", async ({ request }) => {
    const token = await authenticatedSession(request);
    const name = newCompanyName();
    await createCompany(request, token, name);

    const result = await graphql<CreateCompanyData>(
      request,
      `mutation { createCompany(name: "${name.toUpperCase()}") { company { id } errors } }`,
      token,
    );
    expect(result.data?.createCompany.errors).toContain("Name has already been taken");
  });

  test("an employee is added to a company and listed with it", async ({ request }) => {
    const token = await authenticatedSession(request);
    const company = await createCompany(request, token, newCompanyName());
    const person = newPerson("Solo");
    await createEmployee(request, token, company.id, person);

    const view = await graphql<{ company: { employees: EmployeeRef[] } }>(
      request,
      `{ company(id: "${company.id}") { employees { id name } } }`,
      token,
    );
    expect(view.data?.company.employees.map((employee) => employee.name)).toContain(person.name);
  });

  test("hierarchy queries expose peers, direct reports and second-level reports", async ({ request }) => {
    const token = await authenticatedSession(request);
    const company = await createCompany(request, token, newCompanyName());
    const boss = await createEmployee(request, token, company.id, newPerson("Boss"));
    const lead = await createEmployee(request, token, company.id, newPerson("Lead"));
    const peer = await createEmployee(request, token, company.id, newPerson("Peer"));
    const junior = await createEmployee(request, token, company.id, newPerson("Junior"));

    await graphql<AssignManagerData>(request, `mutation { assignManager(employeeId: "${lead.id}", managerId: "${boss.id}") { errors } }`, token);
    await graphql<AssignManagerData>(request, `mutation { assignManager(employeeId: "${peer.id}", managerId: "${boss.id}") { errors } }`, token);
    await graphql<AssignManagerData>(request, `mutation { assignManager(employeeId: "${junior.id}", managerId: "${lead.id}") { errors } }`, token);

    const bossView = await graphql<HierarchyData>(
      request,
      `{ employee(id: "${boss.id}") { directReports { id } secondLevelReports { id } } }`,
      token,
    );
    expect(bossView.data?.employee?.directReports.map((e) => e.id).sort()).toEqual([lead.id, peer.id].sort());
    expect(bossView.data?.employee?.secondLevelReports.map((e) => e.id)).toEqual([junior.id]);

    const peerView = await graphql<HierarchyData>(request, `{ employee(id: "${peer.id}") { peers { id } } }`, token);
    expect(peerView.data?.employee?.peers.map((e) => e.id)).toEqual([lead.id]);
  });

  test("a hierarchy loop is refused through the API", async ({ request }) => {
    const token = await authenticatedSession(request);
    const company = await createCompany(request, token, newCompanyName());
    const top = await createEmployee(request, token, company.id, newPerson("Top"));
    const middle = await createEmployee(request, token, company.id, newPerson("Middle"));
    await graphql<AssignManagerData>(request, `mutation { assignManager(employeeId: "${middle.id}", managerId: "${top.id}") { errors } }`, token);

    const result = await graphql<AssignManagerData>(
      request,
      `mutation { assignManager(employeeId: "${top.id}", managerId: "${middle.id}") { errors } }`,
      token,
    );
    expect(result.data?.assignManager.errors).toEqual(["Assignment would create a hierarchy loop"]);
  });

  test("managers from another company are refused through the API", async ({ request }) => {
    const token = await authenticatedSession(request);
    const first = await createCompany(request, token, newCompanyName());
    const second = await createCompany(request, token, newCompanyName());
    const employee = await createEmployee(request, token, first.id, newPerson("Local"));
    const outsider = await createEmployee(request, token, second.id, newPerson("Outsider"));

    const result = await graphql<AssignManagerData>(
      request,
      `mutation { assignManager(employeeId: "${employee.id}", managerId: "${outsider.id}") { errors } }`,
      token,
    );
    expect(result.data?.assignManager.errors).toEqual(["Manager must belong to the same company"]);
  });
});
