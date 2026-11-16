module AuthHelpers
  def auth_headers_for(user)
    { "Authorization" => "Bearer #{Auth::IssueToken.call(user)}" }
  end
end
