require "rails_helper"

RSpec.describe Employee, type: :model do
  subject { build(:employee) }

  it { is_expected.to belong_to(:company) }
  it { is_expected.to belong_to(:manager).class_name("Employee").optional }
  it { is_expected.to have_many(:direct_reports).class_name("Employee").with_foreign_key(:manager_id).dependent(:nullify) }

  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_presence_of(:email) }
  it { is_expected.to validate_uniqueness_of(:email).scoped_to(:company_id).case_insensitive }

  it "accepts a blank picture" do
    expect(build(:employee, picture: nil)).to be_valid
  end

  it "accepts an http(s) picture URL" do
    expect(build(:employee, picture: "https://example.com/a.png")).to be_valid
  end

  it "rejects a picture that is not a URL" do
    employee = build(:employee, picture: "not a url")
    expect(employee).not_to be_valid
    expect(employee.errors[:picture]).to be_present
  end
end
