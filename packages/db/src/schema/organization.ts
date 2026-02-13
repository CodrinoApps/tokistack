import { text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { tokistackSchema } from "./pg-schema";

export const organization = tokistackSchema.table(
  "organization",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);
