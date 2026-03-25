/**
 * Configuration for the FALCON Auth client.
 */
export interface FalconAuthConfig {
  /** The URL of the FALCON Auth server (e.g., https://auth.falcon.example.com) */
  issuerUrl: string;
  /** Your application's OAuth client ID */
  clientId: string;
  /** Your application's OAuth client secret (server-side only) */
  clientSecret?: string;
  /** The redirect URI registered with FALCON Auth */
  redirectUri: string;
  /** OAuth scopes to request (defaults to ["openid", "email", "profile"]) */
  scopes?: string[];
}

/**
 * OAuth tokens returned after successful authentication.
 */
export interface FalconAuthTokens {
  /** The access token for API calls */
  accessToken: string;
  /** Token type (usually "Bearer") */
  tokenType: string;
  /** Expiry in seconds */
  expiresIn?: number;
  /** Refresh token for renewing access */
  refreshToken?: string;
  /** OpenID Connect ID token */
  idToken?: string;
  /** Granted scopes */
  scope?: string;
}

/**
 * User information returned from the userinfo endpoint.
 */
export interface FalconAuthUser {
  /** Unique user identifier */
  sub: string;
  /** User's full name */
  name?: string;
  /** User's email address */
  email?: string;
  /** Whether email is verified */
  emailVerified?: boolean;
  /** URL to user's avatar image */
  picture?: string;
  /** User's role in FALCON Auth */
  role?: string;
}

/**
 * Authorization URL parameters.
 */
export interface AuthorizationParams {
  /** OAuth response type (always "code" for PKCE flow) */
  responseType?: "code";
  /** Additional scopes beyond the defaults */
  additionalScopes?: string[];
  /** State parameter for CSRF protection */
  state?: string;
  /** PKCE code challenge */
  codeChallenge?: string;
  /** PKCE code challenge method */
  codeChallengeMethod?: "S256";
  /** Login hint (e.g., user's email) */
  loginHint?: string;
  /** Prompt behavior */
  prompt?: "none" | "login" | "consent" | "select_account";
}
