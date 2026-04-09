import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "../schema/relations";

export function createLocalClient(connectionString: string) {
  const queryClient = postgres(connectionString, {
    onnotice: () => false,
  });
  const db = drizzle({ client: queryClient, relations });

  return {
    db,
    close: () => queryClient.end(),
  };
}
