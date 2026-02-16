import { logger } from "@tokistack/logger";

/**
 * API handler entrypoint
 *
 * @param event
 * @returns
 */
export const handler = async (event: Record<string, unknown>): Promise<unknown> => {
  logger.info(event, "Tokistack API called");
  return;
};
