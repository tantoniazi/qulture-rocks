require "swagger_helper"

RSpec.describe "Password recovery", type: :request do
  path "/auth/password" do
    post "Sends password reset instructions to a registered email" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"
      parameter name: :payload, in: :body, schema: { "$ref" => "#/components/schemas/PasswordRequest" }

      response "202", "instructions accepted (the same for registered and unknown emails)" do
        schema "$ref" => "#/components/schemas/MessageResponse"

        let(:payload) { { user: { email: "nobody@example.com" } } }

        run_test!
      end
    end

    put "Sets a new password using the token from the reset email" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"
      parameter name: :payload, in: :body, schema: { "$ref" => "#/components/schemas/PasswordResetRequest" }

      response "200", "password updated" do
        schema "$ref" => "#/components/schemas/MessageResponse"

        let(:payload) do
          user = create(:user)
          { user: { token: user.send_reset_password_instructions, password: "newpassword1", password_confirmation: "newpassword1" } }
        end

        run_test!
      end

      response "422", "token invalid or passwords do not match" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let(:payload) { { user: { token: "bogus", password: "newpassword1", password_confirmation: "newpassword1" } } }

        run_test!
      end
    end
  end
end
