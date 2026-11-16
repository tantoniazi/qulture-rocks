module Hierarchy
  # Other employees that share the same manager as the given employee.
  class Peers < ApplicationQuery
    def initialize(employee)
      @employee = employee
    end

    def call
      return Employee.none if @employee.manager_id.nil?

      Employee.where(manager_id: @employee.manager_id)
              .where.not(id: @employee.id)
              .order(:name)
    end
  end
end
