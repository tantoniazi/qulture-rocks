module Companies
  class Create < ApplicationService
    def initialize(name:)
      @name = name
    end

    def call
      company = Company.new(name: @name)
      return failure(company.errors.full_messages) unless company.save

      success(record: company)
    end
  end
end
