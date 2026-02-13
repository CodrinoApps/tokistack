import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../index";

export const organizationRelations = defineRelationsPart(schema, (r) => ({
  organization: {
    members: r.many.member({
      from: r.organization.id,
      to: r.member.organizationId,
    }),
    invitations: r.many.invitation({
      from: r.organization.id,
      to: r.invitation.organizationId,
    }),
  },
}));
