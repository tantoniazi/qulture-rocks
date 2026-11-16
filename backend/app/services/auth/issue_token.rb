module Auth
  # Generates a signed JWT for the given user (devise-jwt encoder).
  class IssueToken < ApplicationQuery
    def initialize(user)
      @user = user
    end

    def call
      token, _payload = Warden::JWTAuth::UserEncoder.new.call(@user, :user, nil)
      token
    end
  end
end
