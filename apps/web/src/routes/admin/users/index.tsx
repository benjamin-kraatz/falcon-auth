import { Button } from "@falcon/auth-ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

import { ActionButton, DataTable } from "@/components/admin/data-table";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/users/")({
  component: UsersPage,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.user.role !== "admin") throw redirect({ to: "/" });
    return { session };
  },
});

function UsersPage() {
  const qc = useQueryClient();
  const users = useQuery(orpc.admin.listUsers.queryOptions({ input: { limit: 50, offset: 0 } }));

  const banMutation = useMutation({
    mutationFn: (userId: string) =>
      orpc.admin.banUser.mutate({ userId, banReason: "Banned by admin" }),
    onSuccess: () => {
      toast.success("User banned");
      qc.invalidateQueries();
    },
    onError: () => toast.error("Failed to ban user"),
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => orpc.admin.unbanUser.mutate({ userId }),
    onSuccess: () => {
      toast.success("User unbanned");
      qc.invalidateQueries();
    },
    onError: () => toast.error("Failed to unban user"),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => orpc.admin.deleteUser.mutate({ userId }),
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries();
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const rawUsers = (users.data as any)?.users ?? [];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all registered users</p>
        </div>
      </div>

      <DataTable
        data={rawUsers}
        isLoading={users.isLoading}
        searchable
        searchPlaceholder="Search by name or email..."
        emptyMessage="No users found"
        columns={[
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          {
            key: "role",
            header: "Role",
            render: (row) => (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                {(row as any).role ?? "user"}
              </span>
            ),
          },
          {
            key: "banned",
            header: "Status",
            render: (row) =>
              (row as any).banned ? (
                <span className="text-xs text-red-500 font-medium">Banned</span>
              ) : (
                <span className="text-xs text-green-500 font-medium">Active</span>
              ),
          },
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
                  <Link to="/admin/users/$userId" params={{ userId: (row as any).id }}>
                    View
                  </Link>
                </Button>
                {(row as any).banned ? (
                  <ActionButton
                    label="Unban"
                    onClick={() => unbanMutation.mutate((row as any).id)}
                  />
                ) : (
                  <ActionButton
                    label="Ban"
                    variant="destructive"
                    onClick={() => banMutation.mutate((row as any).id)}
                  />
                )}
                <ActionButton
                  label="Delete"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Delete this user? This cannot be undone.")) {
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
