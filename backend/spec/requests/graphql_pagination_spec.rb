require "rails_helper"

RSpec.describe "GraphQL pagination", type: :request do
  let(:headers) { auth_headers_for(create(:user)) }

  before do
    %w[Alpha Beta Gamma].each { |name| create(:company, name: name) }
  end

  it "pages companies with their total count" do
    data = graphql(<<~GQL, headers: headers)
      { companies(page: 2, perPage: 2) { nodes { name } totalCount totalPages page perPage } }
    GQL

    page = data.dig("data", "companies")
    expect(page["nodes"].map { |c| c["name"] }).to eq([ "Gamma" ])
    expect(page).to include("totalCount" => 3, "totalPages" => 2, "page" => 2, "perPage" => 2)
  end

  it "uses the default page size when none is given" do
    data = graphql("{ companies { perPage nodes { name } } }", headers: headers)

    expect(data.dig("data", "companies", "perPage")).to eq(Pagination::Paginate::DEFAULT_PER_PAGE)
    expect(data.dig("data", "companies", "nodes").size).to eq(3)
  end

  it "pages a company's employees and counts them without loading the list" do
    company = Company.find_by!(name: "Alpha")
    create(:employee, company: company, name: "Ana")
    create(:employee, company: company, name: "Bruno")

    data = graphql(<<~GQL, headers: headers)
      { company(id: "#{company.id}") {
          employeesCount
          employeePage(page: 1, perPage: 1) { nodes { name } totalPages }
      } }
    GQL

    company_data = data.dig("data", "company")
    expect(company_data["employeesCount"]).to eq(2)
    expect(company_data.dig("employeePage", "nodes").map { |e| e["name"] }).to eq([ "Ana" ])
    expect(company_data.dig("employeePage", "totalPages")).to eq(2)
  end
end
