# Feature 02: Database Schema

## What

Create all Supabase tables, enable Row Level Security, and generate TypeScript types.

## Why

All other features depend on a stable, correct schema.

## Scope

### Included

- Table: `clients` — id, user_id, name, phone, address, reference, created_at
- Table: `item_master` — id, user_id, section, name, default_rate, active, created_at
- Table: `costings` — id, user_id, client_id, costing_number, status, client_name, client_phone, client_address, client_reference, shutter_top, shutter_base, cabinet_color, line_items (JSONB), kitchen_total, accessories_total, hardware_total, civil_total, freight, gst_rate, gst_amount, grand_total, notes, created_at, updated_at
- Table: `invoices` — id, user_id, costing_id, client_id, invoice_number, status, line_items (JSONB), kitchen_total, accessories_total, hardware_total, civil_total, freight, gst_rate, gst_amount, grand_total, created_at
- Table: `payments` — id, user_id, invoice_id, stage (advance/pre_delivery/completion), amount, paid_at, notes
- RLS policies: all tables restrict SELECT/INSERT/UPDATE/DELETE to `auth.uid() = user_id`
- Generate `types/supabase.ts` via Supabase CLI

### Excluded

- Database functions / triggers (totals are computed in app code)
- Soft delete (no `deleted_at` columns at this stage)

## Acceptance Criteria

- [ ] All 5 tables exist in Supabase with correct columns and types
- [ ] RLS is enabled on every table
- [ ] A row inserted by user A is not returned when queried as user B
- [ ] `types/supabase.ts` generated and committed
- [ ] `architecture-context.md` Storage Model reflects the final schema

## Implementation Notes

- `line_items` JSONB shape: `{ sections: { kitchen: LineItem[], accessories: LineItem[], hardware: LineItem[], civil: LineItem[] } }`
- `LineItem`: `{ id: string, description: string, qty: number, rate: number, amount: number }`
- `costings.status`: `draft | saved`
- `invoices.status`: `pending | partial | paid`
- `payments.stage`: `advance | pre_delivery | completion`
- Run migrations via Supabase SQL editor or CLI. Save the SQL in `supabase/migrations/`.
