import type { EmailCommand } from "../client";
import type { Locale } from "../i18n";
import { waitlistConfirmation } from "../templates/waitlist-confirmation";

const SENDER = "Tokistack <noreply@tokistack.com>";

type SendWaitlistConfirmationInput = {
  to: string;
  locale: Locale;
};

export class SendWaitlistConfirmationCommand implements EmailCommand {
  constructor(private input: SendWaitlistConfirmationInput) {}

  resolve() {
    const { html, subject } = waitlistConfirmation({ locale: this.input.locale });
    return {
      from: SENDER,
      to: this.input.to,
      subject,
      html,
    };
  }
}
