import type { AppContext } from "./context.type";
import type { ParsedApiEvent } from "./event.type";
import type { ApiResponse } from "./response.type";

export type RouteHandler = (
  event: ParsedApiEvent,
  ctx: AppContext,
) => Promise<ApiResponse>;
