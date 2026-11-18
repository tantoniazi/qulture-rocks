module Auth
  class ResetPassword < ApplicationService
    def initialize(token:, password:, password_confirmation:)
      @token = token
      @password = password
      @password_confirmation = password_confirmation
    end

    def call
      user = User.reset_password_by_token(
        reset_password_token: @token.to_s,
        password: @password,
        password_confirmation: @password_confirmation
      )
      return failure(user.errors.full_messages) if user.errors.any?

      success(record: user)
    end
  end
end
