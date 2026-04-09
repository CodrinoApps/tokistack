import type { PgQueryResultHKT } from "drizzle-orm/pg-core";
import type { PgAsyncDatabase } from "drizzle-orm/pg-core/async";
import { createServerlessClient } from "./clients/serverless-pg";
import type { relations } from "./schema/relations";

export * from "./schema";

export type DbClient = PgAsyncDatabase<PgQueryResultHKT, Record<string, never>, typeof relations>;

/**
 * Returns the instantiated DB object for the provided connection string. In Lambda environments
 * the connection string is parsed from a secure string SSM parameter via the layer extension first
 * @param connectionString
 * @returns
 */
export function createDb(connectionString: string): DbClient {
  return createServerlessClient(connectionString).db;
}
