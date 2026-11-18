require "rails_helper"

RSpec.describe "Localized error messages", type: :request do
  let(:portuguese) { { "Accept-Language" => "pt-BR,pt;q=0.9,en;q=0.8" } }

  describe "sign in" do
    before { create(:user, email: "ana@example.com") }

    it "answers in Portuguese when the client asks for pt-BR" do
      post "/auth/login", params: { user: { email: "ana@example.com", password: "wrong" } }, headers: portuguese, as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["errors"]).to eq([ "E-mail ou senha inválidos" ])
    end

    it "answers in English without an Accept-Language header" do
      post "/auth/login", params: { user: { email: "ana@example.com", password: "wrong" } }, as: :json

      expect(response.parsed_body["errors"]).to eq([ "Invalid email or password" ])
    end

    it "answers in English when the client asks for English" do
      post "/auth/login", params: { user: { email: "ana@example.com", password: "wrong" } },
                          headers: { "Accept-Language" => "en-US,en;q=0.9" }, as: :json

      expect(response.parsed_body["errors"]).to eq([ "Invalid email or password" ])
    end
  end

  describe "sign up" do
    it "translates field names and validation messages" do
      post "/auth/signup", params: { user: { name: "", email: "ana@example.com", password: "password123",
                                             password_confirmation: "password123" } },
                           headers: portuguese, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to eq([ "Nome não pode ficar em branco" ])
    end
  end

  describe "GraphQL" do
    it "translates business rule errors" do
      user = create(:user)

      data = graphql(<<~GQL, headers: auth_headers_for(user).merge(portuguese))
        mutation { createEmployee(companyId: "0", name: "Ana", email: "ana@example.com") { errors } }
      GQL

      expect(data.dig("data", "createEmployee", "errors")).to eq([ "Empresa não encontrada" ])
    end
  end
end
