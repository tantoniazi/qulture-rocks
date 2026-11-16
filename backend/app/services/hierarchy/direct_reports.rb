module Hierarchy
  # Employees who report directly to the given employee (first level).
  class DirectReports < ApplicationQuery
    def initialize(employee)
      @employee = employee
    end

    def call
      Employee.where(manager_id: @employee.id).order(:name)
    end
  end
end
