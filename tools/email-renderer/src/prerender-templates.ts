/**
 * @file
 * Pre-renders all MJML email templates for each locale at build time.
 * Outputs static HTML files so mjml is not needed at runtime.
 * Run automatically as part of the build step.
 */

import { logger } from "@tokistack/logger";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { userInvite } from "./templates/user-invite";

const LOCALES = ["en", "de"] as const;

const outDir = path.resolve("src/generated");
mkdirSync(outDir, { recursive: true });

for (const locale of LOCALES) {
  const { html } = userInvite({ locale });
  writeFileSync(path.join(outDir, `user-invite-${locale}.html`), html);
}

logger.info("Pre-rendered email templates.");
