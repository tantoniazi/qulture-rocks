module Users
  class SessionsController < ApplicationController
    def create
      result = Auth::SignIn.call(**login_params.to_h.symbolize_keys)

      if result.success?
        user = result.record
        render json: { token: result.token, user: { id: user.id, name: user.name, email: user.email } }
      else
        render json: { errors: result.errors }, status: :unauthorized
      end
    end

    def destroy
      result = Auth::SignOut.call(token: bearer_token)

      if result.success?
        head :no_content
      else
        render json: { errors: result.errors }, status: :unauthorized
      end
    end

    private

    def login_params
      params.require(:user).permit(:email, :password)
    end
  end
end
