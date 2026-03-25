import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          <span className="text-indigo-400">FALCON</span> Auth Admin Portal
        </h1>
        <p className="text-muted-foreground">
          Centralized identity provider for FALCON applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/users" className="block rounded-lg border p-5 hover:border-indigo-500/50 transition-colors">
          <div className="text-2xl mb-2">👥</div>
          <h2 className="font-semibold mb-1">User Management</h2>
          <p className="text-sm text-muted-foreground">
            View, create, ban, and impersonate users across the platform.
          </p>
        </Link>

        <Link to="/admin/organizations" className="block rounded-lg border p-5 hover:border-indigo-500/50 transition-colors">
          <div className="text-2xl mb-2">🏢</div>
          <h2 className="font-semibold mb-1">Organizations</h2>
          <p className="text-sm text-muted-foreground">
            Manage organizations, members, and access control.
          </p>
        </Link>

        <Link to="/dashboard" className="block rounded-lg border p-5 hover:border-indigo-500/50 transition-colors">
          <div className="text-2xl mb-2">📊</div>
          <h2 className="font-semibold mb-1">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of authentication activity and system health.
          </p>
        </Link>
      </div>
    </div>
  );
}
