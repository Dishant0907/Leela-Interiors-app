# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

* Feature 03: Database Schema — not started

## Current Goal

* Feature 03: Database Schema (03-database-schema.md)

## Completed

* Feature 02 — App Shell & Auth (02-app-shell-auth.md): lib/supabase/client.ts (browser client), lib/supabase/server.ts (server client), proxy.ts (session refresh + auth redirects — Next.js 16 uses proxy.ts not middleware.ts), app/(auth)/layout.tsx, app/(auth)/login/page.tsx, components/layout/sidebar.tsx (dark sidebar, Lucide icons, active route highlight, sign out), app/(app)/layout.tsx (240px fixed sidebar shell), app/(app)/dashboard/page.tsx (placeholder). `npm run build` passes.
  * Note: .env.local keys exist but Supabase URL/anon key values are empty — fill before testing auth
* Feature 01 — Design System (01-design-system.md): deps installed, shadcn/ui initialised (Tailwind v4), all 10 components added, globals.css design tokens defined, lib/utils.ts cn() helper, .env.local created
* Feature 01 (old spec 01-project-setup-auth.md) — project setup portion: Next.js scaffolded, all deps installed (@supabase/supabase-js, @supabase/ssr, lucide-react, zod), .env.local keys present, CSS color tokens in globals.css

## In Progress

* None.

## Next Up
* Feature 03: Database Schema (03-database-schema.md)
* Feature 04: Costing Utilities
* Feature 05: Costing Form
* Feature 06: Costing API & Preview
* Feature 07: Costing Detail List
* Feature 08: Invoice Generation
* Feature 09: Payment Tracking
* Feature 10: Client Management
* Feature 11: Item Master Price List
* Feature 12: Dashboard

## Open Questions

* None yet.

## Architecture Decisions

* Stack: Next.js 14 (App Router) + Supabase + Tailwind + shadcn/ui
* Line items stored as JSONB snapshot on costing row — not normalised
* Costing number format: `LI-YYYY-NNN` (e.g. LI-2026-001), resets each year — invoice format: `INV-YYYY-NNN`
* Single owner login — no multi-user, no roles

## Session Notes

* Node.js required: v18+
* Next.js version: 14 (use `npx create-next-app@latest`)
* Supabase JS client: `@supabase/supabase-js` + `@supabase/ssr`
* shadcn/ui: install via `npx shadcn-ui@latest init` after project creation
