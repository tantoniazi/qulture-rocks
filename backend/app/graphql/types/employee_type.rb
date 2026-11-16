module Types
  class EmployeeType < BaseObject
    description "An employee belonging to a company, optionally managed by another employee"

    field :id, ID, null: false
    field :name, String, null: false
    field :email, String, null: false
    field :picture, String, null: true
    field :company, "Types::CompanyType", null: false
    field :manager, "Types::EmployeeType", null: true
    field :direct_reports, [ "Types::EmployeeType" ], null: false,
                                                    description: "Employees who report directly to this employee"
    field :peers, [ "Types::EmployeeType" ], null: false,
                                           description: "Other employees sharing the same manager"
    field :second_level_reports, [ "Types::EmployeeType" ], null: false,
                                                          description: "Employees reporting to this employee's direct reports"

    def direct_reports
      Hierarchy::DirectReports.call(object)
    end

    def peers
      Hierarchy::Peers.call(object)
    end

    def second_level_reports
      Hierarchy::SecondLevelReports.call(object)
    end
  end
end
