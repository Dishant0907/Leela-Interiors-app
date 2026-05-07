# Feature 01: Project Setup & Auth

## What

Scaffold the Next.js project with all required dependencies, configure Supabase connection, and implement email/password login with protected routes via middleware.

## Why

Everything else depends on a working auth layer and project structure.

## Scope

### Included

- `npx create-next-app@latest` with TypeScript, Tailwind, App Router, src dir
- Install: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `zod`
- Install and init shadcn/ui (`Button`, `Input`, `Label`, `Card` to start)
- `lib/supabase/client.ts` — browser Supabase client
- `lib/supabase/server.ts` — server Supabase client (using `@supabase/ssr`)
- `middleware.ts` — redirect unauthenticated users to `/login`
- `app/(auth)/login/page.tsx` — email/password login form
- `app/(app)/layout.tsx` — authenticated shell with dark sidebar and top nav
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- CSS variables for all color tokens defined in `globals.css`

### Excluded

- Sign-up flow (owner account created manually in Supabase dashboard)
- Password reset
- OAuth / social login

## Acceptance Criteria

- [ ] `npm run dev` starts without errors
- [ ] Visiting any `/(app)` route when unauthenticated redirects to `/login`
- [ ] Login form authenticates against Supabase and redirects to `/dashboard`
- [ ] Signing out clears session and redirects to `/login`
- [ ] Sidebar is visible on all authenticated pages with nav links: Dashboard, Costings, Invoices, Clients, Items
- [ ] All CSS color variables from `ui-context.md` are defined in `globals.css`

## Implementation Notes

- Use `@supabase/ssr` (not the legacy `auth-helpers`) for cookie-based session management in Next.js App Router.
- Middleware must refresh the session on every request to keep cookies valid.
- The sidebar nav uses `usePathname()` to highlight the active route.
