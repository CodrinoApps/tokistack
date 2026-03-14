import { readFileSync } from "node:fs";

const envFile = new URL(".env", import.meta.url);
const env = readFileSync(envFile, "utf-8");
const match = env.match(/^API_TARGET=(.+)$/m);
const apiTarget = match[1].trim();

/** @type {import('@angular/build').ServerProxyConfig} */
export default {
  "/api": {
    target: apiTarget,
    secure: true,
    changeOrigin: true,
  },
};
