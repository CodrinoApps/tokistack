import { logger } from "@tokistack/logger";
import { resend } from "./client.js";
import { SENDER } from "./config.js";
import type { Locale } from "./i18n.js";
import { waitlistConfirmation } from "./templates/waitlist-confirmation.js";

type EmailPayload = {
  template: "waitlist-confirmation";
  to: string;
  locale: Locale;
};

export type { Locale };

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { template, to, locale } = payload;
  let html: string;
  let subject: string;

  switch (template) {
    case "waitlist-confirmation": {
      const result = waitlistConfirmation({ locale });
      html = result.html;
      subject = result.subject;
      break;
    }
  }

  const { error } = await resend.emails.send({ from: SENDER, to, subject, html });

  if (error) {
    logger.error({ error, template, to }, "Failed to send email");
    throw new Error(`Failed to send email: ${error.message}`);
  }

  logger.info({ template, to }, "Email sent");
}
