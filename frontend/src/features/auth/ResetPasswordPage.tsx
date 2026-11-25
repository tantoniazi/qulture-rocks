import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FormField } from "../../components/FormField";
import { ApiError } from "../../lib/api";
import { translate } from "../../lib/i18n";
import { AuthForm } from "./AuthForm";
import { resetPassword } from "./authService";
import { validateNewPassword } from "./validation";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = token ? validateNewPassword(password, passwordConfirmation) : [translate("validation.reset_token_missing")];
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setSubmitting(true);
    try {
      await resetPassword(token, password, passwordConfirmation);
      setDone(true);
    } catch (error) {
      setErrors(error instanceof ApiError ? error.errors : [translate("api.could_not_reach_server")]);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section className="auth-card">
        <h1>Password updated</h1>
        <p>You can sign in with your new password.</p>
        <p className="auth-footer">
          <Link to="/login">Go to sign in</Link>
        </p>
      </section>
    );
  }

  return (
    <AuthForm
      title="Choose a new password"
      submitLabel="Update password"
      errors={errors}
      submitting={submitting}
      onSubmit={handleSubmit}
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <FormField
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <FormField
        id="password-confirmation"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={passwordConfirmation}
        onChange={(event) => setPasswordConfirmation(event.target.value)}
      />
    </AuthForm>
  );
}
