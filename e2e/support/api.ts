import type { APIRequestContext } from "@playwright/test";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export interface Session {
  token: string;
  user: SessionUser;
}

export interface GraphqlResult<T> {
  status: number;
  data: T | undefined;
  errors: { message: string }[];
}

export interface CompanyRef {
  id: string;
  name: string;
}

export interface EmployeeRef {
  id: string;
  name: string;
}

interface RegistrationInput {
  name: string;
  email: string;
  password: string;
}

// Absolute URLs: the `request` fixture resolves relative paths against the project's baseURL,
// which is the frontend in the ui project, so the API must be addressed explicitly.
const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000";

export async function signUp(request: APIRequestContext, input: RegistrationInput): Promise<Session> {
  const response = await request.post(`${API_URL}/auth/signup`, {
    data: { user: { ...input, password_confirmation: input.password } },
  });
  if (response.status() !== 201) {
    throw new Error(`signup failed with ${response.status()}: ${await response.text()}`);
  }
  return (await response.json()) as Session;
}

export async function signIn(request: APIRequestContext, email: string, password: string) {
  return request.post(`${API_URL}/auth/login`, { data: { user: { email, password } } });
}

export async function signOut(request: APIRequestContext, token: string) {
  return request.delete(`${API_URL}/auth/logout`, { headers: { Authorization: `Bearer ${token}` } });
}

// Runs a GraphQL operation. The status is returned so tests can assert 401 without throwing.
export async function graphql<T>(
  request: APIRequestContext,
  query: string,
  token?: string,
): Promise<GraphqlResult<T>> {
  const response = await request.post(`${API_URL}/graphql`, {
    data: { query },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const body = response.status() === 200 ? ((await response.json()) as { data?: T; errors?: { message: string }[] }) : {};
  return {
    status: response.status(),
    data: body.data,
    errors: body.errors ?? [],
  };
}
