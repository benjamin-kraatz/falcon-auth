# FALCON Auth — public documentation

TanStack Start + Fumadocs. Production build uses **Nitro** with the **Vercel** preset (`vite.config.ts`), which writes to `.vercel/output/`.

## Local development

From the monorepo root:

```bash
bun install
bun run dev:docs
```

Or from `apps/docs`:

```bash
bun run dev
```

## Deploy on Vercel

1. Create a Vercel project and set **Root Directory** to `apps/docs`.
2. **Install command** (monorepo workspace install from repo root):

   ```bash
   cd ../.. && bun install
   ```

3. **Build command**:

   ```bash
   cd ../.. && bun run build:docs
   ```

   This runs `nx run @falcon/auth-docs:build`, which executes `vite build` in this app and produces `.vercel/output/` for Nitro on Vercel.

4. Leave **Output Directory** empty in the Vercel UI (Nitro/Vercel integration uses the generated output under `.vercel/output`).

5. Optional: add `vercel.json` in this folder (see `vercel.json`) so the same commands are committed for the team.

No environment variables are required for the static docs site unless you add server-side search or analytics later.

## Typecheck

```bash
bun run types:check
```
