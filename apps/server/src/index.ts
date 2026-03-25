import { createContext } from "@falcon/auth-api/context";
import { appRouter } from "@falcon/auth-api/routers/index";
import { auth } from "@falcon/auth-auth";
import { env } from "@falcon/auth-env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { renderAuthorizePage } from "./pages/authorize";
import { renderConsentPage } from "./pages/consent";
import { renderRegisterPage } from "./pages/register";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ─── Better Auth ──────────────────────────────────────────────────
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// ─── OIDC / OAuth Discovery Documents ────────────────────────────
app.get("/.well-known/openid-configuration", (c) => {
  const baseUrl = env.BETTER_AUTH_URL;
  return c.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/auth/oauth2/authorize`,
    token_endpoint: `${baseUrl}/api/auth/oauth2/token`,
    userinfo_endpoint: `${baseUrl}/api/auth/oauth2/userinfo`,
    jwks_uri: `${baseUrl}/api/auth/jwks`,
    registration_endpoint: `${baseUrl}/api/auth/oauth2/register`,
    scopes_supported: ["openid", "email", "profile", "offline_access"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token", "client_credentials"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    token_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
      "none",
    ],
    claims_supported: ["sub", "name", "email", "email_verified", "picture"],
    code_challenge_methods_supported: ["S256"],
    end_session_endpoint: `${baseUrl}/api/auth/sign-out`,
  });
});

app.get("/.well-known/oauth-authorization-server", (c) => {
  const baseUrl = env.BETTER_AUTH_URL;
  return c.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/auth/oauth2/authorize`,
    token_endpoint: `${baseUrl}/api/auth/oauth2/token`,
    jwks_uri: `${baseUrl}/api/auth/jwks`,
    registration_endpoint: `${baseUrl}/api/auth/oauth2/register`,
    scopes_supported: ["openid", "email", "profile", "offline_access"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token", "client_credentials"],
    token_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
      "none",
    ],
    code_challenge_methods_supported: ["S256"],
    revocation_endpoint: `${baseUrl}/api/auth/oauth2/revoke`,
    introspection_endpoint: `${baseUrl}/api/auth/oauth2/introspect`,
  });
});

// ─── OAuth Authorize Flow (hosted login page) ─────────────────────
app.get("/oauth/authorize", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  const url = new URL(c.req.url);
  const redirectTo = url.search;

  if (!session) {
    return c.html(renderAuthorizePage({ redirectTo }));
  }

  // Already signed in — show consent page
  const clientId = url.searchParams.get("client_id") ?? "";
  const scopes = (url.searchParams.get("scope") ?? "openid email profile").split(" ");
  const redirectUri = url.searchParams.get("redirect_uri") ?? "";

  return c.html(
    renderConsentPage({
      clientName: clientId,
      clientId,
      scopes,
      redirectUri,
      state: url.searchParams.get("state") ?? undefined,
      codeChallenge: url.searchParams.get("code_challenge") ?? undefined,
      codeChallengeMethod: url.searchParams.get("code_challenge_method") ?? undefined,
      nonce: url.searchParams.get("nonce") ?? undefined,
      userEmail: session.user.email,
      userName: session.user.name,
    }),
  );
});

app.post("/oauth/authorize/submit", async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email ?? "");
  const password = String(body.password ?? "");
  const redirectTo = decodeURIComponent(String(body.redirect_to ?? ""));

  const result = await auth.api.signInEmail({
    body: { email, password },
    headers: c.req.raw.headers,
  });

  if (!result || "error" in result) {
    return c.html(
      renderAuthorizePage({
        redirectTo,
        error: "Invalid email or password",
      }),
    );
  }

  return c.redirect(`/oauth/authorize${redirectTo}`);
});

// ─── OAuth Consent Flow ───────────────────────────────────────────
app.get("/oauth/consent", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    const url = new URL(c.req.url);
    return c.redirect(`/oauth/authorize?redirect_to=${encodeURIComponent(url.search)}`);
  }

  const url = new URL(c.req.url);
  const clientId = url.searchParams.get("client_id") ?? "";
  const scopes = (url.searchParams.get("scope") ?? "openid email profile").split(" ");
  const redirectUri = url.searchParams.get("redirect_uri") ?? "";

  return c.html(
    renderConsentPage({
      clientName: clientId,
      clientId,
      scopes,
      redirectUri,
      state: url.searchParams.get("state") ?? undefined,
      codeChallenge: url.searchParams.get("code_challenge") ?? undefined,
      codeChallengeMethod: url.searchParams.get("code_challenge_method") ?? undefined,
      nonce: url.searchParams.get("nonce") ?? undefined,
      userEmail: session.user.email,
      userName: session.user.name,
    }),
  );
});

app.post("/oauth/consent/submit", async (c) => {
  const body = await c.req.parseBody();
  const decision = String(body.decision ?? "deny");
  const redirectUri = decodeURIComponent(String(body.redirect_uri ?? ""));
  const state = body.state ? String(body.state) : undefined;

  if (decision === "deny") {
    const params = new URLSearchParams({ error: "access_denied" });
    if (state) params.set("state", state);
    return c.redirect(`${redirectUri}?${params}`);
  }

  // Forward approval to the better-auth OAuth2 handler
  const params = new URLSearchParams({
    client_id: String(body.client_id ?? ""),
    redirect_uri: redirectUri,
    scope: String(body.scopes ?? "openid email profile"),
    response_type: "code",
  });
  if (state) params.set("state", state);
  if (body.code_challenge) params.set("code_challenge", String(body.code_challenge));
  if (body.code_challenge_method) params.set("code_challenge_method", String(body.code_challenge_method));
  if (body.nonce) params.set("nonce", String(body.nonce));

  return c.redirect(`/api/auth/oauth2/authorize?${params}&accept=true`);
});

// ─── Registration ─────────────────────────────────────────────────
app.get("/oauth/register", (c) => {
  const url = new URL(c.req.url);
  const redirectTo = url.searchParams.get("redirect_to") ?? "";
  return c.html(renderRegisterPage({ redirectTo }));
});

app.post("/oauth/register/submit", async (c) => {
  const body = await c.req.parseBody();
  const name = String(body.name ?? "");
  const email = String(body.email ?? "");
  const password = String(body.password ?? "");
  const redirectTo = decodeURIComponent(String(body.redirect_to ?? ""));

  const result = await auth.api.signUpEmail({
    body: { name, email, password },
    headers: c.req.raw.headers,
  });

  if (!result || "error" in result) {
    return c.html(
      renderRegisterPage({
        redirectTo,
        error: "Registration failed. This email may already be in use.",
      }),
    );
  }

  return c.redirect(`/oauth/authorize${redirectTo}`);
});

// ─── oRPC handlers ────────────────────────────────────────────────
export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => c.text("FALCON Auth Server — OK"));

export default app;
