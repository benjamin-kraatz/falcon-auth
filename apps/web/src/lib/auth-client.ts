import { env } from "@falcon/auth-env/web";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [adminClient(), organizationClient(), oauthProviderClient()],
});
