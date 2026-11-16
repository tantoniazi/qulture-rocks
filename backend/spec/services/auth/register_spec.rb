require "rails_helper"

RSpec.describe Auth::Register do
  let(:attributes) do
    { "name" => "Ana", "email" => "ana@example.com", "password" => "password123", "password_confirmation" => "password123" }
  end

  it "creates the user and returns a token" do
    result = described_class.call(attributes: attributes)

    expect(result).to be_success
    expect(result.record).to be_persisted
    expect(result.token).to be_present
  end

  it "fails with invalid attributes" do
    result = described_class.call(attributes: attributes.merge("password" => "short", "password_confirmation" => "short"))

    expect(result).not_to be_success
    expect(result.errors).to be_present
  end
end
