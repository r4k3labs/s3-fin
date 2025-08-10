import {
  adminClient,
  customSessionClient,
  multiSessionClient,
  oneTapClient,
  organizationClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { ac, appRoles } from "./permission";
import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac,
      roles: appRoles,
    }),
    usernameClient(),
    adminClient(),
    multiSessionClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
      promptOptions: {
        baseDelay: 1000,
        maxAttempts: 1,
      },
    }),
    customSessionClient<typeof auth>(),
  ],
  fetchOptions: {
    onError: (ctx) => {
      toast.error(ctx.error.message);
    },
  },
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
} = authClient;
