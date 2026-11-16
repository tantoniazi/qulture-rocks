require "swagger_helper"

RSpec.describe "Authentication", type: :request do
  path "/auth/signup" do
    post "Registers a user and returns a JWT" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"
      parameter name: :payload, in: :body, schema: { "$ref" => "#/components/schemas/SignupRequest" }

      response "201", "user created" do
        schema "$ref" => "#/components/schemas/AuthResponse"

        let(:payload) do
          { user: { name: "Ana", email: "ana@example.com", password: "password123", password_confirmation: "password123" } }
        end

        run_test!
      end

      response "422", "validation failed" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let(:payload) { { user: { name: "", email: "bad", password: "123" } } }

        run_test!
      end
    end
  end

  path "/auth/login" do
    post "Signs in and returns a JWT" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"
      parameter name: :payload, in: :body, schema: { "$ref" => "#/components/schemas/LoginRequest" }

      response "200", "signed in" do
        schema "$ref" => "#/components/schemas/AuthResponse"

        let!(:existing) { create(:user, email: "login@example.com", password: "password123") }
        let(:payload) { { user: { email: "login@example.com", password: "password123" } } }

        run_test!
      end

      response "401", "invalid credentials" do
        schema "$ref" => "#/components/schemas/ErrorResponse"

        let(:payload) { { user: { email: "nobody@example.com", password: "wrong-password" } } }

        run_test!
      end
    end
  end

  path "/auth/logout" do
    delete "Revokes the current JWT" do
      tags "Authentication"
      security [ bearerAuth: [] ]

      response "204", "signed out" do
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers_for(user)["Authorization"] }

        run_test!
      end

      response "401", "missing or invalid token" do
        let(:Authorization) { "Bearer invalid" }

        run_test!
      end
    end
  end
end
