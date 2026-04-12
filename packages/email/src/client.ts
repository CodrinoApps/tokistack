import { logger } from "@tokistack/logger";
import { Resend } from "resend";

export interface EmailCommand {
  resolve(): {
    from: string;
    to: string;
    subject: string;
    html: string;
  };
}

/**
 * Email client for Tokistack
 */
export class EmailClient {
  private resend: Resend;

  constructor({ apiKey }: { apiKey: string }) {
    this.resend = new Resend(apiKey);
  }

  /**
   * Sends the email as specified via the provided EmailCommand.
   * @param command
   */
  async send(command: EmailCommand): Promise<void> {
    const { from, to, subject, html } = command.resolve();

    const { error } = await this.resend.emails.send({ from, to, subject, html });

    if (error) {
      logger.error({ error }, "Failed to send email");
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
