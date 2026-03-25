import { Button } from "@falcon/auth-ui/components/button";
import { Input } from "@falcon/auth-ui/components/input";
import { Label } from "@falcon/auth-ui/components/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ActionButton, DataTable } from "@/components/admin/data-table";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/applications/")({
  component: ApplicationsPage,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.user.role !== "admin") throw redirect({ to: "/" });
    return { session };
  },
});

function ApplicationsPage() {
  const qc = useQueryClient();
  const apps = useQuery(orpc.admin.listOAuthApplications.queryOptions());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [redirectURLs, setRedirectURLs] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      orpc.admin.createOAuthApplication.mutate({
        name,
        redirectURLs: redirectURLs.split("\n").map((u) => u.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      toast.success("Application created");
      qc.invalidateQueries();
      setShowForm(false);
      setName("");
      setRedirectURLs("");
    },
    onError: () => toast.error("Failed to create application"),
  });

  const deleteMutation = useMutation({
    mutationFn: (clientId: string) => orpc.admin.deleteOAuthApplication.mutate({ clientId }),
    onSuccess: () => { toast.success("Application deleted"); qc.invalidateQueries(); },
    onError: () => toast.error("Failed to delete"),
  });

  const rawApps: any[] = Array.isArray(apps.data) ? apps.data : [];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">OAuth Applications</h1>
          <p className="text-sm text-muted-foreground">Manage registered OAuth/OIDC clients</p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New Application"}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-4 max-w-lg">
          <h2 className="font-medium">Register New Application</h2>
          <div className="space-y-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My App" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="redirect-urls">Redirect URLs (one per line)</Label>
            <textarea
              id="redirect-urls"
              value={redirectURLs}
              onChange={(e) => setRedirectURLs(e.target.value)}
              placeholder="https://myapp.com/callback"
              rows={3}
              className="w-full rounded border bg-background px-3 py-2 text-sm resize-none"
            />
          </div>
          <Button size="sm" onClick={() => createMutation.mutate()} disabled={!name || !redirectURLs || createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      )}

      <DataTable
        data={rawApps}
        isLoading={apps.isLoading}
        searchable
        searchPlaceholder="Search applications..."
        emptyMessage="No applications registered"
        columns={[
          { key: "name", header: "Name" },
          { key: "clientId", header: "Client ID", render: (row) => <code className="text-xs">{(row as any).clientId}</code> },
          {
            key: "redirectURLs",
            header: "Redirect URLs",
            render: (row) => <span className="text-xs text-muted-foreground">{(row as any).redirectURLs}</span>,
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <ActionButton
                label="Delete"
                variant="destructive"
                onClick={() => {
                  if (confirm("Delete this application?")) deleteMutation.mutate((row as any).clientId);
                }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
