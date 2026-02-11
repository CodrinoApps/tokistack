import { defineConfig } from "drizzle-kit";
import { CONNECTION_STRING } from "./src/config";

export default defineConfig({
  dialect: "postgresql",
  schema: "../../packages/db/src/schema/index.ts",
  out: "./src/migrations",
  dbCredentials: {
    url: CONNECTION_STRING,
  },
  migrations: {
    table: "migrations",
    schema: "tokistack_migrations",
  },
  breakpoints: false,
  schemaFilter: "tokistack",
});
