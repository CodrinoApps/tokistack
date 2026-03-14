import type { Session, User } from "@tokistack/auth/client";
import { authEvents } from "./auth.events";

describe("authEvents", () => {
  it("should have all event creators", () => {
    expect(authEvents.sessionLoadStarted).toBeDefined();
    expect(authEvents.sessionLoaded).toBeDefined();
    expect(authEvents.sessionNotFound).toBeDefined();
    expect(authEvents.authError).toBeDefined();
    expect(authEvents.logoutStarted).toBeDefined();
    expect(authEvents.logoutCompleted).toBeDefined();
  });

  it("should create void events with correct type", () => {
    const event = authEvents.sessionLoadStarted();
    expect(event.type).toBe("[Auth] sessionLoadStarted");
    expect(event.payload).toBeUndefined();
  });

  it("should create sessionNotFound with correct type", () => {
    const event = authEvents.sessionNotFound();
    expect(event.type).toBe("[Auth] sessionNotFound");
    expect(event.payload).toBeUndefined();
  });

  it("should create logoutStarted with correct type", () => {
    const event = authEvents.logoutStarted();
    expect(event.type).toBe("[Auth] logoutStarted");
    expect(event.payload).toBeUndefined();
  });

  it("should create logoutCompleted with correct type", () => {
    const event = authEvents.logoutCompleted();
    expect(event.type).toBe("[Auth] logoutCompleted");
    expect(event.payload).toBeUndefined();
  });

  it("should create sessionLoaded with payload", () => {
    const payload = {
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
    };
    const event = authEvents.sessionLoaded(payload);
    expect(event.type).toBe("[Auth] sessionLoaded");
    expect(event.payload).toBe(payload);
  });

  it("should create authError with string payload", () => {
    const event = authEvents.authError("something went wrong");
    expect(event.type).toBe("[Auth] authError");
    expect(event.payload).toBe("something went wrong");
  });
});
