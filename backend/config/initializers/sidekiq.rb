require "sidekiq/web"

# The Sidekiq dashboard is protected with HTTP basic auth. It stays closed
# unless SIDEKIQ_USERNAME and SIDEKIQ_PASSWORD are set.
module SidekiqWebAccess
  def self.granted?(given, expected)
    expected.present? &&
      ActiveSupport::SecurityUtils.secure_compare(Digest::SHA256.hexdigest(given.to_s), Digest::SHA256.hexdigest(expected))
  end
end

Sidekiq::Web.use Rack::Auth::Basic, "Sidekiq" do |username, password|
  SidekiqWebAccess.granted?(username, ENV["SIDEKIQ_USERNAME"]) &&
    SidekiqWebAccess.granted?(password, ENV["SIDEKIQ_PASSWORD"])
end

# The dashboard keeps its login state in a session, which API-only apps do not load by default.
Rails.application.config.middleware.use ActionDispatch::Cookies
Rails.application.config.middleware.use ActionDispatch::Session::CookieStore, key: "_qulture_session"
