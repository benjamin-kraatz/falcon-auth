import { Button } from "@falcon/auth-ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

import { ActionButton, DataTable } from "@/components/admin/data-table";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/organizations/")({
  component: OrganizationsPage,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.user.role !== "admin") throw redirect({ to: "/" });
    return { session };
  },
});

function OrganizationsPage() {
  const qc = useQueryClient();
  const orgs = useQuery(
    orpc.admin.listOrganizations.queryOptions({ input: { limit: 50, offset: 0 } }),
  );

  const deleteMutation = useMutation({
    mutationFn: (organizationId: string) =>
      orpc.admin.deleteOrganization.mutate({ organizationId }),
    onSuccess: () => {
      toast.success("Organization deleted");
      qc.invalidateQueries();
    },
    onError: () => toast.error("Failed to delete organization"),
  });

  const rawOrgs: any[] = Array.isArray(orgs.data) ? orgs.data : [];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-sm text-muted-foreground">Manage all organizations</p>
        </div>
      </div>

      <DataTable
        data={rawOrgs}
        isLoading={orgs.isLoading}
        searchable
        searchPlaceholder="Search organizations..."
        emptyMessage="No organizations found"
        columns={[
          { key: "name", header: "Name" },
          { key: "slug", header: "Slug" },
          {
            key: "createdAt",
            header: "Created",
            render: (row) =>
              (row as any).createdAt
                ? new Date((row as any).createdAt).toLocaleDateString()
                : "–",
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex items-center gap-1">
                <Button size="xs" variant="outline" asChild>
                  <Link
                    to="/admin/organizations/$orgId"
                    params={{ orgId: (row as any).id }}
                  >
                    View
                  </Link>
                </Button>
                <ActionButton
                  label="Delete"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Delete this organization?")) {
                      deleteMutation.mutate((row as any).id);
                    }
                  }}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
