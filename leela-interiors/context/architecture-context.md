# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 14 + TypeScript | Full-stack app (App Router) |
| UI | Tailwind CSS + shadcn/ui | Component composition and styling |
| Auth | Supabase Auth | Email/password login, session management |
| Database | Supabase (PostgreSQL) | All persistent data |
| PDF | react-pdf or browser print | Costing and invoice export |
| Hosting | Vercel | Deployment |

## System Boundaries

- `app/(auth)/` — login page, no nav shell
- `app/(app)/` — authenticated shell with sidebar nav; all business pages live here
- `app/api/` — server-side route handlers for mutations (create costing, create invoice, record payment)
- `lib/` — pure utility functions: GST calc, number formatting, costing number generation, Supabase clients
- `components/costing/` — CostingForm, ItemSection, ItemRow, CostingPreview, TotalsStrip
- `components/invoice/` — InvoicePreview, PaymentStages
- `components/ui/` — shadcn primitives and shared UI atoms
- `types/` — TypeScript types for all domain entities

## Storage Model

- **Supabase Postgres**: all costings, invoices, payments, clients, item master records
- **Line items**: stored as JSONB snapshot on the `costings` row — never normalised into child rows. This preserves historical accuracy if item master rates change.
- **Totals**: pre-calculated and stored on save (`kitchen_total`, `gst_amount`, `grand_total`) — never derived on read.
- **Invoice line items**: copied from costing at creation time and locked; never reference the live costing rows.

## Auth Model

- Supabase Auth with email/password. Single owner account.
- Row Level Security (RLS) enabled on all tables. Every row is scoped to `auth.uid()`.
- Server Supabase client (with service role) used only in `app/api/` route handlers.
- Browser Supabase client used in client components for reads.
- Unauthenticated users are redirected to `/login` by Next.js middleware.

## Invariants

1. GST (18%) is calculated only on the Kitchen Cabinet Work section subtotal — never on Accessories, Hardware, Civil Work, or Freight.
2. Saved costing line items are a JSONB snapshot. Editing the item master never mutates saved costings.
3. Invoice line items are a copy of the costing at conversion time and are immutable after creation.
4. All database mutations go through `app/api/` route handlers — client components never write to Supabase directly.
5. RLS is enforced on every table — no query ever returns rows belonging to another user.
6. Costing numbers follow the format `LI-YYYY-NNN` (e.g. `LI-2026-001`) and invoice numbers `INV-YYYY-NNN` (e.g. `INV-2026-001`). The sequence resets to 001 each calendar year. Both are generated server-side on save by querying the max sequence for the current year and incrementing by 1.
