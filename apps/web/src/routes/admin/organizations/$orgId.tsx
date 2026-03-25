import { Button } from "@falcon/auth-ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/organizations/$orgId")({
  component: OrgDetailPage,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.user.role !== "admin") throw redirect({ to: "/" });
    return { session };
  },
});

function OrgDetailPage() {
  const { orgId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const org = useQuery(orpc.admin.getOrganization.queryOptions({ input: { organizationId: orgId } }));

  const removeMemberMutation = useMutation({
    mutationFn: (memberIdOrEmail: string) =>
      orpc.admin.removeMember.mutate({ organizationId: orgId, memberIdOrEmail }),
    onSuccess: () => { toast.success("Member removed"); qc.invalidateQueries(); },
    onError: () => toast.error("Failed to remove member"),
  });

  const deleteOrgMutation = useMutation({
    mutationFn: () => orpc.admin.deleteOrganization.mutate({ organizationId: orgId }),
    onSuccess: () => { toast.success("Organization deleted"); navigate({ to: "/admin/organizations" }); },
    onError: () => toast.error("Failed to delete organization"),
  });

  const o = org.data as any;

  if (org.isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!o) return <div className="p-6 text-muted-foreground">Organization not found</div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/organizations" })}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">{o.name}</h1>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Details</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[["ID", o.id], ["Slug", o.slug], ["Created", o.createdAt ? new Date(o.createdAt).toLocaleString() : "–"]].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium">{v as string}</dd>
            </div>
          ))}
        </dl>
      </div>

      {Array.isArray(o.members) && o.members.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <div className="px-4 py-2 bg-muted/50">
            <h2 className="font-medium text-sm">Members ({o.members.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Name", "Email", "Role", ""].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {o.members.map((m: any) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2">{m.user?.name ?? "–"}</td>
                  <td className="px-4 py-2">{m.user?.email ?? "–"}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{m.role}</span>
                  </td>
                  <td className="px-4 py-2">
                    <Button size="xs" variant="destructive" onClick={() => removeMemberMutation.mutate(m.id)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button
        variant="destructive"
        size="sm"
        onClick={() => { if (confirm("Delete this organization?")) deleteOrgMutation.mutate(); }}
        disabled={deleteOrgMutation.isPending}
      >
        Delete Organization
      </Button>
    </div>
  );
}
