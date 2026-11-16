require "rails_helper"

RSpec.describe Hierarchy::SecondLevelReports do
  it "returns the reports of the direct reports, not the direct reports themselves" do
    company = create(:company)
    boss = create(:employee, company: company)
    direct = create(:employee, company: company, manager: boss)
    second = create(:employee, company: company, manager: direct)
    create(:employee, company: company, manager: boss)

    expect(described_class.call(boss)).to contain_exactly(second)
  end
end
