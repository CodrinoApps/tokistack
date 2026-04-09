import { createDb, type DbClient } from "@tokistack/db";
import { logger } from "@tokistack/logger";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { BadRequestError, NotFoundError } from "./common/errors/api-error";
import { handleError } from "./common/errors/error-handler";
import { resolveParameter } from "./common/services/params.service";
import type { AppContext } from "./common/types/context.type";
import type { ParsedApiEvent } from "./common/types/event.type";
import type { ApiResponse } from "./common/types/response.type";
import { getRouteHandler } from "./router";

let db: DbClient | null = null;

/**
 * Resolves the DB object with the connection string from SSM
 * for the handler context
 * @returns
 */
async function bootstrap(): Promise<AppContext> {
  if (!db) {
    const connectionString = await resolveParameter("/tokistack/db-connection-string");
    db = createDb(connectionString);
  }
  return { db };
}

/**
 * Parser function to set the request body when one is present for the route handler
 * @param raw
 * @returns
 */
function parseBody(raw: string | undefined): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    throw new BadRequestError("Invalid JSON");
  }
}

/**
 * Lambda event handler entry function
 * @param event
 * @returns
 */
export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<ApiResponse> => {
  const ctx = await bootstrap();
  const { requestContext, rawPath, routeKey } = event;
  const httpMethod = requestContext.http.method;

  logger.info({ httpMethod, rawPath, routeKey }, "API handler called");

  try {
    const routeHandler = getRouteHandler(httpMethod, rawPath);
    if (!routeHandler) {
      throw new NotFoundError(`No route matched ${httpMethod} ${rawPath}`);
    }
    const parsedEvent: ParsedApiEvent = { ...event, parsedBody: parseBody(event.body) };
    return await routeHandler(parsedEvent, ctx);
  } catch (error) {
    return handleError(error);
  }
};
