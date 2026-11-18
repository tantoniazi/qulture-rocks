require "rails_helper"

RSpec.describe "GraphQL API", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers_for(user) }
  let(:company) { create(:company, name: "Qulture") }

  it "rejects requests without a valid token" do
    post "/graphql", params: { query: "{ companies { id } }" }, as: :json

    expect(response).to have_http_status(:unauthorized)
  end

  describe "companies" do
    it "lists companies ordered by name" do
      create(:company, name: "Zeta")
      create(:company, name: "Alpha")

      data = graphql("{ companies { nodes { name } } }", headers: headers)

      expect(data.dig("data", "companies", "nodes").map { |c| c["name"] }).to eq(%w[Alpha Zeta])
    end

    it "creates a company" do
      data = graphql(<<~GQL, headers: headers)
        mutation { createCompany(name: "Acme") { company { id name } errors } }
      GQL

      payload = data.dig("data", "createCompany")
      expect(payload["company"]["name"]).to eq("Acme")
      expect(payload["errors"]).to eq([])
    end

    it "returns errors for an invalid company" do
      data = graphql(<<~GQL, headers: headers)
        mutation { createCompany(name: "") { company { id } errors } }
      GQL

      expect(data.dig("data", "createCompany", "errors")).to include("Name can't be blank")
    end
  end

  describe "employees" do
    let(:boss) { create(:employee, company: company, name: "Boss") }

    it "adds an employee to a company" do
      data = graphql(<<~GQL, headers: headers)
        mutation {
          createEmployee(companyId: "#{company.id}", name: "Ana", email: "ana@example.com", picture: "https://example.com/a.png") {
            employee { id name email picture company { name } }
            errors
          }
        }
      GQL

      employee = data.dig("data", "createEmployee", "employee")
      expect(employee).to include("name" => "Ana", "email" => "ana@example.com", "picture" => "https://example.com/a.png")
      expect(employee.dig("company", "name")).to eq("Qulture")
    end

    it "lists company employees" do
      boss
      data = graphql("{ company(id: \"#{company.id}\") { employees { name } } }", headers: headers)

      expect(data.dig("data", "company", "employees")).to eq([ { "name" => "Boss" } ])
    end

    it "deletes an employee" do
      employee = create(:employee, company: company)
      data = graphql(<<~GQL, headers: headers)
        mutation { deleteEmployee(employeeId: "#{employee.id}") { success errors } }
      GQL

      expect(data.dig("data", "deleteEmployee", "success")).to be(true)
      expect(Employee.exists?(employee.id)).to be(false)
    end

    it "assigns a manager and exposes the hierarchy queries" do
      ana = create(:employee, company: company, name: "Ana")
      bruno = create(:employee, company: company, name: "Bruno")
      carla = create(:employee, company: company, name: "Carla")
      ana.update!(manager: boss)
      bruno.update!(manager: boss)
      carla.update!(manager: ana)

      data = graphql(<<~GQL, headers: headers)
        {
          employee(id: "#{boss.id}") {
            directReports { name }
            secondLevelReports { name }
          }
          peersOf: employee(id: "#{ana.id}") { peers { name } manager { name } }
        }
      GQL

      expect(data.dig("data", "employee", "directReports").map { _1["name"] }).to eq(%w[Ana Bruno])
      expect(data.dig("data", "employee", "secondLevelReports").map { _1["name"] }).to eq([ "Carla" ])
      expect(data.dig("data", "peersOf", "peers").map { _1["name"] }).to eq([ "Bruno" ])
      expect(data.dig("data", "peersOf", "manager", "name")).to eq("Boss")
    end

    it "returns a business error when assigning a loop" do
      ana = create(:employee, company: company)
      ana.update!(manager: boss)

      data = graphql(<<~GQL, headers: headers)
        mutation { assignManager(employeeId: "#{boss.id}", managerId: "#{ana.id}") { employee { id } errors } }
      GQL

      expect(data.dig("data", "assignManager", "errors")).to include("Assignment would create a hierarchy loop")
    end
  end
end
