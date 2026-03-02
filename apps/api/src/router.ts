import type { RouteHandler } from "./common/types/handler.type";

export const ROUTE_KEYS = {} as const;

export const ROUTE_HANDLING_MAP: Record<string, RouteHandler> = {};

/**
 * Matches the route handler by the path and method inputs attached to the API Gateway event.
 * @param httpMethod
 * @param rawPath
 * @returns
 */
export function getRouteHandler(
  httpMethod: string,
  routeKey: string,
): RouteHandler | null {
  const mapKey = `${httpMethod} ${routeKey.split(" ")[1]}`;
  return ROUTE_HANDLING_MAP[mapKey] ?? null;
}
