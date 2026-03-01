import { logger } from "@tokistack/logger";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { NotFoundError } from "./common/errors/api-error";
import { handleError } from "./common/errors/error-handler";
import type { ApiResponse } from "./common/types/response.type";
import { getRouteHandler } from "./router";

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<ApiResponse> => {
  const { requestContext, rawPath } = event;
  const httpMethod = requestContext.http.method;

  logger.info({ httpMethod, rawPath }, "API handler called");

  try {
    const routeHandler = getRouteHandler(httpMethod, rawPath);

    if (routeHandler === null) {
      throw new NotFoundError(`No route matched ${httpMethod} ${rawPath}`);
    }

    return await routeHandler(event);
  } catch (error) {
    return handleError(error);
  }
};
