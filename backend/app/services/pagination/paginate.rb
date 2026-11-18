module Pagination
  # Slices an ordered relation into one page. Out-of-range inputs are clamped
  # instead of rejected, so clients always receive a usable page.
  class Paginate < ApplicationQuery
    DEFAULT_PER_PAGE = 10
    MAX_PER_PAGE = 50

    def initialize(relation:, page:, per_page:)
      @relation = relation
      @page = [ page.to_i, 1 ].max
      @per_page = per_page.to_i.clamp(1, MAX_PER_PAGE)
    end

    def call
      Page.new(
        nodes: @relation.offset(offset).limit(@per_page).to_a,
        total_count: @relation.count,
        page: @page,
        per_page: @per_page
      )
    end

    private

    def offset
      (@page - 1) * @per_page
    end
  end
end
