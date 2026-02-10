import { localDb } from "./clients/pg";
import { serverlessDb } from "./clients/serverless-pg";
import { USE_LOCAL_CLIENT } from "./config";

export * from "./schema";

/**
 * Gets the necessary database client depending on where this package is used.
 * Neon serverless driver communicates over http which can not be used for local
 * and integration test setups.
 */
function getDbClient() {
  return USE_LOCAL_CLIENT ? localDb : serverlessDb;
}

export const db = getDbClient();
