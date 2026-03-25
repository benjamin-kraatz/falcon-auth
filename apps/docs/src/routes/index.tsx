import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";

import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-col flex-1 justify-center px-6 py-16 text-center max-w-2xl mx-auto">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-fd-primary/10 text-fd-primary border border-fd-primary/20 mb-4">
            v0.1.0
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">FALCON Auth</h1>
        <p className="text-fd-muted-foreground text-lg mb-8">
          The unified identity provider for FALCON applications. Integrate
          FALCON Auth like you would Google or GitHub SSO.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/docs/$"
            params={{ _splat: "" }}
            className="px-5 py-2.5 rounded-lg bg-fd-primary text-fd-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Get Started →
          </Link>
          <Link
            to="/docs/$"
            params={{ _splat: "sdk/reference" }}
            className="px-5 py-2.5 rounded-lg border border-fd-border font-semibold text-sm hover:bg-fd-muted transition-colors"
          >
            SDK Reference
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 text-left">
          <div className="p-4 rounded-lg border border-fd-border bg-fd-card">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-semibold mb-1 text-sm">OAuth 2.1 / OIDC</h3>
            <p className="text-xs text-fd-muted-foreground">
              Standard-compliant identity provider with PKCE support.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-fd-border bg-fd-card">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1 text-sm">Easy SDK</h3>
            <p className="text-xs text-fd-muted-foreground">
              Drop-in TypeScript SDK for any framework in minutes.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-fd-border bg-fd-card">
            <div className="text-2xl mb-2">🏢</div>
            <h3 className="font-semibold mb-1 text-sm">Organizations</h3>
            <p className="text-xs text-fd-muted-foreground">
              Built-in multi-tenant organization and team management.
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
