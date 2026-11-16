# Base class for read-only operations that return relations or collections.
class ApplicationQuery
  def self.call(...)
    new(...).call
  end
end
