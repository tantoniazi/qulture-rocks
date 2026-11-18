module Employees
  class Destroy < ApplicationService
    def initialize(employee:)
      @employee = employee
    end

    def call
      return failure([ I18n.t("business_errors.employee.delete_failed") ]) unless @employee.destroy

      success(record: @employee)
    end
  end
end
