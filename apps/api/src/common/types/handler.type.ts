import type { APIGatewayProxyEventV2 } from "aws-lambda";
import type { ApiResponse } from "./response.type";

export type RouteHandler = (
  event: APIGatewayProxyEventV2,
) => Promise<ApiResponse>;
