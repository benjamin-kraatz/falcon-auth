import { Button } from "@falcon/auth-ui/components/button";
import { Input } from "@falcon/auth-ui/components/input";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { getUser } from "@/functions/get-user";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    return { session };
  },
});

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned?: boolean;
}

function UsersPage() {
  const { session } = Route.useRouteContext();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    try {
      const result = await authClient.admin.listUsers({
        query: {
          searchValue: search || undefined,
          searchField: "email",
          limit: 50,
        },
      });
      if (result.data) {
        setUsers(result.data.users as AdminUser[]);
        setTotal(result.data.total);
      }
    } catch (e) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function handleBanUser(userId: string, banned: boolean) {
    try {
      if (banned) {
        await authClient.admin.unbanUser({ userId });
        toast.success("User unbanned");
      } else {
        await authClient.admin.banUser({ userId, banReason: "Admin ban" });
        toast.success("User banned");
      }
      await fetchUsers();
    } catch {
      toast.error("Failed to update user ban status");
    }
  }

  async function handleImpersonate(userId: string) {
    try {
      await authClient.admin.impersonateUser({ userId });
      toast.success("Impersonating user");
    } catch {
      toast.error("Failed to impersonate user");
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all users registered with FALCON Auth
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Signed in as <strong>{session?.user.name}</strong>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
          className="max-w-sm"
        />
        <Button onClick={fetchUsers} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
        <Button variant="secondary" onClick={() => { setSearch(""); fetchUsers(); }}>
          Show All
        </Button>
      </div>

      {users.length > 0 && (
        <p className="text-sm text-muted-foreground mb-3">
          Showing {users.length} of {total} users
        </p>
      )}

      <div className="rounded-lg border overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {loading ? "Loading..." : "Click Search or Show All to view users"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted">
                      {user.role ?? "user"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.banned ? (
                      <span className="text-red-400 text-xs">Banned</span>
                    ) : (
                      <span className="text-green-400 text-xs">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImpersonate(user.id)}
                      >
                        Impersonate
                      </Button>
                      <Button
                        size="sm"
                        variant={user.banned ? "secondary" : "destructive"}
                        onClick={() => handleBanUser(user.id, user.banned)}
                      >
                        {user.banned ? "Unban" : "Ban"}
                      </Button>
                    </div>
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
