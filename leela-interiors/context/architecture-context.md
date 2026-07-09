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

All data lives in Supabase Postgres. RLS is enabled on every table; every row is scoped to `auth.uid() = user_id`.

### Tables

**`clients`** — `id, user_id, name, phone, address, reference, created_at`

**`item_master`** — `id, user_id, section, name, default_rate (numeric), active (bool), created_at`

**`costings`** — `id, user_id, client_id (fk→clients), costing_number, status (draft|saved), client_name, client_phone, client_address, client_reference, shutter_top, shutter_base, cabinet_color, line_items (jsonb), kitchen_total, accessories_total, hardware_total, civil_total, freight, gst_rate, gst_amount, grand_total, notes, created_at, updated_at`

**`invoices`** — `id, user_id, costing_id (fk→costings), client_id (fk→clients), invoice_number, status (pending|partial|paid), line_items (jsonb), kitchen_total, accessories_total, hardware_total, civil_total, freight, gst_rate, gst_amount, grand_total, created_at`

**`payments`** — `id, user_id, invoice_id (fk→invoices), stage (advance|pre_delivery|completion), amount, paid_at, notes`

### Key design decisions

- **Line items JSONB shape**: `{ sections: { kitchen: LineItem[], accessories: LineItem[], hardware: LineItem[], civil: LineItem[] } }` where `LineItem = { id, description, qty, rate, amount }`. Never normalised into child rows — preserves historical accuracy if item master rates change.
- **Totals**: pre-calculated and stored on save (`kitchen_total`, `gst_amount`, `grand_total`) — never derived on read.
- **Invoice line items**: copied from costing at creation time and locked; never reference the live costing rows.
- **No triggers or DB functions**: all total calculations happen in app code before writing to Postgres.

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
