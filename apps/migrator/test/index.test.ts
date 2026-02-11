import { db } from "@tokistack/db";
import { truncateAllTables } from "@tokistack/test-utils";
import { sql } from "drizzle-orm";
import postgres from "postgres";

describe("Migrations", () => {
  beforeEach(async () => {
    await truncateAllTables();
  });

  it("should apply all migrations to provided DB", async () => {
    const migrations = (await db.execute(
      sql`SELECT * FROM tokistack_migrations.migrations`,
    )) as postgres.RowList<Record<string, unknown>[]>;
    expect(migrations).toHaveLength(1);
    migrations.map((migration) => {
      expect(migration).toMatchSnapshot({
        created_at: expect.any(String),
      });
    });
  });
});
