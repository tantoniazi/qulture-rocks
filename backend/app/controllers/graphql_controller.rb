class GraphqlController < ApplicationController
  before_action :authenticate_user!

  def execute
    result = BackendSchema.execute(
      params[:query],
      variables: prepare_variables(params[:variables]),
      context: { current_user: current_user },
      operation_name: params[:operationName]
    )
    render json: result
  end

  private

  def prepare_variables(variables_param)
    case variables_param
    when String then variables_param.present? ? JSON.parse(variables_param) : {}
    when ActionController::Parameters then variables_param.to_unsafe_hash
    when Hash then variables_param
    else {}
    end
  end
end
