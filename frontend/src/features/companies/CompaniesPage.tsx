import { useQuery } from "@apollo/client/react";
import { Link, useSearchParams } from "react-router-dom";
import { ErrorList } from "../../components/ErrorList";
import { Pagination } from "../../components/Pagination";
import { COMPANIES_QUERY } from "../../graphql/documents";
import { PAGE_SIZE, parsePage } from "../../lib/pagination";
import { CreateCompanyForm } from "./CreateCompanyForm";

interface CompaniesData {
  companies: {
    nodes: { id: string; name: string; employeesCount: number }[];
    totalCount: number;
    page: number;
    totalPages: number;
  };
}

export function CompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const { data, loading, error } = useQuery<CompaniesData>(COMPANIES_QUERY, {
    variables: { page, perPage: PAGE_SIZE },
  });
  const companies = data?.companies;

  return (
    <div className="stack">
      <h1>Companies</h1>
      <CreateCompanyForm />

      {loading && <p>Loading companies...</p>}
      {error && <ErrorList errors={[error.message]} />}

      {companies && companies.totalCount === 0 && <p className="empty-state">No companies yet.</p>}

      <ul className="card-grid">
        {companies?.nodes.map((company) => (
          <li key={company.id}>
            <Link to={`/companies/${company.id}`} className="card company-card">
              <strong>{company.name}</strong>
              <span>{company.employeesCount} employees</span>
            </Link>
          </li>
        ))}
      </ul>

      {companies && (
        <Pagination
          page={companies.page}
          totalPages={companies.totalPages}
          onPageChange={(next) => setSearchParams({ page: String(next) })}
        />
      )}
    </div>
  );
}
