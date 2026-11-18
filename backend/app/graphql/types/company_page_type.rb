module Types
  class CompanyPageType < BaseObject
    description "One page of companies"

    field :nodes, [ "Types::CompanyType" ], null: false
    field :total_count, Integer, null: false
    field :page, Integer, null: false
    field :per_page, Integer, null: false
    field :total_pages, Integer, null: false
  end
end
