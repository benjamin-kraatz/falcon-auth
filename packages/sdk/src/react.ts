/**
 * FALCON Auth SDK – React entry point.
 *
 * Re-exports everything from the main entry point so React apps can import from
 * a single path.  The better-auth client already includes React hooks
 * (`useSession`, `useActiveOrganization`, etc.) when the plugins are active.
 *
 * Usage:
 *   import { createFalconAuthClient } from "@falcon-auth/sdk/react";
 */
export { createFalconAuthClient } from "./index";
export type {
  FalconAuthClient,
  FalconAuthClientOptions,
  Invitation,
  Member,
  Organization,
  Session,
  SessionResponse,
  User,
} from "./index";
