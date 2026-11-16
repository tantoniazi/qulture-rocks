module Mutations
  class DeleteEmployee < BaseMutation
    description "Removes an employee from the company"

    argument :employee_id, ID, required: true

    field :success, Boolean, null: false

    def resolve(employee_id:)
      employee = Employee.find_by(id: employee_id)
      return { success: false, errors: [ "Employee not found" ] } unless employee

      result = Employees::Destroy.call(employee: employee)
      { success: result.success?, errors: result.errors }
    end
  end
end
