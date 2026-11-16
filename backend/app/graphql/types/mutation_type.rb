module Types
  class MutationType < BaseObject
    field :create_company, mutation: Mutations::CreateCompany
    field :create_employee, mutation: Mutations::CreateEmployee
    field :delete_employee, mutation: Mutations::DeleteEmployee
    field :assign_manager, mutation: Mutations::AssignManager
  end
end
