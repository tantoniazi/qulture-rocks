import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { OrgChart } from "./OrgChart";

describe("OrgChart", () => {
  it("shows an empty state when there are no employees", () => {
    render(
      <MemoryRouter>
        <OrgChart companyId="1" employees={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/no employees yet/i)).toBeInTheDocument();
  });

  it("renders each employee as a link to their detail page", () => {
    render(
      <MemoryRouter>
        <OrgChart
          companyId="1"
          employees={[
            { id: "10", name: "Ana Souza", picture: null, manager: null },
            { id: "11", name: "Bruno Lima", picture: null, manager: { id: "10" } },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /ana souza/i })).toHaveAttribute("href", "/companies/1/employees/10");
    expect(screen.getByRole("link", { name: /bruno lima/i })).toHaveAttribute("href", "/companies/1/employees/11");
  });
});
