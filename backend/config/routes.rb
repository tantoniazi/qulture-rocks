Rails.application.routes.draw do
  # Devise is used for password hashing and JWT; endpoints are declared explicitly below.
  devise_for :users, skip: :all

  post "auth/signup", to: "users/registrations#create"
  post "auth/login", to: "users/sessions#create"
  delete "auth/logout", to: "users/sessions#destroy"

  post "graphql", to: "graphql#execute"

  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"

  get "up" => "rails/health#show", as: :rails_health_check
end
