import type {
  AuthorizationParams,
  FalconAuthConfig,
  FalconAuthTokens,
  FalconAuthUser,
} from "./types";

/**
 * FALCON Auth OAuth 2.1 / OIDC client.
 *
 * Use this to integrate FALCON Auth as an identity provider in your application.
 * This works on both server and client (browser) environments.
 */
export class FalconAuthClient {
  private config: Required<Pick<FalconAuthConfig, "issuerUrl" | "clientId" | "redirectUri">> &
    Pick<FalconAuthConfig, "clientSecret"> & { scopes: string[] };

  constructor(config: FalconAuthConfig) {
    this.config = {
      issuerUrl: config.issuerUrl.replace(/\/$/, ""),
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      scopes: config.scopes ?? ["openid", "email", "profile"],
    };
  }

  /**
   * Generate a PKCE code verifier (random string).
   */
  async generateCodeVerifier(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  /**
   * Generate a PKCE code challenge from a verifier.
   */
  async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  /**
   * Build the authorization URL to redirect users to for login.
   *
   * @example
   * ```ts
   * const { url, state, codeVerifier } = await client.getAuthorizationUrl();
   * // Store state and codeVerifier in session/cookie
   * // Redirect user to url
   * ```
   */
  async getAuthorizationUrl(params?: AuthorizationParams): Promise<{
    url: string;
    state: string;
    codeVerifier: string;
  }> {
    const state =
      params?.state ??
      btoa(String.fromCharCode(...new Uint8Array(16).map(() => Math.random() * 256)));
    const codeVerifier = await this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    const scopes = [
      ...new Set([...this.config.scopes, ...(params?.additionalScopes ?? [])]),
    ].join(" ");

    const urlParams = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    if (params?.loginHint) urlParams.set("login_hint", params.loginHint);
    if (params?.prompt) urlParams.set("prompt", params.prompt);

    return {
      url: `${this.config.issuerUrl}/api/auth/oauth2/authorize?${urlParams}`,
      state,
      codeVerifier,
    };
  }

  /**
   * Exchange an authorization code for tokens.
   *
   * @example
   * ```ts
   * const tokens = await client.exchangeCode({
   *   code: searchParams.get("code"),
   *   codeVerifier: storedCodeVerifier,
   * });
   * ```
   */
  async exchangeCode({
    code,
    codeVerifier,
  }: {
    code: string;
    codeVerifier: string;
  }): Promise<FalconAuthTokens> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      code_verifier: codeVerifier,
    });

    if (this.config.clientSecret) {
      body.set("client_secret", this.config.clientSecret);
    }

    const response = await fetch(`${this.config.issuerUrl}/api/auth/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Token exchange failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      accessToken: data["access_token"] as string,
      tokenType: data["token_type"] as string,
      expiresIn: data["expires_in"] as number | undefined,
      refreshToken: data["refresh_token"] as string | undefined,
      idToken: data["id_token"] as string | undefined,
      scope: data["scope"] as string | undefined,
    };
  }

  /**
   * Refresh an access token using a refresh token.
   */
  async refreshTokens(refreshToken: string): Promise<FalconAuthTokens> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    });

    if (this.config.clientSecret) {
      body.set("client_secret", this.config.clientSecret);
    }

    const response = await fetch(`${this.config.issuerUrl}/api/auth/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Token refresh failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      accessToken: data["access_token"] as string,
      tokenType: data["token_type"] as string,
      expiresIn: data["expires_in"] as number | undefined,
      refreshToken: (data["refresh_token"] as string | undefined) ?? refreshToken,
      idToken: data["id_token"] as string | undefined,
      scope: data["scope"] as string | undefined,
    };
  }

  /**
   * Get the authenticated user's information.
   */
  async getUserInfo(accessToken: string): Promise<FalconAuthUser> {
    const response = await fetch(`${this.config.issuerUrl}/api/auth/oauth2/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return response.json() as Promise<FalconAuthUser>;
  }

  /**
   * Revoke a token (logout).
   */
  async revokeToken(token: string, tokenType: "access_token" | "refresh_token" = "access_token") {
    const body = new URLSearchParams({
      token,
      token_type_hint: tokenType,
      client_id: this.config.clientId,
    });

    if (this.config.clientSecret) {
      body.set("client_secret", this.config.clientSecret);
    }

    await fetch(`${this.config.issuerUrl}/api/auth/oauth2/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  }

  /**
   * Get the OIDC discovery document.
   */
  async getDiscoveryDocument() {
    const response = await fetch(
      `${this.config.issuerUrl}/.well-known/openid-configuration`,
    );
    if (!response.ok) throw new Error("Failed to fetch discovery document");
    return response.json();
  }
}

/**
 * Create a FALCON Auth client instance.
 *
 * @example
 * ```ts
 * import { createFalconAuthClient } from "@falcon-auth/sdk/client";
 *
 * export const falconAuth = createFalconAuthClient({
 *   issuerUrl: "https://auth.falcon.example.com",
 *   clientId: process.env.FALCON_AUTH_CLIENT_ID,
 *   clientSecret: process.env.FALCON_AUTH_CLIENT_SECRET,
 *   redirectUri: "https://yourapp.com/auth/callback",
 * });
 * ```
 */
export function createFalconAuthClient(config: FalconAuthConfig): FalconAuthClient {
  return new FalconAuthClient(config);
}
