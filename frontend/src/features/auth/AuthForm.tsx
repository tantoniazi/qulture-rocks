import type { FormEvent, ReactNode } from "react";
import { ErrorList } from "../../components/ErrorList";

interface AuthFormProps {
  title: string;
  submitLabel: string;
  errors: string[];
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer: ReactNode;
}

// Shared card layout for login and signup screens.
export function AuthForm({ title, submitLabel, errors, submitting, onSubmit, children, footer }: AuthFormProps) {
  return (
    <section className="auth-card">
      <h1>{title}</h1>
      <ErrorList errors={errors} />
      <form onSubmit={onSubmit} noValidate>
        {children}
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? "Please wait..." : submitLabel}
        </button>
      </form>
      <p className="auth-footer">{footer}</p>
    </section>
  );
}
