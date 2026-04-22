import { createAuth } from "@tokistack/auth";
import { createDb, type DbClient } from "@tokistack/db";
import { logger } from "@tokistack/logger";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { resolveParameter } from "./common/services/params.service";

let db: DbClient | null = null;
let auth: ReturnType<typeof createAuth> | null = null;

/**
 * Resolves the DB object with the connection string from SSM
 * for the handler context
 * @returns
 */
async function bootstrap() {
  if (!db) {
    const connectionString = await resolveParameter("/tokistack/db-connection-string");
    db = createDb(connectionString);
  }
  if (!auth) {
    const [secret, baseURL] = await Promise.all([
      resolveParameter("/tokistack/better-auth-secret"),
      resolveParameter("/tokistack/better-auth-url"),
    ]);
    const disableSignUp = process.env.CLUSTER_NAME !== "testing";
    auth = createAuth(db, { secret, baseURL, disableSignUp });
  }
  return auth;
}

/**
 * Formats the API gateway event into a format that can be handled by better-auth
 * @param event
 * @returns
 */
export function eventToRequest(event: APIGatewayProxyEventV2): Request {
  const qs = event.rawQueryString ? `?${event.rawQueryString}` : "";
  const url = `https://${event.requestContext.domainName}${event.rawPath}${qs}`;
  const headers = new Headers(event.headers as Record<string, string>);
  if (event.cookies?.length && !headers.has("cookie")) {
    headers.set("cookie", event.cookies.join("; "));
  }
  const method = event.requestContext.http.method;
  let body: Uint8Array | string | undefined;
  if (method !== "GET" && method !== "HEAD" && event.body) {
    body = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
  }

  return new Request(url, { method, headers, body });
}

/**
 * Formats the better-auth result into an API gateway compatible format
 * @param response
 * @returns
 */
export async function responseToResult(response: Response): Promise<APIGatewayProxyStructuredResultV2> {
  const headers: Record<string, string> = {};
  const cookies: string[] = [];

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      cookies.push(value);
    } else {
      headers[key] = value;
    }
  });

  return {
    statusCode: response.status,
    headers,
    ...(cookies.length > 0 && { cookies }),
    body: await response.text(),
  };
}

/**
 * auth-handler entry point
 * @param event
 * @returns
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const { rawPath } = event;
  const httpMethod = event.requestContext.http.method;

  logger.info({ httpMethod, rawPath }, "Auth handler called");

  const auth = await bootstrap();
  const request = eventToRequest(event);
  const response = await auth.handler(request);
  return responseToResult(response);
};
