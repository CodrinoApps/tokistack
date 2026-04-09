import { createLocalClient } from "@tokistack/db/clients/pg";
import { sql } from "drizzle-orm";

const { db, close } = createLocalClient(process.env.DATABASE_URL!);

export { db as testDb };

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

beforeEach(async () => {
  await truncateAllTables();
});

afterAll(async () => {
  await close();
});
