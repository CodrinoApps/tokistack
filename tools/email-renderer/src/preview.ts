/**
 * @file
 * Renders the user-invite email template and opens a preview in the browser.
 * Examples:
 *  pnpm --filter @tokistack/email-renderer preview    → English (default)
 *  pnpm --filter @tokistack/email-renderer preview de → German
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Locale } from "./i18n";
import { userInvite } from "./templates/user-invite";

const locale = (process.argv[2] ?? "en") as Locale;
const { html } = userInvite({ locale });

const out = path.resolve("preview.html");
fs.writeFileSync(out, html);
execSync(`open ${out}`);
