require "rails_helper"

RSpec.describe Employees::AssignManager do
  let(:company) { create(:company) }
  let(:employee) { create(:employee, company: company) }
  let(:manager) { create(:employee, company: company) }

  it "assigns the manager" do
    result = described_class.call(employee: employee, manager: manager)

    expect(result).to be_success
    expect(employee.reload.manager).to eq(manager)
  end

  it "replaces the previous manager, keeping at most one" do
    previous = create(:employee, company: company)
    employee.update!(manager: previous)

    described_class.call(employee: employee, manager: manager)

    expect(employee.reload.manager).to eq(manager)
  end

  it "removes the manager when nil is given" do
    employee.update!(manager: manager)

    result = described_class.call(employee: employee, manager: nil)

    expect(result).to be_success
    expect(employee.reload.manager).to be_nil
  end

  it "rejects managers from another company" do
    outsider = create(:employee, company: create(:company))

    result = described_class.call(employee: employee, manager: outsider)

    expect(result).not_to be_success
    expect(result.errors).to include("Manager must belong to the same company")
    expect(employee.reload.manager).to be_nil
  end

  it "rejects an employee managing themselves" do
    result = described_class.call(employee: employee, manager: employee)

    expect(result).not_to be_success
    expect(result.errors).to include("An employee cannot be their own manager")
  end

  it "rejects a direct loop (manager reports to employee)" do
    manager.update!(manager: employee)

    result = described_class.call(employee: employee, manager: manager)

    expect(result).not_to be_success
    expect(result.errors).to include("Assignment would create a hierarchy loop")
  end

  it "rejects a deep loop (manager is a subordinate several levels below)" do
    level_two = create(:employee, company: company, manager: employee)
    level_three = create(:employee, company: company, manager: level_two)

    result = described_class.call(employee: employee, manager: level_three)

    expect(result).not_to be_success
    expect(result.errors).to include("Assignment would create a hierarchy loop")
  end
end
