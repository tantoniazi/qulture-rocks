import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_COMPANY_MUTATION } from "../../graphql/documents";
import { ErrorList } from "../../components/ErrorList";
import { FormField } from "../../components/FormField";

interface CreateCompanyResult {
  createCompany: { company: { id: string; name: string } | null; errors: string[] };
}

export function CreateCompanyForm() {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [createCompany, { loading }] = useMutation<CreateCompanyResult>(CREATE_COMPANY_MUTATION, {
    refetchQueries: ["Companies"],
    awaitRefetchQueries: true,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { data } = await createCompany({ variables: { name: name.trim() } });
    const payload = data?.createCompany;
    if (payload?.errors.length) {
      setErrors(payload.errors);
      return;
    }
    setErrors([]);
    setName("");
  }

  return (
    <section className="card">
      <h2>New company</h2>
      <ErrorList errors={errors} />
      <form onSubmit={handleSubmit} className="inline-form">
        <FormField id="company-name" label="Company name" value={name} onChange={(event) => setName(event.target.value)} />
        <button type="submit" className="button button-primary" disabled={loading || !name.trim()}>
          Create company
        </button>
      </form>
    </section>
  );
}
