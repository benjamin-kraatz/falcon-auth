import { db } from "@falcon/auth-db";
import * as schema from "@falcon/auth-db/schema/auth";
import { env } from "@falcon/auth-env/server";
import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, jwt, organization } from "better-auth/plugins";

const adminUserIds = env.FALCON_ADMIN_USER_IDS?.split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const issuerOrigin = new URL(env.BETTER_AUTH_URL).origin;

const extraTrustedOrigins =
  env.FALCON_TRUSTED_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean) ?? [];

export const auth = betterAuth({
  appName: "FALCON Auth",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN, issuerOrigin, ...extraTrustedOrigins],
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  plugins: [
    jwt(),
    organization({
      teams: { enabled: true },
    }),
    admin({
      ...(adminUserIds?.length ? { adminUserIds } : {}),
      impersonationSessionDuration: 60 * 60,
    }),
    oauthProvider({
      loginPage: "/hosted/sign-in",
      signup: { page: "/hosted/sign-up" },
      consentPage: "/hosted/consent",
      silenceWarnings: {
        oauthAuthServerConfig: true,
        openidConfig: true,
      },
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: env.BETTER_AUTH_URL.startsWith("https://"),
      httpOnly: true,
    },
  },
});
