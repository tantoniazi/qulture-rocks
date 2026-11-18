module Types
  class QueryType < BaseObject
    field :companies, "Types::CompanyPageType", null: false, description: "A page of companies, ordered by name" do
      argument :page, Integer, required: false, default_value: 1
      argument :per_page, Integer, required: false, default_value: Pagination::Paginate::DEFAULT_PER_PAGE
    end
    field :company, "Types::CompanyType", null: true, description: "Find a company by id" do
      argument :id, ID, required: true
    end
    field :employee, "Types::EmployeeType", null: true, description: "Find an employee by id" do
      argument :id, ID, required: true
    end

    def companies(page:, per_page:)
      Pagination::Paginate.call(relation: Company.order(:name), page: page, per_page: per_page)
    end

    def company(id:)
      Company.find_by(id: id)
    end

    def employee(id:)
      Employee.find_by(id: id)
    end
  end
end
