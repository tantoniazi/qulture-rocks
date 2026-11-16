class BackendSchema < GraphQL::Schema
  query(Types::QueryType)
  mutation(Types::MutationType)

  max_depth 15
  max_query_string_tokens 5000
  validate_max_errors 100
end
