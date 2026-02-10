import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../index";

export const sessionRelations = defineRelationsPart(schema, (r) => ({
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
}));
