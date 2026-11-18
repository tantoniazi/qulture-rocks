require "rails_helper"

RSpec.describe Auth::ResetPassword do
  let(:user) { create(:user, password: "password123") }
  let(:token) { user.send_reset_password_instructions }

  it "sets the new password when the token is valid" do
    result = described_class.call(token: token, password: "newpassword1", password_confirmation: "newpassword1")

    expect(result).to be_success
    expect(user.reload.valid_password?("newpassword1")).to be(true)
  end

  it "refuses an unknown or expired token" do
    result = described_class.call(token: "bogus", password: "newpassword1", password_confirmation: "newpassword1")

    expect(result).not_to be_success
    expect(result.errors).to include("Reset password token is invalid")
  end

  it "refuses a confirmation that does not match" do
    result = described_class.call(token: token, password: "newpassword1", password_confirmation: "different1")

    expect(result).not_to be_success
    expect(user.reload.valid_password?("password123")).to be(true)
  end
end
