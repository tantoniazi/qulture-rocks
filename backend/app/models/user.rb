class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  validates :name, presence: true, length: { maximum: 120 }

  # Devise mails are sent through Sidekiq so the request does not wait for SMTP.
  def send_devise_notification(notification, *args)
    devise_mailer.send(notification, self, *args).deliver_later
  end
end
