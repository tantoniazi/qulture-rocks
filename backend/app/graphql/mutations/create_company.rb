module Mutations
  class CreateCompany < BaseMutation
    description "Creates a company"

    argument :name, String, required: true

    field :company, "Types::CompanyType", null: true

    def resolve(name:)
      result = Companies::Create.call(name: name)
      { company: result.record, errors: result.errors }
    end
  end
end
