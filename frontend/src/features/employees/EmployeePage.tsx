import { useQuery } from "@apollo/client/react";
import { Link, useParams } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { ErrorList } from "../../components/ErrorList";
import { EMPLOYEE_QUERY } from "../../graphql/documents";
import { AssignManagerForm } from "./AssignManagerForm";

interface Person {
  id: string;
  name: string;
  picture: string | null;
}

interface EmployeeData {
  employee: {
    id: string;
    name: string;
    email: string;
    picture: string | null;
    company: { id: string; name: string; employees: { id: string; name: string }[] };
    manager: { id: string; name: string } | null;
    directReports: Person[];
    peers: Person[];
    secondLevelReports: Person[];
  } | null;
}

export function EmployeePage() {
  const { companyId = "", employeeId = "" } = useParams();
  const { data, loading, error } = useQuery<EmployeeData>(EMPLOYEE_QUERY, { variables: { id: employeeId } });

  if (loading) return <p>Loading employee...</p>;
  if (error) return <ErrorList errors={[error.message]} />;
  if (!data?.employee) return <p className="empty-state">Employee not found.</p>;

  const { employee } = data;

  return (
    <div className="stack">
      <Link to={`/companies/${companyId}`} className="back-link">
        ← Back to {employee.company.name}
      </Link>

      <section className="card profile">
        <Avatar name={employee.name} picture={employee.picture} />
        <div>
          <h1>{employee.name}</h1>
          <p className="muted">{employee.email}</p>
          {employee.manager && (
            <p>
              Reports to{" "}
              <Link to={`/companies/${companyId}/employees/${employee.manager.id}`}>{employee.manager.name}</Link>
            </p>
          )}
        </div>
      </section>

      <AssignManagerForm
        employeeId={employee.id}
        currentManagerId={employee.manager?.id ?? null}
        candidates={employee.company.employees}
      />

      <PeopleSection title="Direct reports" people={employee.directReports} companyId={companyId} />
      <PeopleSection title="Peers" people={employee.peers} companyId={companyId} />
      <PeopleSection title="Second-level reports" people={employee.secondLevelReports} companyId={companyId} />
    </div>
  );
}

interface PeopleSectionProps {
  title: string;
  people: Person[];
  companyId: string;
}

function PeopleSection({ title, people, companyId }: PeopleSectionProps) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {people.length === 0 ? (
        <p className="empty-state">None.</p>
      ) : (
        <ul className="people-list">
          {people.map((person) => (
            <li key={person.id}>
              <Avatar name={person.name} picture={person.picture} />
              <Link to={`/companies/${companyId}/employees/${person.id}`}>{person.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
