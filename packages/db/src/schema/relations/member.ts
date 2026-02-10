import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../index";

export const memberRelations = defineRelationsPart(schema, (r) => ({
  member: {
    organization: r.one.organization({
      from: r.member.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.member.userId,
      to: r.user.id,
    }),
  },
}));
