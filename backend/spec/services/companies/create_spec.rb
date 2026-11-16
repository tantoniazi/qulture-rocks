require "rails_helper"

RSpec.describe Companies::Create do
  it "creates a company" do
    result = described_class.call(name: "Qulture")

    expect(result).to be_success
    expect(result.record).to be_persisted
    expect(result.record.name).to eq("Qulture")
  end

  it "fails for a blank name" do
    result = described_class.call(name: "")

    expect(result).not_to be_success
    expect(result.errors).to include("Name can't be blank")
  end

  it "fails for a duplicated name regardless of case" do
    create(:company, name: "Qulture")
    result = described_class.call(name: "QULTURE")

    expect(result).not_to be_success
    expect(result.errors).to be_present
  end
end
