import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const root = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(root, "../../../apps/server/.env") });
dotenv.config({ path: join(root, "../../../apps/web/.env") });

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    CORS_ORIGIN: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    FALCON_ADMIN_USER_IDS: z.string().optional(),
    /** Comma-separated extra origins allowed for CORS (e.g. preview deploys). */
    FALCON_TRUSTED_ORIGINS: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
