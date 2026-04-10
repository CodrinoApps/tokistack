import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { relations } from "../schema/relations";

export function createServerlessClient(connectionString: string) {
  const sql = neon(connectionString);
  const db = drizzle({ client: sql, relations });

  return { db };
}
