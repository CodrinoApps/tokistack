import type { EmailCommand } from "../client";
import { waitlistConfirmationHtml } from "../generated/waitlist-confirmation";
import { type Locale, t } from "../i18n";

const SENDER = "Tokistack <noreply@tokistack.com>";

type SendWaitlistConfirmationInput = {
  to: string;
  locale: Locale;
};

export class SendWaitlistConfirmationCommand implements EmailCommand {
  constructor(private input: SendWaitlistConfirmationInput) {}

  resolve() {
    return {
      from: SENDER,
      to: this.input.to,
      subject: t(this.input.locale, "email.waitlist.subject"),
      html: waitlistConfirmationHtml[this.input.locale],
    };
  }
}
