import { Button } from "@falcon/auth-ui/components/button";
import { Input } from "@falcon/auth-ui/components/input";
import { Label } from "@falcon/auth-ui/components/label";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { getUser } from "../functions/get-user";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const role = (context.session.user as { role?: string }).role;
    if (role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
});

type ListedUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
};

function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authClient.admin.listUsers({
        query: { searchValue: search || undefined, limit: 50 },
      });
      if (res.data?.users) setUsers(res.data.users as ListedUser[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  if (isPending || !session?.user) {
    return <p className="p-6">Loading…</p>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-semibold">FALCON admin</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        User management for the FALCON team. Impersonation starts a session as the selected user;
        use “Stop impersonating” from the user menu when done.
      </p>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Email or name"
          />
        </div>
        <Button type="button" variant="secondary" onClick={() => void loadUsers()}>
          Refresh
        </Button>
        <Button type="button" onClick={() => setCreateOpen((v) => !v)}>
          {createOpen ? "Cancel" : "Create user"}
        </Button>
      </div>

      {createOpen ? (
        <div className="mb-8 rounded-lg border p-4">
          <h2 className="mb-3 font-medium">Create user</h2>
          <div className="grid max-w-md gap-3">
            <div>
              <Label htmlFor="newName">Name</Label>
              <Input id="newName" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="newEmail">Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Temporary password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={async () => {
                try {
                  await authClient.admin.createUser({
                    email: newEmail,
                    name: newName,
                    password: newPassword,
                    role: "user",
                  });
                  toast.success("User created");
                  setNewEmail("");
                  setNewName("");
                  setNewPassword("");
                  setCreateOpen(false);
                  void loadUsers();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Create failed");
                }
              }}
            >
              Create
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted-foreground p-4">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role ?? "—"}</td>
                  <td className="p-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={u.id === session.user.id}
                      onClick={async () => {
                        try {
                          await authClient.admin.impersonateUser({ userId: u.id });
                          toast.success(`Now signed in as ${u.email}`);
                          window.location.href = "/dashboard";
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Impersonation failed");
                        }
                      }}
                    >
                      Impersonate
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
