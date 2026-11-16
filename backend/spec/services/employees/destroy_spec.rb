require "rails_helper"

RSpec.describe Employees::Destroy do
  it "removes the employee" do
    employee = create(:employee)

    expect { described_class.call(employee: employee) }.to change(Employee, :count).by(-1)
  end

  it "leaves direct reports without a manager" do
    manager = create(:employee)
    report = create(:employee, company: manager.company, manager: manager)

    described_class.call(employee: manager)

    expect(report.reload.manager).to be_nil
  end
end
