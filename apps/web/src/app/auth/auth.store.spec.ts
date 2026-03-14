import { TestBed } from "@angular/core/testing";
import { Dispatcher } from "@ngrx/signals/events";
import type { Session, User } from "@tokistack/auth/client";
import { authEvents } from "./auth.events";
import { AuthStore } from "./auth.store";

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  emailVerified: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  image: null,
} as User;

const mockSession = {
  id: "session-1",
  userId: "user-1",
  token: "test-token",
  expiresAt: new Date("2025-12-31"),
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
  activeOrganizationId: null,
} as Session;

describe("AuthStore", () => {
  let store: InstanceType<typeof AuthStore>;
  let dispatcher: Dispatcher;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AuthStore);
    dispatcher = TestBed.inject(Dispatcher);
  });

  it("should have correct initial state", () => {
    expect(store.user()).toBeNull();
    expect(store.session()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it("should set isLoading on sessionLoadStarted", () => {
    dispatcher.dispatch(authEvents.sessionLoadStarted());
    expect(store.isLoading()).toBe(true);
    expect(store.error()).toBeNull();
  });

  it("should set user and session on sessionLoaded", () => {
    dispatcher.dispatch(authEvents.sessionLoaded({ session: mockSession, user: mockUser }));
    expect(store.user()).toBe(mockUser);
    expect(store.session()).toBe(mockSession);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it("should clear error when sessionLoaded after authError", () => {
    dispatcher.dispatch(authEvents.authError("some error"));
    dispatcher.dispatch(authEvents.sessionLoaded({ session: mockSession, user: mockUser }));
    expect(store.error()).toBeNull();
    expect(store.isAuthenticated()).toBe(true);
  });

  it("should reset to unauthenticated on sessionNotFound", () => {
    dispatcher.dispatch(authEvents.sessionLoaded({ session: mockSession, user: mockUser }));
    dispatcher.dispatch(authEvents.sessionNotFound());
    expect(store.user()).toBeNull();
    expect(store.session()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it("should set error on authError", () => {
    dispatcher.dispatch(authEvents.authError("some error"));
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe("some error");
  });

  it("should set isLoading on logoutStarted", () => {
    dispatcher.dispatch(authEvents.logoutStarted());
    expect(store.isLoading()).toBe(true);
  });

  it("should reset to unauthenticated on logoutCompleted", () => {
    dispatcher.dispatch(authEvents.sessionLoaded({ session: mockSession, user: mockUser }));
    dispatcher.dispatch(authEvents.logoutCompleted());
    expect(store.user()).toBeNull();
    expect(store.session()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
