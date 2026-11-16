class Company < ApplicationRecord
  has_many :employees, dependent: :destroy

  validates :name,
            presence: true,
            length: { maximum: 120 },
            uniqueness: { case_sensitive: false }
end
