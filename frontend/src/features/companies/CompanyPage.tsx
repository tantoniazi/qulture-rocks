import { useMutation, useQuery } from "@apollo/client/react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { ErrorList } from "../../components/ErrorList";
import { Pagination } from "../../components/Pagination";
import { COMPANY_QUERY, DELETE_EMPLOYEE_MUTATION } from "../../graphql/documents";
import { PAGE_SIZE, parsePage } from "../../lib/pagination";
import { AddEmployeeForm } from "../employees/AddEmployeeForm";
import { OrgChart } from "../organogram/OrgChart";
import type { OrgEmployee } from "../organogram/buildOrgTree";

interface CompanyEmployee extends OrgEmployee {
  email: string;
}

interface ListedEmployee {
  id: string;
  name: string;
  email: string;
  picture: string | null;
}

interface CompanyData {
  company: {
    id: string;
    name: string;
    employees: CompanyEmployee[];
    employeePage: {
      nodes: ListedEmployee[];
      totalCount: number;
      page: number;
      totalPages: number;
    };
  } | null;
}

interface DeleteEmployeeResult {
  deleteEmployee: { success: boolean; errors: string[] };
}

export function CompanyPage() {
  const { companyId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeesPage = parsePage(searchParams.get("employeesPage"));
  const { data, loading, error } = useQuery<CompanyData>(COMPANY_QUERY, {
    variables: { id: companyId, employeesPage, perPage: PAGE_SIZE },
  });
  const [deleteEmployee, deleteState] = useMutation<DeleteEmployeeResult>(DELETE_EMPLOYEE_MUTATION, {
    refetchQueries: ["Company"],
    awaitRefetchQueries: true,
  });

  if (loading) return <p>Loading company...</p>;
  if (error) return <ErrorList errors={[error.message]} />;
  if (!data?.company) return <p className="empty-state">Company not found.</p>;

  const { company } = data;
  const listed = company.employeePage;

  async function handleDelete(employee: ListedEmployee) {
    if (!window.confirm(`Remove ${employee.name} from ${company.name}?`)) return;
    await deleteEmployee({ variables: { employeeId: employee.id } });
  }

  return (
    <div className="stack">
      <h1>{company.name}</h1>

      <section className="card">
        <h2>Organogram</h2>
        <OrgChart companyId={company.id} employees={company.employees} />
      </section>

      <AddEmployeeForm companyId={company.id} />

      <section className="card">
        <h2>Employees</h2>
        <ErrorList errors={deleteState.data?.deleteEmployee.errors ?? []} />
        {listed.totalCount === 0 && <p className="empty-state">No employees yet.</p>}
        <ul className="employee-list">
          {listed.nodes.map((employee) => (
            <li key={employee.id} className="employee-row">
              <Avatar name={employee.name} picture={employee.picture} />
              <Link to={`/companies/${company.id}/employees/${employee.id}`}>{employee.name}</Link>
              <span className="muted">{employee.email}</span>
              <button type="button" className="button button-danger" onClick={() => handleDelete(employee)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <Pagination
          page={listed.page}
          totalPages={listed.totalPages}
          onPageChange={(next) => setSearchParams({ employeesPage: String(next) })}
        />
      </section>
    </div>
  );
}
