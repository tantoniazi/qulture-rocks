import type { APIRequestContext } from "@playwright/test";

export interface Session {
  token: string;
  user: { id: number; name: string; email: string };
}

// Base URL of the Rails API. Inside Docker Compose the API is reachable as
// http://backend:3000; on the host it's http://localhost:3000.
const API_BASE_URL = process.env.E2E_API_URL ?? "http://localhost:3000";

export const GRAPHQL_PATH = "/graphql";

// Runs a GraphQL operation with an optional bearer token and returns the parsed body.
// Uses the full API base URL so it works from the Playwright request context (which
// has the frontend's baseURL) as well as from the API project context.
export async function graphql<T = Record<string, unknown>>(
  request: APIRequestContext,
  query: string,
  token?: string,
): Promise<{ status: number; data?: T; errors?: { message: string }[] }> {
  const response = await request.post(`${API_BASE_URL}${GRAPHQL_PATH}`, {
    data: { query },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const body = response.status() === 200 ? await response.json() : {};
  return { status: response.status(), data: body.data, errors: body.errors };
}

export async function signIn(
  request: APIRequestContext,
  user: { email: string; password: string },
): Promise<Session> {
  const response = await request.post("/auth/login", {
    data: { user },
  });
  if (response.status() !== 200) throw new Error(`sign in failed: ${response.status()} ${await response.text()}`);
  return response.json();
}

export async function signUp(
  request: APIRequestContext,
  user: { name: string; email: string; password: string },
): Promise<Session> {
  const response = await request.post("/auth/signup", {
    data: {
      user: { ...user, password_confirmation: user.password },
    },
  });
  if (response.status() !== 201) throw new Error(`signup failed: ${response.status()} ${await response.text()}`);
  return response.json();
}

// Creates a company via GraphQL and returns its id and the session token.
export async function createCompanyViaGraphQL(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<string> {
  const data = await graphql(
    request,
    `mutation { createCompany(name: "${name}") { company { id } errors } }`,
    token,
  );
  const id = data.data?.createCompany.company?.id;
  if (!id) throw new Error(`create company failed: ${JSON.stringify(data.errors)}`);
  return id;
}

// Creates an employee via GraphQL and returns its id.
export async function createEmployeeViaGraphQL(
  request: APIRequestContext,
  token: string,
  companyId: string,
  person: { name: string; email: string },
): Promise<string> {
  const data = await graphql(
    request,
    `mutation { createEmployee(companyId: "${companyId}", name: "${person.name}", email: "${person.email}") { employee { id } errors } }`,
    token,
  );
  const id = data.data?.createEmployee.employee?.id;
  if (!id) throw new Error(`create employee failed: ${JSON.stringify(data.errors)}`);
  return id;
}
