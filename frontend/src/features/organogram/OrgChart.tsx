import { Link } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { buildOrgTree, type OrgEmployee, type OrgNode } from "./buildOrgTree";

interface OrgChartProps {
  companyId: string;
  employees: OrgEmployee[];
}

export function OrgChart({ companyId, employees }: OrgChartProps) {
  const roots = buildOrgTree(employees);

  if (roots.length === 0) {
    return <p className="empty-state">No employees yet. Add the first one to start the organogram.</p>;
  }

  return (
    <div className="org-chart" aria-label="Organogram">
      <ul className="org-level">
        {roots.map((root) => (
          <OrgBranch key={root.id} node={root} companyId={companyId} />
        ))}
      </ul>
    </div>
  );
}

interface OrgBranchProps {
  node: OrgNode;
  companyId: string;
}

function OrgBranch({ node, companyId }: OrgBranchProps) {
  return (
    <li className="org-branch">
      <Link to={`/companies/${companyId}/employees/${node.id}`} className="org-card">
        <Avatar name={node.name} picture={node.picture} />
        <span>{node.name}</span>
      </Link>
      {node.children.length > 0 && (
        <ul className="org-level">
          {node.children.map((child) => (
            <OrgBranch key={child.id} node={child} companyId={companyId} />
          ))}
        </ul>
      )}
    </li>
  );
}
