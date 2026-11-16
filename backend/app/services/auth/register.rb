module Auth
  class Register < ApplicationService
    def initialize(attributes:)
      @attributes = attributes
    end

    def call
      user = User.new(@attributes)
      return failure(user.errors.full_messages) unless user.save

      success(record: user, token: IssueToken.call(user))
    end
  end
end
