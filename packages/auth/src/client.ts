import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";
import type { Session as BaseSession, User as BaseUser } from "better-auth/types";

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});

export interface Session extends BaseSession {
  activeOrganizationId?: string | null;
}

export type User = BaseUser;
