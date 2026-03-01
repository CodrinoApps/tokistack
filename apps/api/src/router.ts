import type { RouteHandler } from "./common/types/handler.type";

export const ROUTE_KEYS = {} as const;

export const ROUTE_HANDLING_MAP: Record<string, RouteHandler> = {};

export function getRouteHandler(
  httpMethod: string,
  rawPath: string,
): RouteHandler | null {
  const mapKey = `${httpMethod} ${rawPath}`;
  return ROUTE_HANDLING_MAP[mapKey] ?? null;
}
