import { apiRequest } from "../../lib/api";
import type { Session, SignupInput } from "./types";

interface AuthResponse {
  token: string;
  user: Session["user"];
}

export async function login(email: string, password: string): Promise<Session> {
  const data = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { user: { email, password } },
  });
  return { token: data.token, user: data.user };
}

export async function signup(input: SignupInput): Promise<Session> {
  const data = await apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: {
      user: {
        name: input.name,
        email: input.email,
        password: input.password,
        password_confirmation: input.passwordConfirmation,
      },
    },
  });
  return { token: data.token, user: data.user };
}

export async function logout(token: string): Promise<void> {
  await apiRequest<void>("/auth/logout", { method: "DELETE", token });
}
