import { createContext } from "@falcon/auth-api/context";
import { appRouter } from "@falcon/auth-api/routers/index";
import { auth } from "@falcon/auth-auth";
import { env } from "@falcon/auth-env/server";
import {
  oauthProviderAuthServerMetadata,
  oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { hostedConsentHtml, hostedSignInHtml, hostedSignUpHtml } from "./hosted";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (!origin) return env.CORS_ORIGIN;
      const allowed = new Set([env.CORS_ORIGIN, new URL(env.BETTER_AUTH_URL).origin]);
      return allowed.has(origin) ? origin : env.CORS_ORIGIN;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/.well-known/openid-configuration", (c) =>
  oauthProviderOpenIdConfigMetadata(auth)(c.req.raw),
);
app.get("/.well-known/oauth-authorization-server", (c) =>
  oauthProviderAuthServerMetadata(auth)(c.req.raw),
);

app.get("/hosted/sign-in", (c) =>
  c.html(hostedSignInHtml(), 200, {
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'",
  }),
);
app.get("/hosted/sign-up", (c) =>
  c.html(hostedSignUpHtml(), 200, {
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'",
  }),
);
app.get("/hosted/consent", (c) =>
  c.html(hostedConsentHtml(), 200, {
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'",
  }),
);

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
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("FALCON Auth API — see /api/auth and /.well-known/openid-configuration");
});

export default app;
