require "rails_helper"

RSpec.describe UserMailer do
  describe "#welcome" do
    let(:user) { create(:user, name: "Ana", email: "ana@example.com") }
    let(:mail) { described_class.welcome(user) }

    it "is addressed to the new user" do
      expect(mail.to).to eq([ "ana@example.com" ])
      expect(mail.subject).to eq("Welcome to Qulture Organogram")
    end

    it "greets the user by name" do
      expect(mail.body.encoded).to include("Hi Ana")
    end
  end
end
