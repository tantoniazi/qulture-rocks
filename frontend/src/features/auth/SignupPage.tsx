import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../components/FormField";
import { ApiError } from "../../lib/api";
import { translate } from "../../lib/i18n";
import { AuthForm } from "./AuthForm";
import { useAuth } from "./useAuth";
import { validateSignup } from "./validation";

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = { name, email, password, passwordConfirmation };
    const validationErrors = validateSignup(input);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setSubmitting(true);
    try {
      await signUp({ ...input, email: email.trim(), name: name.trim() });
      navigate("/", { replace: true });
    } catch (error) {
      setErrors(error instanceof ApiError ? error.errors : [translate("api.could_not_reach_server")]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthForm
      title="Create account"
      submitLabel="Create account"
      errors={errors}
      submitting={submitting}
      onSubmit={handleSubmit}
      footer={
        <>
          Already registered? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <FormField id="name" label="Name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
      <FormField id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <FormField
        id="password"
        label="Password"
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
