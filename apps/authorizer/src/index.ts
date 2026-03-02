import { logger } from "@tokistack/logger";
import type { APIGatewayRequestAuthorizerEventV2, APIGatewaySimpleAuthorizerResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayRequestAuthorizerEventV2,
): Promise<APIGatewaySimpleAuthorizerResult> => {
  logger.info(event, "Authorizer invoked");

  return { isAuthorized: false };
};
