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
import { consentHtml, signInHtml, signUpHtml } from "./pages";

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

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// ---------------------------------------------------------------------------
// Hosted HTML pages (served by the auth server itself)
// ---------------------------------------------------------------------------

app.get("/sign-in", (c) => c.html(signInHtml()));
app.get("/sign-up", (c) => c.html(signUpHtml()));
app.get("/consent", (c) => c.html(consentHtml()));

// ---------------------------------------------------------------------------
// Well-known / discovery endpoints – forward to better-auth's OIDC handler
// ---------------------------------------------------------------------------

app.get("/.well-known/openid-configuration", (c) => {
  const url = new URL(c.req.url);
  url.pathname = "/api/auth/oauth2/.well-known/openid-configuration";
  return auth.handler(
    new Request(url.toString(), { method: "GET", headers: c.req.raw.headers }),
  );
});

app.get("/.well-known/oauth-authorization-server", (c) => {
  const url = new URL(c.req.url);
  url.pathname = "/api/auth/oauth2/.well-known/openid-configuration";
  return auth.handler(
    new Request(url.toString(), { method: "GET", headers: c.req.raw.headers }),
  );
});

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
  return c.text("OK");
});

export default app;
