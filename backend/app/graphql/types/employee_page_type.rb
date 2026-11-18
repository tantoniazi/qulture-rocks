module Types
  class EmployeePageType < BaseObject
    description "One page of employees"

    field :nodes, [ "Types::EmployeeType" ], null: false
    field :total_count, Integer, null: false
    field :page, Integer, null: false
    field :per_page, Integer, null: false
    field :total_pages, Integer, null: false
  end
end
