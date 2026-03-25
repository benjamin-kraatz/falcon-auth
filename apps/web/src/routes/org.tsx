import { Button } from "@falcon/auth-ui/components/button";
import { Input } from "@falcon/auth-ui/components/input";
import { Label } from "@falcon/auth-ui/components/label";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { getUser } from "../functions/get-user";

export const Route = createFileRoute("/org")({
  component: OrgPage,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});

type OrgRow = { id: string; name: string; slug: string };

function OrgPage() {
  const { data: session, isPending } = authClient.useSession();
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await authClient.organization.list();
      if (Array.isArray(res.data)) setOrgs(res.data as OrgRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  if (isPending || !session?.user) {
    return <p className="p-6">Loading…</p>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-semibold">Organizations & teams</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Create an organization, then manage members and teams in the Better Auth organization APIs.
        Active organization is stored on your session.
      </p>

      <div className="mb-8 rounded-lg border p-4">
        <h2 className="mb-3 font-medium">Create organization</h2>
        <div className="grid gap-3">
          <div>
            <Label htmlFor="orgName">Name</Label>
            <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="orgSlug">Slug</Label>
            <Input
              id="orgSlug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="my-company"
            />
          </div>
          <Button
            type="button"
            onClick={async () => {
              try {
                await authClient.organization.create({
                  name,
                  slug,
                });
                toast.success("Organization created");
                setName("");
                setSlug("");
                void refresh();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Create failed");
              }
            }}
          >
            Create
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Your organizations</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : orgs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No organizations yet.</p>
        ) : (
          <ul className="space-y-2">
            {orgs.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div>
                  <div className="font-medium">{o.name}</div>
                  <div className="text-muted-foreground text-xs">{o.slug}</div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await authClient.organization.setActive({ organizationId: o.id });
                      toast.success(`Active org: ${o.name}`);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Could not set active org");
                    }
                  }}
                >
                  Set active
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
