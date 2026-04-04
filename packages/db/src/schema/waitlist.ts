import { text, timestamp } from "drizzle-orm/pg-core";
import { tokistackSchema } from "./pg-schema";

export const waitlistStatusEnum = tokistackSchema.enum("waitlist_status", ["pending", "invited", "registered"]);

export const waitlist = tokistackSchema.table("waitlist", {
  email: text("email")
    .unique()
    .primaryKey(),
  status: waitlistStatusEnum().default("pending").notNull(),
  language: text("language").default("en").notNull(),
  token: text("token").unique(),
  invitedAt: timestamp("invited_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
