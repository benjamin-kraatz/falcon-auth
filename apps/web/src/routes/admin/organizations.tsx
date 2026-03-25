import { Button } from "@falcon/auth-ui/components/button";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getUser } from "@/functions/get-user";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin/organizations")({
  component: OrganizationsPage,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    return { session };
  },
});

interface Organization {
  id: string;
  name: string;
  slug?: string;
  createdAt: string;
}

function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    setLoading(true);
    try {
      const result = await authClient.organization.list();
      if (result.data) {
        setOrganizations(result.data as Organization[]);
      }
    } catch {
      toast.error("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteOrg(orgId: string) {
    if (!confirm("Are you sure you want to delete this organization?")) return;
    try {
      await authClient.organization.delete({ organizationId: orgId });
      toast.success("Organization deleted");
      await fetchOrganizations();
    } catch {
      toast.error("Failed to delete organization");
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage organizations registered with FALCON Auth
        </p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : organizations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No organizations found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} className="border-b last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 font-medium">{org.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {org.slug ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteOrg(org.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
