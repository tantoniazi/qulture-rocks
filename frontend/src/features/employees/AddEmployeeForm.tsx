import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_EMPLOYEE_MUTATION } from "../../graphql/documents";
import { ErrorList } from "../../components/ErrorList";
import { FormField } from "../../components/FormField";

interface AddEmployeeFormProps {
  companyId: string;
}

interface CreateEmployeeResult {
  createEmployee: { employee: { id: string } | null; errors: string[] };
}

export function AddEmployeeForm({ companyId }: AddEmployeeFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [picture, setPicture] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [createEmployee, { loading }] = useMutation<CreateEmployeeResult>(CREATE_EMPLOYEE_MUTATION, {
    refetchQueries: ["Company"],
    awaitRefetchQueries: true,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { data } = await createEmployee({
      variables: {
        companyId,
        name: name.trim(),
        email: email.trim(),
        picture: picture.trim() || null,
      },
    });
    const payload = data?.createEmployee;
    if (payload?.errors.length) {
      setErrors(payload.errors);
      return;
    }
    setErrors([]);
    setName("");
    setEmail("");
    setPicture("");
  }

  return (
    <section className="card">
      <h2>Add employee</h2>
      <ErrorList errors={errors} />
      <form onSubmit={handleSubmit} className="form-grid">
        <FormField id="employee-name" label="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <FormField id="employee-email" label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <FormField
          id="employee-picture"
          label="Picture URL (optional)"
          type="url"
          value={picture}
          onChange={(event) => setPicture(event.target.value)}
        />
        <button type="submit" className="button button-primary" disabled={loading}>
          Add employee
        </button>
      </form>
    </section>
  );
}
