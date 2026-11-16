module Mutations
  class CreateEmployee < BaseMutation
    description "Adds an employee to a company"

    argument :company_id, ID, required: true
    argument :name, String, required: true
    argument :email, String, required: true
    argument :picture, String, required: false

    field :employee, "Types::EmployeeType", null: true

    def resolve(company_id:, name:, email:, picture: nil)
      company = Company.find_by(id: company_id)
      return { employee: nil, errors: [ "Company not found" ] } unless company

      result = Employees::Create.call(company: company, name: name, email: email, picture: picture)
      { employee: result.record, errors: result.errors }
    end
  end
end
