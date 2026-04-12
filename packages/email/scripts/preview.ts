/**
 * @file
 * Builds the package and opens a rendered email preview in the browser.
 * Examples:
 *  pnpm --filter @tokistack/email preview → English (default)
 *  pnpm --filter @tokistack/email preview de → German
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { waitlistConfirmation } from "../src/templates/waitlist-confirmation";

type Locale = "en" | "de";
const locale = (process.argv[2] ?? "en") as Locale;
const { html } = waitlistConfirmation({ locale });

const out = path.resolve("preview.html");
fs.writeFileSync(out, html);
execSync(`open ${out}`);
