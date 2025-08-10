import "server-only";

import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin,
  bearer,
  multiSession,
  oneTap,
  organization,
  username,
} from "better-auth/plugins";
import { db } from "./db";
import { getActiveOrganization } from "./queries/organisation";
import { resend } from "./email/resend";
import { reactResetPasswordEmail } from "./email/resetPassword";
import { reactInvitationEmail } from "./email/invitation";
import { appRoles, ac } from "./permission";

const from = process.env.BETTER_AUTH_EMAIL || "mail@updates.rakyesh.com";
const to = process.env.TEST_EMAIL || "";

const options = {
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const res = await resend.emails.send({
        from,
        to: to || user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
      console.log(res, user.email);
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from,
        to: user.email,
        subject: "Reset your password",
        react: reactResetPasswordEmail({
          username: user.email,
          resetLink: url,
        }),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    username(),
    admin(),
    organization({
      ac,
      roles: appRoles,
      async sendInvitationEmail(data) {
        await resend.emails.send({
          from,
          to: data.email,
          subject: "You've been invited to join an organization",
          react: reactInvitationEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink:
              process.env.NODE_ENV === "development"
                ? `http://localhost:3000/sign-in?redirect=/accept-invitation/${data.id}`
                : `${
                    process.env.BETTER_AUTH_URL || "https://Simple Saas.app"
                  }/sign-in?redirect=/accept-invitation/${data.id}`,
          }),
        });
      },
      allowUserToCreateOrganization: true,
    }),
    nextCookies(),
    multiSession(),
    oneTap(),
    admin({
      adminUserIds: [],
    }),
    bearer(),
  ],
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
      allowDifferentEmails: false,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (sessionInput) => {
          const activeOrgInfo = await getActiveOrganization(
            sessionInput.userId
          );
          const activeOrganizationId = activeOrgInfo
            ? activeOrgInfo.organizationId
            : null;
          return {
            data: {
              ...sessionInput,
              activeOrganizationId: activeOrganizationId,
            },
          };
        },
      },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
      disableIpTracking: false,
    },
  },
  disabledPaths: ["/sign-up/email", "/sign-in/email"],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [...(options.plugins ?? [])],
});
