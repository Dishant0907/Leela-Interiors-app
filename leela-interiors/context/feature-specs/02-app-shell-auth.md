Read `AGENTS.md` before starting.

We're building the authenticated app shell — the layout that wraps every business page.

## App Shell Layout

Create `src/app/(app)/layout.tsx`.

This layout renders a fixed dark sidebar (240px wide) on the left and a scrollable main content area on the right. The sidebar must be `print:hidden`.

## Sidebar

Create `src/components/layout/sidebar.tsx`.

Requirements:
- dark background using `--bg-sidebar`
- top: `LI` monogram in a small black square, followed by "Leela Interiors" text
- nav links below: Dashboard, Costings, Invoices, Clients, Items
- each link uses a Lucide icon: `LayoutDashboard`, `FileText`, `Receipt`, `Users`, `Package`
- active link is highlighted using `--accent` background
- use `usePathname()` to determine active route
- bottom: sign out button

## Auth Login Page

Create `src/app/(auth)/login/page.tsx`.

Requirements:

- centered card layout, light background
- email and password inputs
- "Sign in" button calls Supabase `signInWithPassword`
- on success redirect to `/dashboard`
- show inline error message on failure

## Supabase Clients

Create `src/lib/supabase/client.ts` — browser Supabase client using `createBrowserClient` from `@supabase/ssr`.

Create `src/lib/supabase/server.ts` — server Supabase client using `createServerClient` from `@supabase/ssr` with cookie handling.

## Middleware

Create `src/middleware.ts`.

- refresh Supabase session on every request
- redirect unauthenticated users to `/login`
- redirect authenticated users away from `/login` to `/dashboard`

## Auth Layout

Create `src/app/(auth)/layout.tsx` — minimal wrapper with no sidebar, just centered content.

### Check when done

- visiting `/dashboard` without a session redirects to `/login`
- login with valid Supabase credentials redirects to `/dashboard`
- sidebar renders on all `/(app)` routes and is hidden on print
- active nav link is visually highlighted
- `npm run build` passes
