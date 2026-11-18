# frozen_string_literal: true

Devise.setup do |config|
  require "devise/orm/active_record"

  config.case_insensitive_keys = [ :email ]
  config.strip_whitespace_keys = [ :email ]
  config.skip_session_storage = %i[http_auth params_auth]
  config.stretches = Rails.env.test? ? 1 : 12
  config.password_length = 8..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  config.sign_out_via = :delete
  config.mailer_sender = "no-reply@qulture.local"
  config.navigational_formats = []

  config.jwt do |jwt|
    jwt.secret = ENV.fetch("DEVISE_JWT_SECRET_KEY") { Rails.application.secret_key_base }
    jwt.expiration_time = 1.day.to_i
    jwt.dispatch_requests = []
    jwt.revocation_requests = []
  end
end
