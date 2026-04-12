import { EmailClient } from "@tokistack/email";
import { SendWaitlistConfirmationCommand } from "@tokistack/email/commands/send-waitlist-confirmation";
import type { Locale } from "@tokistack/email/types";
import { logger } from "@tokistack/logger";
import { resolveParameter } from "./params.service";

let client: EmailClient | null = null;

/**
 * Gets the email client or instantiates it when necessary
 * @returns
 */
async function getClient(): Promise<EmailClient> {
  if (!client) {
    const apiKey = await resolveParameter("/tokistack/resend-api-key");
    client = new EmailClient({ apiKey });
  }
  return client;
}

/**
 * Sends a waitlist confirmation email
 * @param to
 * @param locale
 */
export async function sendWaitlistConfirmation(to: string, locale: Locale): Promise<void> {
  try {
    const emailClient = await getClient();
    await emailClient.send(new SendWaitlistConfirmationCommand({ to, locale }));
  } catch (err) {
    logger.error(err, "Failed to send waitlist confirmation email");
  }
}
