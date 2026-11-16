FactoryBot.define do
  factory :employee do
    company
    name { Faker::Name.name }
    sequence(:email) { |n| "employee#{n}@example.com" }
    picture { nil }

    trait :with_picture do
      picture { "https://example.com/avatar.png" }
    end
  end
end
