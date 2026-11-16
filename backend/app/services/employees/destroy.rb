module Employees
  class Destroy < ApplicationService
    def initialize(employee:)
      @employee = employee
    end

    def call
      return failure([ "Employee could not be deleted" ]) unless @employee.destroy

      success(record: @employee)
    end
  end
end
