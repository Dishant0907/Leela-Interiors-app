# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

* Feature 01: Design System Setup — complete

## Current Goal

* Feature 02: Database Schema

## Completed

* Feature 01 — Design System (01-design-system.md): deps installed, shadcn/ui initialised (Tailwind v4), all 10 components added, globals.css design tokens defined, lib/utils.ts cn() helper, .env.local created

## In Progress

* None.

## Next Up

* Feature 01: Project Setup & Auth
* Feature 02: Database Schema
* Feature 03: Costing Form
* Feature 04: Costing Preview & PDF Export
* Feature 05: Invoice Generation
* Feature 06: Payment Tracking
* Feature 07: Client Management
* Feature 08: Item Master Price List
* Feature 09: Dashboard

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
