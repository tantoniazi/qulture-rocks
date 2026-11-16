module GraphqlHelpers
  def graphql(query, variables: {}, headers: {})
    post "/graphql", params: { query: query, variables: variables }, headers: headers, as: :json
    JSON.parse(response.body)
  end
end
