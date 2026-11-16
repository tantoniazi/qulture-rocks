require "rails_helper"

RSpec.describe User, type: :model do
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_presence_of(:email) }

  it "normalises email case for authentication" do
    create(:user, email: "Admin@Example.com")
    expect(User.find_for_database_authentication(email: "admin@example.com")).to be_present
  end
end
