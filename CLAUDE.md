# Instructions for Claude

## Build, lint, and test commands

Use **bun** as the package manager in this repository.

Don't run **bun** commands directly but recommend them to the user.

There is currently **no test script/test runner configured** in `package.json`, so there is no repository-defined “single test” command yet.

## High-level architecture

- This is a **Next.js App Router frontend** (`app/`) backed by a **Convex backend** (`convex/`).
- Convex Auth is configured server-side in:
    - `convex/auth.ts` (exports `auth`, `signIn`, `signOut`, `store`, `isAuthenticated`)
    - `convex/http.ts` (mounts auth HTTP routes)
    - `convex/schema.ts` (includes `authTables` + app tables like `users`, `leads`, `leadComments`, `issues`, `files`)
- Frontend auth wiring:
    - `app/ConvexClientProvider.tsx` wraps the app with `ConvexAuthNextjsProvider`.
    - `app/layout.tsx` mounts `ConvexClientProvider` globally.
    - `proxy.ts` applies Convex Auth route protection/redirect logic.
- Seed/init flow:
    - `convex/seed.ts` creates a password user and is executed by `dev:convex` (`convex dev --run seed:seed`).

## Key repository conventions

- **Next.js version-specific rule:** Do not assume older Next.js behavior. Check docs under `node_modules/next/dist/docs/` before implementing framework-level changes.
- **Use bun for scripts and dependency management.**
- **Frontend/backend split is intentional:** UI and routing logic in `app/`, data/auth/business logic in `convex/`.
- **Auth pattern:** use Convex Auth primitives rather than custom auth plumbing.
    - Server config in `convex/auth.ts`
    - Client/provider usage in `app/ConvexClientProvider.tsx`
    - Route guarding in `proxy.ts`
- **UI stack:** shadcn/ui conventions are configured in `components.json` (aliases like `@/components`, `@/lib`, `@/components/ui`).
- **TypeScript is strict** (`tsconfig.json` with `"strict": true`), and path alias `@/*` maps to repo root.
