import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Building2, KeyRound, Users } from "lucide-react";

import { StatsCard } from "@/components/admin/stats-card";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.user.role !== "admin") throw redirect({ to: "/" });
    return { session };
  },
});

function AdminDashboard() {
  const { session } = Route.useRouteContext();
  const users = useQuery(orpc.admin.listUsers.queryOptions({ input: { limit: 1, offset: 0 } }));
  const orgs = useQuery(
    orpc.admin.listOrganizations.queryOptions({ input: { limit: 1, offset: 0 } }),
  );
  const apps = useQuery(orpc.admin.listOAuthApplications.queryOptions());

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {session?.user.name}. Here's an overview of FALCON Auth.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Users"
          value={users.isLoading ? "..." : String((users.data as any)?.total ?? "–")}
          description="Registered users"
          icon={Users}
        />
        <StatsCard
          title="Organizations"
          value={orgs.isLoading ? "..." : String(Array.isArray(orgs.data) ? orgs.data.length : "–")}
          description="Active organizations"
          icon={Building2}
        />
        <StatsCard
          title="OAuth Apps"
          value={apps.isLoading ? "..." : String(Array.isArray(apps.data) ? apps.data.length : "–")}
          description="Registered applications"
          icon={KeyRound}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-lg border p-4 space-y-2">
          <h2 className="font-medium">Quick Links</h2>
          <nav className="space-y-1 text-sm">
            {[
              { href: "/admin/users", label: "Manage Users" },
              { href: "/admin/organizations", label: "Manage Organizations" },
              { href: "/admin/applications", label: "OAuth Applications" },
              { href: "/admin/settings", label: "Platform Settings" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="block py-1.5 px-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </section>

        <section className="rounded-lg border p-4 space-y-2">
          <h2 className="font-medium">Platform Info</h2>
          <dl className="text-sm space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Auth Server</dt>
              <dd className="font-mono text-xs">{typeof window !== "undefined" ? window.location.origin : "–"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Version</dt>
              <dd>0.1.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Framework</dt>
              <dd>better-auth 1.5.5</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
