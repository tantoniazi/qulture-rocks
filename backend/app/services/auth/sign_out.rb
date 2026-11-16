module Auth
  # Revokes a token by adding its identifier (jti) to the denylist.
  class SignOut < ApplicationService
    def initialize(token:)
      @token = token
    end

    def call
      return failure([ "Missing token" ]) if @token.blank?

      payload = Warden::JWTAuth::TokenDecoder.new.call(@token)
      JwtDenylist.create!(jti: payload["jti"], exp: Time.zone.at(payload["exp"]))
      success
    rescue JWT::DecodeError
      failure([ "Invalid token" ])
    end
  end
end
