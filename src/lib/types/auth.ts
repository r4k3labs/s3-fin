import type { auth } from "@/lib/auth";
import type { authClient } from "@/lib/auth-client";

export type Session = typeof auth.$Infer.Session & {
  roles: string[];
};
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Invitation = typeof authClient.$Infer.Invitation;
