module Employees
  # Sets (or clears, when manager is nil) the direct manager of an employee.
  #
  # Business rules:
  # - both employees must belong to the same company;
  # - an employee cannot manage themselves;
  # - the assignment must not create a loop in the hierarchy;
  # - each employee has at most one manager, so a new assignment replaces the previous one.
  class AssignManager < ApplicationService
    def initialize(employee:, manager:)
      @employee = employee
      @manager = manager
    end

    def call
      error = validation_error
      return failure(error) if error
      return failure(@employee.errors.full_messages) unless @employee.update(manager: @manager)

      success(record: @employee)
    end

    private

    def validation_error
      return nil if @manager.nil?
      return I18n.t("business_errors.employee.manager_from_other_company") if @manager.company_id != @employee.company_id
      return I18n.t("business_errors.employee.own_manager") if @manager.id == @employee.id
      return I18n.t("business_errors.employee.hierarchy_loop") if creates_loop?

      nil
    end

    # Walks up the manager chain starting at the proposed manager. If the
    # employee being updated appears in that chain, the assignment forms a cycle.
    def creates_loop?
      visited = Set.new
      current = @manager

      while current && visited.add?(current.id)
        return true if current.id == @employee.id

        current = current.manager
      end

      false
    end
  end
end
