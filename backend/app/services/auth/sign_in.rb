module Auth
  class SignIn < ApplicationService
    INVALID_CREDENTIALS = [ "Invalid email or password" ].freeze

    def initialize(email:, password:)
      @email = email
      @password = password
    end

    def call
      user = User.find_for_database_authentication(email: @email.to_s)
      return failure(INVALID_CREDENTIALS) unless user&.valid_password?(@password.to_s)

      success(record: user, token: IssueToken.call(user))
    end
  end
end
