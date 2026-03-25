import { Button } from "@falcon/auth-ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/users/$userId")({
  component: UserDetailPage,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.user.role !== "admin") throw redirect({ to: "/" });
    return { session };
  },
});

function UserDetailPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useQuery(orpc.admin.getUser.queryOptions({ input: { userId } }));

  const banMutation = useMutation({
    mutationFn: (reason: string) => orpc.admin.banUser.mutate({ userId, banReason: reason }),
    onSuccess: () => { toast.success("User banned"); qc.invalidateQueries(); },
    onError: () => toast.error("Failed to ban user"),
  });

  const unbanMutation = useMutation({
    mutationFn: () => orpc.admin.unbanUser.mutate({ userId }),
    onSuccess: () => { toast.success("User unbanned"); qc.invalidateQueries(); },
    onError: () => toast.error("Failed to unban user"),
  });

  const impersonateMutation = useMutation({
    mutationFn: () => orpc.admin.impersonateUser.mutate({ userId }),
    onSuccess: () => { toast.success("Impersonating user"); navigate({ to: "/" }); },
    onError: () => toast.error("Failed to impersonate user"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => orpc.admin.deleteUser.mutate({ userId }),
    onSuccess: () => { toast.success("User deleted"); navigate({ to: "/admin/users" }); },
    onError: () => toast.error("Failed to delete user"),
  });

  const u = user.data as any;

  if (user.isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!u) return <div className="p-6 text-muted-foreground">User not found</div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/users" })}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">{u.name}</h1>
        {u.banned && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Banned</span>}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Profile</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["ID", u.id],
            ["Name", u.name],
            ["Email", u.email],
            ["Role", u.role ?? "user"],
            ["Email Verified", u.emailVerified ? "Yes" : "No"],
            ["Created", u.createdAt ? new Date(u.createdAt).toLocaleString() : "–"],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium break-all">{v as string}</dd>
            </div>
          ))}
        </dl>
        {u.banReason && (
          <p className="text-sm text-red-400">Ban reason: {u.banReason}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => impersonateMutation.mutate()}
          disabled={impersonateMutation.isPending}
        >
          Impersonate
        </Button>
        {u.banned ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => unbanMutation.mutate()}
            disabled={unbanMutation.isPending}
          >
            Unban
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => banMutation.mutate("Banned by admin")}
            disabled={banMutation.isPending}
          >
            Ban
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm("Delete this user? This cannot be undone.")) deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
        >
          Delete User
        </Button>
      </div>
    </div>
  );
}
