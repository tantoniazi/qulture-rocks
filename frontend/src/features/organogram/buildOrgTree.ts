export interface OrgEmployee {
  id: string;
  name: string;
  picture: string | null;
  manager: { id: string } | null;
}

export interface OrgNode {
  id: string;
  name: string;
  picture: string | null;
  children: OrgNode[];
}

// Turns a flat employee list into a forest of trees. Employees whose manager is
// outside the list (or who have none) become roots. Nodes are sorted by name.
export function buildOrgTree(employees: OrgEmployee[]): OrgNode[] {
  const nodes = new Map<string, OrgNode>();
  employees.forEach((employee) => {
    nodes.set(employee.id, { id: employee.id, name: employee.name, picture: employee.picture, children: [] });
  });

  const roots: OrgNode[] = [];
  employees.forEach((employee) => {
    const node = nodes.get(employee.id);
    if (!node) return;

    const parent = employee.manager ? nodes.get(employee.manager.id) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortByName = (a: OrgNode, b: OrgNode) => a.name.localeCompare(b.name);
  nodes.forEach((node) => node.children.sort(sortByName));
  return roots.sort(sortByName);
}
