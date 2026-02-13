import { accountRelations } from "./account";
import { invitationRelations } from "./invitation";
import { memberRelations } from "./member";
import { organizationRelations } from "./organization";
import { sessionRelations } from "./session";
import { userRelations } from "./user";

export const relations = {
  ...userRelations,
  ...sessionRelations,
  ...accountRelations,
  ...organizationRelations,
  ...memberRelations,
  ...invitationRelations,
};
