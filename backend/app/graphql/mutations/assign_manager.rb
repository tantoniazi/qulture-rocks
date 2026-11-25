module Mutations
  class AssignManager < BaseMutation
    description "Sets the manager of an employee; pass a null managerId to remove the manager"

    argument :employee_id, ID, required: true
    argument :manager_id, ID, required: false

    field :employee, "Types::EmployeeType", null: true

    def resolve(employee_id:, manager_id: nil)
      employee = Employee.find_by(id: employee_id)
      return { employee: nil, errors: [ I18n.t("business_errors.employee.not_found") ] } unless employee

      manager = find_manager(manager_id)
      return { employee: nil, errors: [ I18n.t("business_errors.employee.manager_not_found") ] } if manager_id.present? && manager.nil?

      result = Employees::AssignManager.call(employee: employee, manager: manager)
      { employee: result.record, errors: result.errors }
    end

    private

    def find_manager(manager_id)
      manager_id.present? ? Employee.find_by(id: manager_id) : nil
    end
  end
end
