# Feature 05: Invoice Generation

## What

Convert a saved costing into a formal invoice with one click. The invoice gets its own number and a locked copy of the line items.

## Why

The owner needs to issue a formal invoice (separate from the working costing) once a project is confirmed.

## Scope

### Included

- "Convert to Invoice" button on the costing detail page (`/costings/[id]`)
- `POST /api/invoices` — creates an invoice row, copying all line items and totals from the costing
- Invoice number format: `INV-YYYY-NNN` (e.g. `INV-2026-001`), generated server-side by querying max invoice sequence for the current year and incrementing.
- Route: `app/(app)/invoices/[id]/page.tsx` — invoice detail page with document preview
- `InvoicePreview` component — same visual layout as `CostingPreview` but heading reads "INVOICE"
- Print / Export PDF button on invoice detail page
- Route: `app/(app)/invoices/page.tsx` — list of all invoices

### Excluded

- Editing invoice line items after creation (locked by design)
- Partial invoice (invoice always reflects full costing amount)

## Acceptance Criteria

- [ ] "Convert to Invoice" button on costing detail creates an invoice and redirects to `/invoices/[id]`
- [ ] Invoice stores a snapshot of line items — changing the original costing does not affect the invoice
- [ ] Invoice number is assigned server-side in `INV-YYYY-DDMMYYYY` format
- [ ] `/invoices/[id]` renders the invoice document with "INVOICE" heading
- [ ] Print output matches the costing print layout but shows invoice number and "INVOICE" heading
- [ ] `/invoices` lists all invoices with invoice number, client name, total, date, payment status

## Implementation Notes

- The API route copies `line_items`, `kitchen_total`, `accessories_total`, `hardware_total`, `civil_total`, `freight`, `gst_rate`, `gst_amount`, `grand_total` from the costing row — it does not re-calculate.
- `invoices.status` starts as `pending` and is updated by the payments feature.
- A costing can only have one invoice — check for existing invoice before creating.
