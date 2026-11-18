import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FormField } from "../../components/FormField";
import { ApiError } from "../../lib/api";
import { translate } from "../../lib/i18n";
import { AuthForm } from "./AuthForm";
import { requestPasswordReset } from "./authService";
import { validateForgotPassword } from "./validation";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateForgotPassword(email);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (error) {
      setErrors(error instanceof ApiError ? error.errors : [translate("api.could_not_reach_server")]);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <section className="auth-card">
        <h1>Check your email</h1>
        <p>If the email is registered, reset instructions are on their way.</p>
        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </section>
    );
  }

  return (
    <AuthForm
      title="Forgot your password?"
      submitLabel="Send instructions"
      errors={errors}
      submitting={submitting}
      onSubmit={handleSubmit}
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
    </AuthForm>
  );
}
