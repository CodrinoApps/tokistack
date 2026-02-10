import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { CONNECTION_STRING } from "../config";
import { relations } from "../schema/relations";

export const queryClient = postgres(CONNECTION_STRING, {
  onnotice: () => false,
});
export const localDb = drizzle({ client: queryClient, relations });
