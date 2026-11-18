require "rails_helper"

RSpec.describe Pagination::Paginate do
  let!(:companies) { %w[Alpha Beta Gamma].map { |name| create(:company, name: name) } }
  let(:relation) { Company.order(:name) }

  it "returns the requested page with the total count" do
    page = described_class.call(relation: relation, page: 2, per_page: 2)

    expect(page.nodes.map(&:name)).to eq([ "Gamma" ])
    expect(page.total_count).to eq(3)
    expect(page.total_pages).to eq(2)
  end

  it "treats a page below one as the first page" do
    page = described_class.call(relation: relation, page: 0, per_page: 2)

    expect(page.page).to eq(1)
    expect(page.nodes.map(&:name)).to eq(%w[Alpha Beta])
  end

  it "caps the page size to the maximum" do
    page = described_class.call(relation: relation, page: 1, per_page: 500)

    expect(page.per_page).to eq(Pagination::Paginate::MAX_PER_PAGE)
  end

  it "reports one page when there are no records" do
    page = described_class.call(relation: Company.none, page: 1, per_page: 10)

    expect(page.total_pages).to eq(1)
    expect(page.nodes).to be_empty
  end
end
