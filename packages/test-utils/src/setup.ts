import { closeConnection, db } from "@tokistack/db";
import { sql } from "drizzle-orm";

/**
 * Truncates all tables in the tokistack schema.
 * Use as a beforeEach hook to ensure a clean state between tests.
 */
export default async function truncateAllTables() {
  const tables = await db.execute<{ tablename: string }>(sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'tokistack'
  `) as { tablename: string }[];

  for (const { tablename } of tables) {
    await db.execute(
      sql.raw(`TRUNCATE "tokistack"."${tablename}" CASCADE`),
    );
  }
}

afterAll(async () => {
  await closeConnection();
});
