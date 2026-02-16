import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { CONNECTION_STRING } from "../config";
import { relations } from "../schema/relations";

const queryClient = postgres(CONNECTION_STRING, {
  onnotice: () => false,
});
export const localDb = drizzle({ client: queryClient, relations });

/**
 * Closes the underlying Postgres connection pool.
 * Used in test teardown to allow Jest to exit cleanly.
 */
export async function closeConnection() {
  await queryClient.end();
}
