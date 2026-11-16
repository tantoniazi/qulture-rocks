require "rails_helper"

RSpec.describe Auth::SignOut do
  let(:user) { create(:user) }

  it "revokes the token so it can no longer be used" do
    token = Auth::IssueToken.call(user)

    result = described_class.call(token: token)

    expect(result).to be_success
    expect(JwtDenylist.count).to eq(1)
  end

  it "fails when the token is missing" do
    expect(described_class.call(token: nil)).not_to be_success
  end

  it "fails when the token is malformed" do
    result = described_class.call(token: "not-a-token")

    expect(result).not_to be_success
    expect(result.errors).to eq([ "Invalid token" ])
  end
end
