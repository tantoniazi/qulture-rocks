require "rails_helper"

RSpec.describe Employees::Create do
  let(:company) { create(:company) }

  it "adds an employee to the company" do
    result = described_class.call(company: company, name: "Ana", email: "ana@example.com", picture: nil)

    expect(result).to be_success
    expect(result.record.company).to eq(company)
  end

  it "fails when the email is already used in the same company" do
    create(:employee, company: company, email: "ana@example.com")
    result = described_class.call(company: company, name: "Ana", email: "ana@example.com")

    expect(result).not_to be_success
    expect(result.errors).to be_present
  end

  it "allows the same email in another company" do
    create(:employee, company: create(:company), email: "ana@example.com")
    result = described_class.call(company: company, name: "Ana", email: "ana@example.com")

    expect(result).to be_success
  end
end
