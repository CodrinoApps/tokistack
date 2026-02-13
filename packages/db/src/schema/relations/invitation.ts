import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../index";

export const invitationRelations = defineRelationsPart(schema, (r) => ({
  invitation: {
    organization: r.one.organization({
      from: r.invitation.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.invitation.inviterId,
      to: r.user.id,
    }),
  },
}));
