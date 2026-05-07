# Code Standards

## General

- Write the simplest code that satisfies the spec. Do not add abstractions not required by the current feature.
- Every function, component, and route handler has a single responsibility.
- No commented-out code in committed files.
- All user-facing numbers are formatted with `formatINR()` from `lib/format.ts`. Never format currency inline.
- All dates are formatted with `formatDate()` from `lib/format.ts`.

## TypeScript

- `strict: true`. No `any` — use `unknown` and narrow.
- All domain entities have explicit types in `types/`. No inline type literals for entities.
- Supabase-generated types live in `types/supabase.ts` — regenerate after every schema change.
- API route request/response bodies are typed with Zod schemas in `lib/validators/`.

## Next.js

- App Router only. No Pages Router.
- Server Components are the default. Use `"use client"` only when the component needs browser interactivity (form state, event handlers, live preview).
- Data fetching in Server Components via the server Supabase client. Never fetch in `useEffect` when a Server Component can do it.
- Route handlers in `app/api/` handle all mutations. Client components call these via `fetch`.
- Use Next.js `loading.tsx` for all list and detail pages.

## Styling

- All colors via CSS variables defined in `globals.css`. No raw Tailwind color classes (`bg-zinc-900`, `text-gray-500`, etc.).
- Use Tailwind utility classes for spacing, layout, and sizing.
- No inline `style` props except for dynamic values that cannot be expressed as classes.
- Print styles use `print:` Tailwind variant. Sidebar and action buttons are `print:hidden`.

## API Routes

- Every mutation route: validate input with Zod, check `auth.uid()`, then write to DB.
- Return consistent shape: `{ data, error }`. Error is a string message, not an object.
- HTTP status codes: 200 success, 400 validation error, 401 unauthenticated, 500 server error.

## Data and Storage

- Line items saved as JSONB on the costing row. Never create a separate `line_items` table.
- Pre-calculate and store all totals on save. Never compute totals on read.
- Supabase server client (`lib/supabase/server.ts`) for route handlers and Server Components.
- Supabase browser client (`lib/supabase/client.ts`) for Client Components.

## File Organisation

- `lib/costing.ts` — GST calculation, section totals, costing number generation
- `lib/format.ts` — `formatINR`, `formatDate`
- `lib/constants.ts` — `SECTIONS`, `GST_RATE`, `COSTING_PREFIX`, `INVOICE_PREFIX`
- `lib/validators/` — Zod schemas for API route bodies
- `components/costing/` — all costing form and preview components
- `components/invoice/` — invoice preview and payment stage components
- `components/ui/` — shadcn primitives only; no business logic
- `types/costing.ts` — `CostingFormState`, `LineItem`, `Section`, `Costing`
- `types/supabase.ts` — generated Supabase DB types
