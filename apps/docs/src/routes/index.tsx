import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";

import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-col flex-1 justify-center px-4 py-8 text-center">
        <h1 className="mb-2 font-medium text-2xl">FALCON Auth</h1>
        <p className="text-fd-muted-foreground mx-auto mb-6 max-w-md text-sm">
          Documentation for operators and partners integrating with the FALCON identity platform.
        </p>
        <Link
          to="/docs/$"
          params={{
            _splat: "",
          }}
          className="bg-fd-primary text-fd-primary-foreground mx-auto rounded-lg px-4 py-2 text-sm font-medium"
        >
          Open documentation
        </Link>
      </div>
    </HomeLayout>
  );
}
