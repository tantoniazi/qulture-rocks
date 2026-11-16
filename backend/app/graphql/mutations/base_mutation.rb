module Mutations
  class BaseMutation < GraphQL::Schema::Mutation
    field :errors, [ String ], null: false, description: "Business rule violations; empty on success"
  end
end
