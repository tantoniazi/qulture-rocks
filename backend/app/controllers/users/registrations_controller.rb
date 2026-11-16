module Users
  class RegistrationsController < ApplicationController
    def create
      result = Auth::Register.call(attributes: registration_params.to_h)

      if result.success?
        render json: session_payload(result), status: :created
      else
        render json: { errors: result.errors }, status: :unprocessable_entity
      end
    end

    private

    def registration_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end

    def session_payload(result)
      user = result.record
      { token: result.token, user: { id: user.id, name: user.name, email: user.email } }
    end
  end
end
