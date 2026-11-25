import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FormField } from "../../components/FormField";
import { ApiError } from "../../lib/api";
import { translate } from "../../lib/i18n";
import { AuthForm } from "./AuthForm";
import { useAuth } from "./useAuth";
import { validateLogin } from "./validation";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateLogin(email, password);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrors(error instanceof ApiError ? error.errors : [translate("api.could_not_reach_server")]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm
      title="Sign in"
      submitLabel="Sign in"
      errors={errors}
      submitting={submitting}
      onSubmit={handleSubmit}
      footer={
        <>
          New here? <Link to="/signup">Create an account</Link>
          <br />
          <Link to="/forgot-password">Forgot your password?</Link>
        </>
      }
    >
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
    </AuthForm>
  );
}
