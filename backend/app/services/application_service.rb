# Base class for write operations. Each service receives its inputs through
# keyword arguments and returns a Result, so callers never deal with exceptions
# for expected business failures.
class ApplicationService
  Result = Struct.new(:record, :errors, :token, keyword_init: true) do
    def success?
      errors.empty?
    end
  end

  def self.call(**)
    new(**).call
  end

  private

  def success(record: nil, token: nil)
    Result.new(record: record, errors: [], token: token)
  end

  def failure(errors)
    Result.new(record: nil, errors: Array(errors), token: nil)
  end
end
