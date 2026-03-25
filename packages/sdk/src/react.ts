/**
 * React hooks for FALCON Auth.
 *
 * These wrap better-auth's React hooks with FALCON Auth-specific client plugins.
 */
export { organizationClient, adminClient } from "better-auth/client/plugins";
export { createAuthClient } from "better-auth/react";

// Re-export type helpers
export type { FalconAuthConfig, FalconAuthUser, FalconAuthTokens } from "./types";
