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

  it "queues a welcome email for the new user" do
    expect { described_class.call(attributes: attributes) }.to have_enqueued_mail(UserMailer, :welcome)
  end

  it "does not queue a welcome email when the user is invalid" do
    expect { described_class.call(attributes: attributes.merge("name" => "")) }.not_to have_enqueued_mail
  end
end
