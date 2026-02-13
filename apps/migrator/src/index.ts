import { logger } from "@tokistack/logger";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { CONNECTION_STRING } from "./config";

const migrationClient = postgres(CONNECTION_STRING, { max: 1 });

async function migrateDb() {
  logger.info("Initiating Migration");
  await migrate(drizzle({ client: migrationClient }), {
    migrationsFolder: __dirname + "/migrations",
    migrationsTable: "migrations",
    migrationsSchema: "tokistack_migrations",
  });
}

migrateDb()
  .then(() => {
    logger.info("Database Migration Completed");
    process.exit();
  })
  .catch((e) => {
    logger.info("Error during migration", e);
    process.exit(1);
  });
