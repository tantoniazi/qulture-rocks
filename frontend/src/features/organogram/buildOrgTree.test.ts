import { buildOrgTree, type OrgEmployee } from "./buildOrgTree";

const person = (id: string, name: string, managerId: string | null = null): OrgEmployee => ({
  id,
  name,
  picture: null,
  manager: managerId ? { id: managerId } : null,
});

describe("buildOrgTree", () => {
  it("returns an empty forest for no employees", () => {
    expect(buildOrgTree([])).toEqual([]);
  });

  it("nests employees under their managers, sorted by name", () => {
    const tree = buildOrgTree([
      person("2", "Zoe", "1"),
      person("1", "Ana"),
      person("3", "Bruno", "1"),
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe("Ana");
    expect(tree[0].children.map((child) => child.name)).toEqual(["Bruno", "Zoe"]);
  });

  it("treats employees whose manager is outside the list as roots", () => {
    const tree = buildOrgTree([person("2", "Zoe", "missing")]);

    expect(tree.map((node) => node.name)).toEqual(["Zoe"]);
  });

  it("supports multiple levels of hierarchy", () => {
    const tree = buildOrgTree([person("1", "Ana"), person("2", "Bruno", "1"), person("3", "Carla", "2")]);

    expect(tree[0].children[0].children[0].name).toBe("Carla");
  });
});
