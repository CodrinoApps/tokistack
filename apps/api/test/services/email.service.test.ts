jest.mock("@tokistack/email", () => ({
  EmailClient: jest.fn(),
}));

jest.mock("@tokistack/email/commands/send-waitlist-confirmation", () => ({
  SendWaitlistConfirmationCommand: jest.fn(),
}));

jest.mock("../../src/common/services/params.service", () => ({
  resolveParameter: jest.fn().mockResolvedValue("test-resend-api-key"),
}));

jest.mock("@tokistack/logger", () => ({
  logger: { error: jest.fn() },
}));

import { EmailClient } from "@tokistack/email";
import { SendWaitlistConfirmationCommand } from "@tokistack/email/commands/send-waitlist-confirmation";
import { logger } from "@tokistack/logger";
import { sendWaitlistConfirmation } from "../../src/common/services/email.service";
import * as paramsService from "../../src/common/services/params.service";

const MockEmailClient = jest.mocked(EmailClient);
const MockCommand = jest.mocked(SendWaitlistConfirmationCommand);
const mockLogger = jest.mocked(logger);

describe("email.service", () => {
  let capturedSend: jest.Mock;

  beforeAll(() => {
    capturedSend = jest.fn().mockResolvedValue(undefined);
    MockEmailClient.mockImplementation(() => ({ send: capturedSend }));
  });

  describe("sendWaitlistConfirmation", () => {
    it("resolves SSM key, creates EmailClient, and sends the command on first call", async () => {
      await sendWaitlistConfirmation("user@example.com", "en");

      expect(paramsService.resolveParameter).toHaveBeenCalledWith("/tokistack/resend-api-key");
      expect(MockEmailClient).toHaveBeenCalledWith({ apiKey: "test-resend-api-key" });
      expect(MockCommand).toHaveBeenCalledWith({ to: "user@example.com", locale: "en" });
      expect(capturedSend).toHaveBeenCalledTimes(1);
    });

    it("reuses cached client on subsequent calls without re-resolving SSM", async () => {
      await sendWaitlistConfirmation("other@example.com", "de");

      expect(paramsService.resolveParameter).not.toHaveBeenCalled();
      expect(MockEmailClient).not.toHaveBeenCalled();
      expect(MockCommand).toHaveBeenCalledWith({ to: "other@example.com", locale: "de" });
      expect(capturedSend).toHaveBeenCalledTimes(1);
    });

    it("logs the error and resolves when send throws", async () => {
      const sendError = new Error("Resend API error");
      capturedSend.mockRejectedValueOnce(sendError);

      await expect(sendWaitlistConfirmation("fail@example.com", "en")).resolves.toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith(sendError, "Failed to send waitlist confirmation email");
    });
  });
});
