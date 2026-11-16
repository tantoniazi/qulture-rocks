class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers

  rescue_from ActionController::ParameterMissing do |error|
    render json: { errors: [ error.message ] }, status: :bad_request
  end

  private

  def bearer_token
    request.headers["Authorization"].to_s.split(" ").last
  end
end
