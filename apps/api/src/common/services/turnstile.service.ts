import { logger } from "@tokistack/logger";
import { resolveParameter } from "./params.service";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Gets the parameter store secret for the turnstile key
 * @returns
 */
async function getSecretKey(): Promise<string> {
  return resolveParameter("/tokistack/turnstile-secret-key");
}

/**
 * Verifies the token against the Turnstile endpoint
 * @param token
 * @param ip
 * @returns
 */
export async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secret = await getSecretKey();

  try {
    const response = await fetch(
      TURNSTILE_VERIFY_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: ip,
        }),
      },
    );

    const result = (await response.json()) as { success: boolean };
    return result.success;
  } catch (error) {
    logger.error(error, "Turnstile validation error");
    return false;
  }
}
