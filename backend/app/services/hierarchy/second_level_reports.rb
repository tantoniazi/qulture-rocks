module Hierarchy
  # Employees who report to any of the given employee's direct reports (second level).
  class SecondLevelReports < ApplicationQuery
    def initialize(employee)
      @employee = employee
    end

    def call
      Employee.where(manager_id: DirectReports.call(@employee).select(:id)).order(:name)
    end
  end
end
