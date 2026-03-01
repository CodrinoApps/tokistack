import { logger } from "@tokistack/logger";
import { HttpStatusCode } from "../http/status.constant";
import type { ApiResponse } from "../types/response.type";
import { ApiError } from "./api-error";

export function handleError(error: unknown): ApiResponse {
  if (error instanceof ApiError) {
    logger.warn({ statusCode: error.statusCode, details: error.details }, error.message);

    return {
      statusCode: error.statusCode,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: error.message,
        ...(error.details !== undefined && { details: error.details }),
      }),
    };
  }

  logger.error(error, "Internal Server Error");

  return {
    statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ error: "Internal server error" }),
  };
}
