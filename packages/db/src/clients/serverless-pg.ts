import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { CONNECTION_STRING } from "../config";
import { relations } from "../schema/relations";

const sql = neon(CONNECTION_STRING);
export const serverlessDb = drizzle({ client: sql, relations });
