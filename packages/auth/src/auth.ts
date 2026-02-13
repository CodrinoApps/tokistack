import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "@tokistack/db";
import * as schema from "@tokistack/db/schema";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { BETTER_AUTH_URL } from "./config";

export const auth = betterAuth({
  appName: "Tokistack",
  baseURL: BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization(),
  ],
  experimental: {
    joins: true,
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
    cookiePrefix: "tki",
  },
});
