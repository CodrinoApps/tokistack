import { TestBed } from "@angular/core/testing";
import { type ActivatedRouteSnapshot, provideRouter, type RouterStateSnapshot, UrlTree } from "@angular/router";
import { Dispatcher } from "@ngrx/signals/events";
import type { Session, User } from "@tokistack/auth/client";
import { authEvents } from "./auth.events";
import { authGuard } from "./auth.guard";
import { AuthStore } from "./auth.store";

describe("authGuard", () => {
  let dispatcher: Dispatcher;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    TestBed.inject(AuthStore);
    dispatcher = TestBed.inject(Dispatcher);
  });

  it("should redirect to /auth/sign-in when not authenticated", () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe("/auth/sign-in");
  });

  it("should return true when authenticated", () => {
    dispatcher.dispatch(
      authEvents.sessionLoaded({
        session: {
          id: "s1",
          userId: "u1",
          token: "t",
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Session,
        user: {
          id: "u1",
          name: "Test",
          email: "test@test.com",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User,
      }),
    );
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });
});
