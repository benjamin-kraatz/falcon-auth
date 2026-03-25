/**
 * Shared TypeScript types for the FALCON Auth SDK.
 */

export type FalconAuthClientOptions = {
  /** Base URL of the FALCON Auth server, e.g. "https://auth.falconplatform.io" */
  baseURL: string;
};

export type FalconAuthServerOptions = {
  /** Base URL of the FALCON Auth server */
  baseURL: string;
  /** Optional API key for privileged server-to-server calls */
  apiKey?: string;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type User = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  metadata?: Record<string, unknown> | null;
};

export type Member = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
};

export type Invitation = {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "rejected" | "canceled";
  expiresAt: Date;
  inviterId: string;
};

export type SessionResponse = {
  session: Session;
  user: User;
} | null;
