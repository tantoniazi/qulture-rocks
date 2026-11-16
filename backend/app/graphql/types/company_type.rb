module Types
  class CompanyType < BaseObject
    description "A company whose organisation chart is managed by the system"

    field :id, ID, null: false
    field :name, String, null: false
    field :employees, [ "Types::EmployeeType" ], null: false

    def employees
      object.employees.order(:name)
    end
  end
end
