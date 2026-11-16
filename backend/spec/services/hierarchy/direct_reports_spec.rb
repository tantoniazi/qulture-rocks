require "rails_helper"

RSpec.describe Hierarchy::DirectReports do
  it "returns only the employees managed directly by the given employee" do
    boss = create(:employee)
    report = create(:employee, company: boss.company, manager: boss)
    create(:employee, company: boss.company, manager: report)

    expect(described_class.call(boss)).to contain_exactly(report)
  end
end
