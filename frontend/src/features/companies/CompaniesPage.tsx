import { useQuery } from "@apollo/client/react";
import { Link } from "react-router-dom";
import { ErrorList } from "../../components/ErrorList";
import { COMPANIES_QUERY } from "../../graphql/documents";
import { CreateCompanyForm } from "./CreateCompanyForm";

interface CompaniesData {
  companies: { id: string; name: string; employees: { id: string }[] }[];
}

export function CompaniesPage() {
  const { data, loading, error } = useQuery<CompaniesData>(COMPANIES_QUERY);

  return (
    <div className="stack">
      <h1>Companies</h1>
      <CreateCompanyForm />

      {loading && <p>Loading companies...</p>}
      {error && <ErrorList errors={[error.message]} />}

      {data && data.companies.length === 0 && <p className="empty-state">No companies yet.</p>}

      <ul className="card-grid">
        {data?.companies.map((company) => (
          <li key={company.id}>
            <Link to={`/companies/${company.id}`} className="card company-card">
              <strong>{company.name}</strong>
              <span>{company.employees.length} employees</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
