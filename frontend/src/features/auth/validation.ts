import { translate } from "../../lib/i18n";
import type { SignupInput } from "./types";

export function validateLogin(email: string, password: string): string[] {
  const errors: string[] = [];
  if (!email.trim()) errors.push(translate("validation.email_required"));
  if (!password) errors.push(translate("validation.password_required"));
  return errors;
}

export function validateSignup(input: SignupInput): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push(translate("validation.name_required"));
  if (!/^[^@\s]+@[^@\s]+$/.test(input.email.trim())) errors.push(translate("validation.invalid_email"));
  return [...errors, ...validateNewPassword(input.password, input.passwordConfirmation)];
}

export function validateForgotPassword(email: string): string[] {
  return email.trim() ? [] : [translate("validation.email_required")];
}

export function validateNewPassword(password: string, passwordConfirmation: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push(translate("validation.password_too_short"));
  if (password !== passwordConfirmation) errors.push(translate("validation.passwords_do_not_match"));
  return errors;
}
