import { signalStore, withState } from "@ngrx/signals";
import { on, withReducer } from "@ngrx/signals/events";
import type { Session, User } from "@tokistack/auth/client";
import { authEvents } from "./auth.events";

type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withReducer(
    on(authEvents.sessionLoadStarted, () => ({ isLoading: true, error: null })),
    on(authEvents.sessionLoaded, ({ payload }) => ({
      user: payload.user,
      session: payload.session,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })),
    on(authEvents.sessionNotFound, () => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })),
    on(authEvents.authError, ({ payload }) => ({ isLoading: false, error: payload })),
    on(authEvents.logoutStarted, () => ({ isLoading: true })),
    on(authEvents.logoutCompleted, () => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })),
  ),
);
