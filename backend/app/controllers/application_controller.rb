class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers

  LANGUAGE_LOCALES = { "en" => :en, "pt" => :"pt-BR" }.freeze

  around_action :use_requested_locale

  rescue_from ActionController::ParameterMissing do |error|
    render json: { errors: [ error.message ] }, status: :bad_request
  end

  private

  def bearer_token
    request.headers["Authorization"].to_s.split(" ").last
  end

  # Answers in the language of the first Accept-Language tag, or English when it is not supported.
  def use_requested_locale(&block)
    I18n.with_locale(requested_locale, &block)
  end

  def requested_locale
    primary_tag = request.headers["Accept-Language"].to_s.split(/[,;]/).first.to_s.strip
    LANGUAGE_LOCALES.fetch(primary_tag.split("-").first.to_s.downcase, I18n.default_locale)
  end
end
