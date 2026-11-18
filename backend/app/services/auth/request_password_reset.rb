module Auth
  class RequestPasswordReset < ApplicationService
    def initialize(email:)
      @email = email
    end

    # Always succeeds, so the response never reveals whether the email is registered.
    def call
      User.send_reset_password_instructions(email: @email.to_s)
      success
    end
  end
end
