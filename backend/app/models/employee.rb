class Employee < ApplicationRecord
  belongs_to :company
  belongs_to :manager, class_name: "Employee", optional: true, inverse_of: :direct_reports
  has_many :direct_reports, class_name: "Employee",
                            foreign_key: :manager_id,
                            inverse_of: :manager,
                            dependent: :nullify

  validates :name, presence: true, length: { maximum: 120 }
  validates :email,
            presence: true,
            format: { with: URI::MailTo::EMAIL_REGEXP },
            uniqueness: { scope: :company_id, case_sensitive: false }
  validates :picture,
            format: { with: %r{\Ahttps?://\S+\z}, message: :http_url },
            allow_blank: true
end
