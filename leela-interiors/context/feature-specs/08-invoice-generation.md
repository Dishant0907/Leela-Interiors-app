Read `AGENTS.md` before starting.

Costings are working end-to-end. Build invoice generation from a saved costing.

## API Route

Create `src/app/api/invoices/route.ts`.

### POST /api/invoices

Body: `{ costingId: string }`

1. Verify auth — return 401 if unauthenticated.
2. Fetch the costing. Return 404 if not found or not owned by current user.
3. Check if an invoice already exists for this costing. Return 400 if so — one invoice per costing only.
4. Generate invoice number: query `MAX(invoice_number)` for the current year from the `invoices` table, extract sequence, increment by 1, format as `INV-YYYY-NNN`.
5. Copy `line_items`, `kitchen_total`, `accessories_total`, `hardware_total`, `civil_total`, `freight`, `gst_rate`, `gst_amount`, `grand_total`, `client_id` from the costing row — do not recalculate.
6. Insert into `invoices` table. Status starts as `pending`.
7. Return `{ data: { id, invoice_number } }`.

## Invoice Detail Page

Create `src/app/(app)/invoices/[id]/page.tsx` as a Server Component.

Fetch invoice from Supabase. Fetch linked costing for client details.

Layout:
- action bar (print hidden): "Print / Export PDF" button, "Back to Invoices" link
- `InvoicePreview` component — same layout as `CostingPreview` but heading reads "INVOICE" and shows invoice number instead of costing number
- `PaymentStages` component below the preview (built in spec 09)

Create `src/components/invoice/InvoicePreview.tsx`. It accepts the same props as `CostingPreview` but replaces "COSTING" with "INVOICE" in the heading and shows the invoice number.

## Invoice List Page

Create `src/app/(app)/invoices/page.tsx` as a Server Component.

Table columns: Invoice No., Client, Grand Total, Date, Payment Status (badge).

Badge colors: Pending → `--status-pending`, Partial → `--status-partial`, Paid → `--status-paid`.

## Wire Up "Convert to Invoice" Button

Update the `CostingDetailActions` component on `/costings/[id]` to make the "Convert to Invoice" button functional.

On click, POST to `/api/invoices` with the costing ID. On success, redirect to `/invoices/[id]`. Show loading state. If invoice already exists, navigate directly to the existing invoice.

### Check when done

- "Convert to Invoice" on costing detail creates an invoice and redirects to `/invoices/[id]`
- clicking the button a second time navigates to the existing invoice, not create another
- invoice number follows `INV-YYYY-NNN` format
- `/invoices/[id]` renders the invoice document with "INVOICE" heading
- `/invoices` lists all invoices with status badges
- print output is correct on invoice detail page
