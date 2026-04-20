import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { DbClient } from "@tokistack/db";
import * as schema from "@tokistack/db/schema";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export function createAuth(db: DbClient, options: { secret: string; baseURL: string; disableSignUp: boolean }) {
  return betterAuth({
    appName: "Tokistack",
    secret: options.secret,
    baseURL: options.baseURL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: options.disableSignUp,
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
}
