import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../index";

export const accountRelations = defineRelationsPart(schema, (r) => ({
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
}));
