import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    return { session };
  },
});

interface Org {
  id: string;
  name: string;
}

function DashboardComponent() {
  const { session } = Route.useRouteContext();

  return (
    <div className="container mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-5">
          <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Session
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{session?.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{session?.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted">
                {(session?.user as { role?: string })?.role ?? "user"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-5">
          <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Your Organizations
          </h2>
          <OrganizationsList />
        </div>
      </div>
    </div>
  );
}

function OrganizationsList() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const result = await authClient.organization.list();
      setOrgs((result.data ?? []) as Org[]);
    } catch {
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  if (!loaded) {
    return (
      <button
        onClick={load}
        className="text-sm text-indigo-400 hover:underline"
        disabled={loading}
      >
        {loading ? "Loading..." : "Load organizations"}
      </button>
    );
  }

  if (orgs.length === 0) {
    return <p className="text-sm text-muted-foreground">No organizations yet.</p>;
  }

  return (
    <ul className="space-y-1 text-sm">
      {orgs.map((org) => (
        <li key={org.id} className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
            {org.name[0]?.toUpperCase()}
          </span>
          <span>{org.name}</span>
        </li>
      ))}
    </ul>
  );
}
