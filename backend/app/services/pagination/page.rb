module Pagination
  # One page of records plus the numbers a client needs to navigate between pages.
  Page = Data.define(:nodes, :total_count, :page, :per_page) do
    def total_pages
      [ (total_count.to_f / per_page).ceil, 1 ].max
    end
  end
end
