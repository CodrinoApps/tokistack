import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";
import type { Session, User } from "@tokistack/auth/client";

export const authEvents = eventGroup({
  source: "Auth",
  events: {
    sessionLoadStarted: type<void>(),
    sessionLoaded: type<{ session: Session; user: User }>(),
    sessionNotFound: type<void>(),
    authError: type<string>(),
    logoutStarted: type<void>(),
    logoutCompleted: type<void>(),
  },
});
