import { waitlist } from "@tokistack/db/schema";
import { z } from "zod";
import { BadRequestError, ForbiddenError } from "../common/errors/api-error";
import { HttpStatusCode } from "../common/http/status.constant";
import { verifyTurnstileToken } from "../common/services/turnstile.service";
import type { AppContext } from "../common/types/context.type";
import type { PublicApiEvent } from "../common/types/event.type";
import type { ApiResponse } from "../common/types/response.type";

const waitlistSignupSchema = z.object({
  email: z.email({ message: "Valid email is required" }),
  language: z.enum(["en", "de"], { message: "Language is required" }),
  turnstileToken: z.string({ message: "Turnstile token is required" }).min(1, "Turnstile token is required"),
});

/**
 * Validates the request body
 * @param body
 * @returns
 */
function validateBody(body: unknown): z.infer<typeof waitlistSignupSchema> {
  const result = waitlistSignupSchema.safeParse(body);
  if (!result.success) {
    throw new BadRequestError("Validation failed", result.error.issues.map((e) => e.message));
  }

  return { ...result.data, email: result.data.email.toLowerCase().trim() };
}

/**
 * Handles the waitlist signup when the Turnstile is valid.
 * @param event
 * @param ctx
 * @returns
 */
export async function signupHandler(event: PublicApiEvent, ctx: AppContext): Promise<ApiResponse> {
  const { email, language, turnstileToken } = validateBody(event.parsedBody);

  const ip = event.requestContext.http.sourceIp;
  const isValid = await verifyTurnstileToken(turnstileToken, ip);
  if (!isValid) {
    throw new ForbiddenError("Turnstile verification failed");
  }

  await ctx.db
    .insert(waitlist)
    .values({ email, language, status: "pending" })
    .onConflictDoNothing({ target: waitlist.email });

  return {
    statusCode: HttpStatusCode.CREATED,
  };
}
