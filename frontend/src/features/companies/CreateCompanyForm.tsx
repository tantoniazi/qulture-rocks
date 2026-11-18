import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { COMPANIES_QUERY, CREATE_COMPANY_MUTATION } from "../../graphql/documents";
import { ErrorList } from "../../components/ErrorList";
import { FormField } from "../../components/FormField";

interface CreateCompanyResult {
  createCompany: { company: { id: string; name: string } | null; errors: string[] };
}

interface CompaniesData {
  companies: { id: string; name: string; employees: { id: string }[] }[];
}

export function CreateCompanyForm() {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [createCompany, { loading }] = useMutation<CreateCompanyResult>(CREATE_COMPANY_MUTATION, {
    // Write the new company into the cached list directly, so the screen updates
    // even when a list request is already in flight and would deduplicate a refetch.
    update(cache, { data }) {
      const company = data?.createCompany.company;
      if (!company) return;
      cache.updateQuery<CompaniesData>({ query: COMPANIES_QUERY }, (existing) =>
        existing && { companies: [...existing.companies, { ...company, employees: [] }] },
      );
    },
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
