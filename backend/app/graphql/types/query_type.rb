module Types
  class QueryType < BaseObject
    field :companies, [ "Types::CompanyType" ], null: false, description: "All companies, ordered by name"
    field :company, "Types::CompanyType", null: true, description: "Find a company by id" do
      argument :id, ID, required: true
    end
    field :employee, "Types::EmployeeType", null: true, description: "Find an employee by id" do
      argument :id, ID, required: true
    end

    def companies
      Company.order(:name)
    end

    def company(id:)
      Company.find_by(id: id)
    end

    def employee(id:)
      Employee.find_by(id: id)
    end
  end
end
