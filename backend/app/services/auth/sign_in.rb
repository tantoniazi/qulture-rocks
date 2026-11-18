module Auth
  class SignIn < ApplicationService
    def initialize(email:, password:)
      @email = email
      @password = password
    end

    def call
      user = User.find_for_database_authentication(email: @email.to_s)
      return failure([ I18n.t("business_errors.auth.invalid_credentials") ]) unless user&.valid_password?(@password.to_s)

      success(record: user, token: IssueToken.call(user))
    end
  end
end
