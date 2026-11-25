module Auth
  # Revokes a token by adding its identifier (jti) to the denylist.
  class SignOut < ApplicationService
    def initialize(token:)
      @token = token
    end

    def call
      return failure([ I18n.t("business_errors.auth.missing_token") ]) if @token.blank?

      payload = Warden::JWTAuth::TokenDecoder.new.call(@token)
      JwtDenylist.create!(jti: payload["jti"], exp: Time.zone.at(payload["exp"]))
      success
    rescue JWT::DecodeError
      failure([ I18n.t("business_errors.auth.invalid_token") ])
    end
  end
end
