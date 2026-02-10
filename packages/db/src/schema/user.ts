import { boolean, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tokistackSchema } from "./pg-schema";

export const user = tokistackSchema.table("user", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
