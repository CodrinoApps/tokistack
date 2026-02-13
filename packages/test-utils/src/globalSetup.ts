import { exec } from "child_process";
import util from "util";

/**
 * Run migrations to initialize the test database.
 */
export default async function runMigrations() {
  const run = util.promisify(exec);
  await run("pnpm turbo build --filter=@tokistack/db-migrator");
  await run("pnpm --filter @tokistack/db-migrator db:migrate");
}
