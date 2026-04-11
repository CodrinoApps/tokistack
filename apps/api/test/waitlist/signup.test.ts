import { waitlist } from "@tokistack/db/schema";
import { createApiEvent, testDb } from "@tokistack/test-utils";
import { HttpStatusCode } from "../../src/common/http/status.constant";
import * as emailService from "../../src/common/services/email.service";
import * as turnstileService from "../../src/common/services/turnstile.service";
import { handler } from "../../src/index";

let mockVerifyTurnstile: jest.SpyInstance;
let mockSendWaitlistConfirmation: jest.SpyInstance;

function createSignupEvent(body?: Record<string, unknown>) {
  return createApiEvent("POST", "/api/waitlist/signup", {
    body: body ? JSON.stringify(body) : undefined,
  });
}

const validBody = {
  email: "test@example.com",
  language: "en",
  turnstileToken: "valid-token",
};

describe("POST /api/waitlist/signup", () => {
  beforeEach(() => {
    mockVerifyTurnstile = jest.spyOn(turnstileService, "verifyTurnstileToken").mockResolvedValue(true);
    mockSendWaitlistConfirmation = jest.spyOn(emailService, "sendWaitlistConfirmation").mockResolvedValue(undefined);
  });

  it("inserts email with pending status on valid request", async () => {
    const response = await handler(createSignupEvent(validBody));

    expect(response.statusCode).toBe(HttpStatusCode.CREATED);

    const rows = await testDb.select().from(waitlist);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      email: "test@example.com",
      status: "pending",
      language: "en",
    });
  });

  it("sends confirmation email on successful signup", async () => {
    await handler(createSignupEvent(validBody));

    expect(mockSendWaitlistConfirmation).toHaveBeenCalledTimes(1);
    expect(mockSendWaitlistConfirmation).toHaveBeenCalledWith("test@example.com", "en");
  });

  it("is idempotent for duplicate emails", async () => {
    await handler(createSignupEvent(validBody));
    const response = await handler(createSignupEvent(validBody));

    expect(response.statusCode).toBe(HttpStatusCode.CREATED);

    const rows = await testDb.select().from(waitlist);
    expect(rows).toHaveLength(1);
  });

  it("does not send confirmation email for duplicate signup", async () => {
    await handler(createSignupEvent(validBody));
    mockSendWaitlistConfirmation.mockClear();
    await handler(createSignupEvent(validBody));

    expect(mockSendWaitlistConfirmation).not.toHaveBeenCalled();
  });

  it("normalizes email to lowercase", async () => {
    await handler(createSignupEvent({ ...validBody, email: "Test@EXAMPLE.com" }));

    const rows = await testDb.select().from(waitlist);
    expect(rows[0]!.email).toBe("test@example.com");
  });

  it("returns 400 for missing body", async () => {
    const response = await handler(createApiEvent("POST", "/api/waitlist/signup"));

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it("returns 400 for invalid email format", async () => {
    const response = await handler(createSignupEvent({ ...validBody, email: "not-an-email" }));

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    const body = JSON.parse((response as { body: string }).body);
    expect(body.details).toContain("Valid email is required");
  });

  it("returns 400 for missing email", async () => {
    const response = await handler(
      createSignupEvent({ language: validBody.language, turnstileToken: validBody.turnstileToken }),
    );

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it("returns 400 for missing language", async () => {
    const response = await handler(
      createSignupEvent({ email: validBody.email, turnstileToken: validBody.turnstileToken }),
    );

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it("returns 400 for missing turnstile token", async () => {
    const response = await handler(createSignupEvent({ email: validBody.email, language: validBody.language }));

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it("returns 400 with all validation errors", async () => {
    const response = await handler(createSignupEvent({}));

    expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    const body = JSON.parse((response as { body: string }).body);
    expect(body.details).toHaveLength(3);
  });

  it("returns 403 when Turnstile verification fails", async () => {
    mockVerifyTurnstile.mockResolvedValueOnce(false);

    const response = await handler(createSignupEvent(validBody));

    expect(response.statusCode).toBe(HttpStatusCode.FORBIDDEN);
  });
});
