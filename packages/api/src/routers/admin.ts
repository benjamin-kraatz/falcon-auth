import { auth } from "@falcon/auth-auth";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { protectedProcedure } from "../index";

const requireAdmin = protectedProcedure.middleware(async ({ context, next }) => {
  if (context.session.user.role !== "admin") {
    throw new ORPCError("FORBIDDEN");
  }
  return next({ context });
});

const adminProcedure = requireAdmin;

export const adminRouter = {
  listUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        searchField: z.enum(["email", "name"]).optional(),
        searchOperator: z.enum(["contains", "starts_with"]).optional(),
        searchValue: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const result = await auth.api.listUsers({
        query: {
          limit: input.limit,
          offset: input.offset,
          searchField: input.searchField,
          searchOperator: input.searchOperator,
          searchValue: input.searchValue,
        },
        headers: context.requestHeaders,
      });
      return result;
    }),

  getUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await auth.api.getUser({
        query: { userId: input.userId },
        headers: context.requestHeaders,
      });
      return result;
    }),

  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        banReason: z.string().optional(),
        banExpiresIn: z.number().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const result = await auth.api.banUser({
        body: {
          userId: input.userId,
          banReason: input.banReason,
          banExpiresIn: input.banExpiresIn,
        },
        headers: context.requestHeaders,
      });
      return result;
    }),

  unbanUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await auth.api.unbanUser({
        body: { userId: input.userId },
        headers: context.requestHeaders,
      });
      return result;
    }),

  impersonateUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await auth.api.impersonateUser({
        body: { userId: input.userId },
        headers: context.requestHeaders,
      });
      return result;
    }),

  stopImpersonating: adminProcedure.handler(async ({ context }) => {
    const result = await auth.api.stopImpersonating({
      headers: context.requestHeaders,
    });
    return result;
  }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await auth.api.removeUser({
        body: { userId: input.userId },
        headers: context.requestHeaders,
      });
      return result;
    }),

  listOrganizations: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .handler(async ({ context }) => {
      // Use better-auth organization API
      const result = await auth.api.listOrganizations({
        headers: context.requestHeaders,
      });
      return result;
    }),

  getOrganization: adminProcedure
    .input(z.object({ organizationId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await auth.api.getFullOrganization({
        query: { organizationId: input.organizationId },
        headers: context.requestHeaders,
      });
      return result;
    }),

  deleteOrganization: adminProcedure
    .input(z.object({ organizationId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await auth.api.deleteOrganization({
        body: { organizationId: input.organizationId },
        headers: context.requestHeaders,
      });
      return result;
    }),

  removeMember: adminProcedure
    .input(z.object({ organizationId: z.string(), memberIdOrEmail: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await auth.api.removeMember({
        body: {
          organizationId: input.organizationId,
          memberIdOrEmail: input.memberIdOrEmail,
        },
        headers: context.requestHeaders,
      });
      return result;
    }),

  updateMemberRole: adminProcedure
    .input(
      z.object({
        organizationId: z.string(),
        memberId: z.string(),
        role: z.enum(["owner", "admin", "member"]),
      }),
    )
    .handler(async ({ input, context }) => {
      const result = await auth.api.updateMemberRole({
        body: {
          organizationId: input.organizationId,
          memberId: input.memberId,
          role: input.role,
        },
        headers: context.requestHeaders,
      });
      return result;
    }),

  listOAuthApplications: adminProcedure.handler(async ({ context }) => {
    // Fetch via better-auth oidcProvider endpoints
    const result = await auth.api.listOAuthApplications({
      headers: context.requestHeaders,
    });
    return result;
  }),

  createOAuthApplication: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        redirectURLs: z.array(z.string().url()),
        icon: z.string().optional(),
        metadata: z.record(z.string()).optional(),
        scopes: z.array(z.string()).optional(),
        pkce: z.boolean().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const result = await auth.api.registerOAuthApplication({
        body: {
          name: input.name,
          redirectURLs: input.redirectURLs.join(","),
          icon: input.icon,
          metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
          scopes: input.scopes?.join(" "),
          pkce: input.pkce,
        },
        headers: context.requestHeaders,
      });
      return result;
    }),

  deleteOAuthApplication: adminProcedure
    .input(z.object({ clientId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await auth.api.deleteOAuthApplication({
        body: { clientId: input.clientId },
        headers: context.requestHeaders,
      });
      return result;
    }),
};
