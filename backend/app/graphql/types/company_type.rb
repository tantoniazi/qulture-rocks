module Types
  class CompanyType < BaseObject
    description "A company whose organisation chart is managed by the system"

    field :id, ID, null: false
    field :name, String, null: false
    field :employees, [ "Types::EmployeeType" ], null: false,
                                               description: "Every employee, used to draw the organogram"
    field :employees_count, Integer, null: false
    field :employee_page, "Types::EmployeePageType", null: false, description: "A page of employees, ordered by name" do
      argument :page, Integer, required: false, default_value: 1
      argument :per_page, Integer, required: false, default_value: Pagination::Paginate::DEFAULT_PER_PAGE
    end

    def employees
      object.employees.order(:name)
    end

    def employees_count
      object.employees.count
    end

    def employee_page(page:, per_page:)
      Pagination::Paginate.call(relation: object.employees.order(:name), page: page, per_page: per_page)
    end
  end
end
