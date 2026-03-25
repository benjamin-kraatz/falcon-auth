/**
 * FALCON Auth SDK – Node.js / server-side entry point.
 *
 * Provides lightweight server-to-server helpers for verifying sessions and
 * looking up users without pulling in any browser or React dependencies.
 *
 * Usage:
 *   import { createFalconAuthServer } from "@falcon-auth/sdk/node";
 *   const auth = createFalconAuthServer({ baseURL: "https://auth.falconplatform.io" });
 *
 *   const session = await auth.verifySession(bearerToken);
 *   const user    = await auth.getUser(userId);
 */

export type {
  FalconAuthServerOptions,
  Invitation,
  Member,
  Organization,
  Session,
  SessionResponse,
  User,
} from "./types";

import type {
  FalconAuthServerOptions,
  SessionResponse,
  User,
} from "./types";

/**
 * Creates a FALCON Auth server client for use in Node.js / edge runtimes.
 * No browser APIs are required.
 */
export function createFalconAuthServer(options: FalconAuthServerOptions) {
  const { baseURL, apiKey } = options;

  function buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }
    if (extra) {
      Object.assign(headers, extra);
    }
    return headers;
  }

  return {
    /**
     * Verify a session token (Bearer token from the `Authorization` header or
     * the `better-auth.session_token` cookie) and return the session + user, or
     * `null` when the token is invalid / expired.
     */
    async verifySession(token: string): Promise<SessionResponse> {
      const res = await fetch(`${baseURL}/api/auth/get-session`, {
        headers: buildHeaders({ Authorization: `Bearer ${token}` }),
      });
      if (!res.ok) return null;
      return res.json() as Promise<SessionResponse>;
    },

    /**
     * Fetch a single user by ID.  Requires an `apiKey` with admin privileges.
     */
    async getUser(userId: string): Promise<User | null> {
      const res = await fetch(`${baseURL}/api/auth/admin/get-user-by-id`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { user?: User };
      return data.user ?? null;
    },

    /**
     * List all users.  Requires an `apiKey` with admin privileges.
     */
    async listUsers(opts: {
      limit?: number;
      offset?: number;
      searchField?: "email" | "name";
      searchValue?: string;
      sortBy?: "email" | "name" | "createdAt";
      sortDirection?: "asc" | "desc";
      filterField?: string;
      filterValue?: string | boolean;
      filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "contains" | "starts_with" | "ends_with";
    } = {}): Promise<{ users: User[]; total: number } | null> {
      const query = new URLSearchParams();
      if (opts.limit !== undefined) query.set("limit", String(opts.limit));
      if (opts.offset !== undefined) query.set("offset", String(opts.offset));
      if (opts.searchField) query.set("searchField", opts.searchField);
      if (opts.searchValue) query.set("searchValue", opts.searchValue);
      if (opts.sortBy) query.set("sortBy", opts.sortBy);
      if (opts.sortDirection) query.set("sortDirection", opts.sortDirection);
      if (opts.filterField) query.set("filterField", opts.filterField);
      if (opts.filterValue !== undefined) query.set("filterValue", String(opts.filterValue));
      if (opts.filterOperator) query.set("filterOperator", opts.filterOperator);

      const qs = query.toString();
      const res = await fetch(
        `${baseURL}/api/auth/admin/list-users${qs ? `?${qs}` : ""}`,
        { method: "GET", headers: buildHeaders() },
      );
      if (!res.ok) return null;
      return res.json() as Promise<{ users: User[]; total: number }>;
    },

    /**
     * Revoke all active sessions for a given user.  Requires an `apiKey` with
     * admin privileges.
     */
    async revokeUserSessions(userId: string): Promise<boolean> {
      const res = await fetch(`${baseURL}/api/auth/admin/revoke-user-sessions`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ userId }),
      });
      return res.ok;
    },

    /**
     * Ban a user.  Requires an `apiKey` with admin privileges.
     */
    async banUser(userId: string, opts: { banReason?: string; banExpiresIn?: number } = {}): Promise<boolean> {
      const res = await fetch(`${baseURL}/api/auth/admin/ban-user`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ userId, ...opts }),
      });
      return res.ok;
    },

    /**
     * Unban a user.  Requires an `apiKey` with admin privileges.
     */
    async unbanUser(userId: string): Promise<boolean> {
      const res = await fetch(`${baseURL}/api/auth/admin/unban-user`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ userId }),
      });
      return res.ok;
    },
  };
}

export type FalconAuthServer = ReturnType<typeof createFalconAuthServer>;
