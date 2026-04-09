import type { RouteHandler } from "./common/types/handler.type";
import { signupHandler } from "./waitlist/signup.handler";

export const ROUTE_KEYS = {
  WAITLIST_SIGNUP: "POST /api/waitlist/signup",
} as const;

export const ROUTE_HANDLING_MAP: Record<string, RouteHandler> = {
  [ROUTE_KEYS.WAITLIST_SIGNUP]: signupHandler,
};

/**
 * Matches the route handler by the path and method inputs attached to the API Gateway event.
 * @param httpMethod
 * @param rawPath
 * @returns
 */
export function getRouteHandler(
  httpMethod: string,
  rawPath: string,
): RouteHandler | null {
  const mapKey = `${httpMethod} ${rawPath}`;
  return ROUTE_HANDLING_MAP[mapKey] ?? null;
}
