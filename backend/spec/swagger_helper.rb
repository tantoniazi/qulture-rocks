require "rails_helper"

RSpec.configure do |config|
  config.openapi_root = Rails.root.join("swagger").to_s

  config.openapi_specs = {
    "v1/swagger.yaml" => {
      openapi: "3.0.1",
      info: {
        title: "Qulture Organogram API",
        version: "v1",
        description: "Authentication endpoints. Domain operations (companies, employees, hierarchy) are exposed through GraphQL at POST /graphql."
      },
      servers: [ { url: "http://localhost:3000" } ],
      components: {
        securitySchemes: {
          bearerAuth: { type: :http, scheme: :bearer, bearerFormat: :JWT }
        },
        schemas: {
          SignupRequest: {
            type: :object,
            required: %w[user],
            properties: {
              user: {
                type: :object,
                required: %w[name email password password_confirmation],
                properties: {
                  name: { type: :string, example: "Ana Souza" },
                  email: { type: :string, format: :email, example: "ana@example.com" },
                  password: { type: :string, minLength: 8, example: "password123" },
                  password_confirmation: { type: :string, example: "password123" }
                }
              }
            }
          },
          LoginRequest: {
            type: :object,
            required: %w[user],
            properties: {
              user: {
                type: :object,
                required: %w[email password],
                properties: {
                  email: { type: :string, format: :email },
                  password: { type: :string }
                }
              }
            }
          },
          AuthResponse: {
            type: :object,
            properties: {
              token: { type: :string, description: "Send as `Authorization: Bearer <token>`" },
              user: {
                type: :object,
                properties: {
                  id: { type: :integer },
                  name: { type: :string },
                  email: { type: :string }
                }
              }
            }
          },
          ErrorResponse: {
            type: :object,
            properties: {
              errors: { type: :array, items: { type: :string } }
            }
          }
        }
      }
    }
  }

  config.openapi_format = :yaml
end
