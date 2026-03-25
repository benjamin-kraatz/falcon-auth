import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/client";

export type FalconAuthClientOptions = {
  /** Base URL of the FALCON Auth server (same origin as Better Auth `baseURL`). */
  baseURL: string;
};

/**
 * Creates a Better Auth client configured for FALCON Auth (admin, organizations, OAuth provider flows).
 * Use from browser apps that talk to your deployed auth API.
 */
export function createFalconAuthClient(options: FalconAuthClientOptions) {
  return createAuthClient({
    baseURL: options.baseURL,
    plugins: [adminClient(), organizationClient(), oauthProviderClient()],
  });
}

export { adminClient, oauthProviderClient, organizationClient };
