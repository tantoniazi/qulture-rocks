import type { SignupInput } from "./types";

export function validateLogin(email: string, password: string): string[] {
  const errors: string[] = [];
  if (!email.trim()) errors.push("Email is required");
  if (!password) errors.push("Password is required");
  return errors;
}

export function validateSignup(input: SignupInput): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push("Name is required");
  if (!/^[^@\s]+@[^@\s]+$/.test(input.email.trim())) errors.push("Enter a valid email");
  if (input.password.length < 8) errors.push("Password must have at least 8 characters");
  if (input.password !== input.passwordConfirmation) errors.push("Passwords do not match");
  return errors;
}
