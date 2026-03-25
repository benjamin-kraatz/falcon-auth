/**
 * FALCON Auth SDK – browser / React entry point.
 *
 * Usage:
 *   import { createFalconAuthClient } from "@falcon-auth/sdk";
 *   const auth = createFalconAuthClient({ baseURL: "https://auth.falconplatform.io" });
 *
 *   await auth.signIn.email({ email, password });
 *   const { data: session } = auth.useSession();
 */
import { createAuthClient } from "better-auth/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";

export type {
  FalconAuthClientOptions,
  Invitation,
  Member,
  Organization,
  Session,
  SessionResponse,
  User,
} from "./types";

import type { FalconAuthClientOptions } from "./types";

/**
 * Creates a FALCON Auth client pre-configured with the organization and admin
 * plugins.  The returned client is identical to a `better-auth` auth client and
 * exposes all standard methods (`signIn`, `signUp`, `signOut`, `getSession`,
 * `useSession`, `organization.*`, `admin.*`, …).
 */
export function createFalconAuthClient(options: FalconAuthClientOptions) {
  return createAuthClient({
    baseURL: options.baseURL,
    plugins: [organizationClient(), adminClient()],
  });
}

export type FalconAuthClient = ReturnType<typeof createFalconAuthClient>;
