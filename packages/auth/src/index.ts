import { db } from "@falcon/auth-db";
import * as schema from "@falcon/auth-db/schema/auth";
import { env } from "@falcon/auth-env/server";
import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { jwt } from "better-auth/plugins/jwt";
import { openAPI } from "better-auth/plugins/open-api";
import { organization } from "better-auth/plugins/organization";

export const auth = betterAuth({
  appName: "FALCON Auth",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh every day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      membershipLimit: 100,
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin", "superadmin"],
    }),
    jwt({
      jwt: {
        expirationTime: "15m",
        issuer: env.BETTER_AUTH_URL,
        audience: env.BETTER_AUTH_URL,
      },
    }),
    oauthProvider({
      loginPage: "/oauth/authorize",
      consentPage: "/oauth/consent",
    }),
    openAPI(),
  ],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});

export type Auth = typeof auth;
