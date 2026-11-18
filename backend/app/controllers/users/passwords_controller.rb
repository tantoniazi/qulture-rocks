module Users
  class PasswordsController < ApplicationController
    def create
      Auth::RequestPasswordReset.call(email: params.require(:user).fetch(:email, ""))

      render json: { message: "If the email is registered, reset instructions are on their way." }, status: :accepted
    end

    def update
      result = Auth::ResetPassword.call(
        token: reset_params[:token],
        password: reset_params[:password],
        password_confirmation: reset_params[:password_confirmation]
      )

      if result.success?
        render json: { message: "Password updated. You can sign in with your new password." }
      else
        render json: { errors: result.errors }, status: :unprocessable_entity
      end
    end

    private

    def reset_params
      params.require(:user).permit(:token, :password, :password_confirmation)
    end
  end
end
