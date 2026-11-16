module Employees
  class Create < ApplicationService
    def initialize(company:, name:, email:, picture: nil)
      @company = company
      @attributes = { name: name, email: email, picture: picture }
    end

    def call
      employee = @company.employees.new(@attributes)
      return failure(employee.errors.full_messages) unless employee.save

      success(record: employee)
    end
  end
end
