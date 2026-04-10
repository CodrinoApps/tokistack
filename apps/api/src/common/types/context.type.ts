import type { DbClient } from "@tokistack/db";

export interface AppContext {
  db: DbClient;
}
