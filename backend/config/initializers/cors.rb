# Allows the React frontend (served by Vite) to call the API from the browser.
# FRONTEND_URL can hold a comma-separated list (e.g. localhost for local dev,
# frontend:5173 inside Docker Compose).
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins *ENV.fetch("FRONTEND_URL", "http://localhost:5173").split(",").map(&:strip)
    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head]
  end
end
