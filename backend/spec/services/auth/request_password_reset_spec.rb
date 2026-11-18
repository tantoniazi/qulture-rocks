require "rails_helper"

RSpec.describe Auth::RequestPasswordReset do
  it "queues the reset instructions for a registered email" do
    user = create(:user, email: "ana@example.com")

    expect { described_class.call(email: "ana@example.com") }
      .to have_enqueued_mail(Devise::Mailer, :reset_password_instructions)
    expect(user.reload.reset_password_token).to be_present
  end

  it "succeeds without sending anything for an unknown email, so it reveals nothing" do
    result = nil

    expect { result = described_class.call(email: "nobody@example.com") }.not_to have_enqueued_mail
    expect(result).to be_success
  end
end
