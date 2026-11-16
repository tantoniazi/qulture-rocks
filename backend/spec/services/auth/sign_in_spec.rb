require "rails_helper"

RSpec.describe Auth::SignIn do
  let!(:user) { create(:user, email: "ana@example.com", password: "password123") }

  it "returns the user and a token for valid credentials" do
    result = described_class.call(email: "ANA@example.com", password: "password123")

    expect(result).to be_success
    expect(result.record).to eq(user)
    expect(result.token).to be_present
  end

  it "fails for a wrong password" do
    result = described_class.call(email: "ana@example.com", password: "wrong-password")

    expect(result).not_to be_success
    expect(result.errors).to eq([ "Invalid email or password" ])
  end

  it "fails for an unknown email" do
    result = described_class.call(email: "nobody@example.com", password: "password123")

    expect(result).not_to be_success
  end
end
