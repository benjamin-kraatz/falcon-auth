/**
 * @falcon-auth/sdk
 *
 * The official SDK for integrating FALCON Auth as an identity provider.
 * FALCON Auth acts as an OAuth 2.1 / OIDC provider - integrate it like you would
 * integrate Google or GitHub SSO.
 *
 * @example
 * ```ts
 * import { createFalconAuthClient } from "@falcon-auth/sdk/client";
 *
 * const falconAuth = createFalconAuthClient({
 *   issuerUrl: "https://auth.falcon.example.com",
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret",
 *   redirectUri: "https://yourapp.com/auth/callback",
 * });
 * ```
 */

export { createFalconAuthClient } from "./client";
export type { FalconAuthConfig, FalconAuthTokens, FalconAuthUser } from "./types";
