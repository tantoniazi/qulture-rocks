import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { ASSIGN_MANAGER_MUTATION } from "../../graphql/documents";
import { ErrorList } from "../../components/ErrorList";

interface Candidate {
  id: string;
  name: string;
}

interface AssignManagerFormProps {
  employeeId: string;
  currentManagerId: string | null;
  candidates: Candidate[];
}

interface AssignManagerResult {
  assignManager: { employee: { id: string } | null; errors: string[] };
}

const NO_MANAGER = "";

export function AssignManagerForm({ employeeId, currentManagerId, candidates }: AssignManagerFormProps) {
  const [managerId, setManagerId] = useState(currentManagerId ?? NO_MANAGER);
  const [errors, setErrors] = useState<string[]>([]);
  const [assignManager, { loading }] = useMutation<AssignManagerResult>(ASSIGN_MANAGER_MUTATION, {
    refetchQueries: ["Employee"],
    awaitRefetchQueries: true,
  });

  const options = candidates.filter((candidate) => candidate.id !== employeeId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { data } = await assignManager({
      variables: { employeeId, managerId: managerId === NO_MANAGER ? null : managerId },
    });
    setErrors(data?.assignManager.errors ?? []);
  }

  return (
    <section className="card">
      <h2>Manager</h2>
      <ErrorList errors={errors} />
      <form onSubmit={handleSubmit} className="inline-form">
        <div className="form-field">
          <label htmlFor="manager-select">Reports to</label>
          <select id="manager-select" value={managerId} onChange={(event) => setManagerId(event.target.value)}>
            <option value={NO_MANAGER}>No manager</option>
            {options.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="button button-primary" disabled={loading}>
          Save manager
        </button>
      </form>
    </section>
  );
}
