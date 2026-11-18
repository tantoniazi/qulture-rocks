Rails.application.routes.draw do
  # Devise is used for password hashing and JWT; endpoints are declared explicitly below.
  devise_for :users, skip: :all

  post "auth/signup", to: "users/registrations#create"
  post "auth/login", to: "users/sessions#create"
  delete "auth/logout", to: "users/sessions#destroy"
  post "auth/password", to: "users/passwords#create"
  put "auth/password", to: "users/passwords#update"

  post "graphql", to: "graphql#execute"

  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"
  mount Sidekiq::Web => "/sidekiq"
  mount GraphiQL::Rails::Engine => "/graphiql", as: "graphiql_rails", graphql_path: "/graphql" if Rails.env.development?

  get "up" => "rails/health#show", as: :rails_health_check
end
