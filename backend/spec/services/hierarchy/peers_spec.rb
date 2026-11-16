require "rails_helper"

RSpec.describe Hierarchy::Peers do
  let(:company) { create(:company) }
  let(:boss) { create(:employee, company: company) }

  it "returns colleagues sharing the same manager, excluding the employee" do
    employee = create(:employee, company: company, manager: boss)
    peer = create(:employee, company: company, manager: boss)
    create(:employee, company: company)

    expect(described_class.call(employee)).to contain_exactly(peer)
    expect(described_class.call(employee)).not_to include(employee)
  end

  it "returns none when the employee has no manager" do
    expect(described_class.call(boss)).to be_empty
  end
end
