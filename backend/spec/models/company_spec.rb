require "rails_helper"

RSpec.describe Company, type: :model do
  subject { build(:company) }

  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_length_of(:name).is_at_most(120) }
  it { is_expected.to validate_uniqueness_of(:name).case_insensitive }
  it { is_expected.to have_many(:employees).dependent(:destroy) }
end
