# Feature 06: Payment Tracking

## What

Record payment milestones against an invoice and track the outstanding balance.

## Why

The owner needs to know how much has been received and how much is still due for each project.

## Scope

### Included

- `PaymentStages` component shown on the invoice detail page below the document preview
- Three stages displayed: Advance (60%), Pre-Delivery (30%), Completion (10%)
- Each stage shows: expected amount (% of grand total), amount received input, date received, notes, mark-as-paid button
- `POST /api/payments` — records a payment stage entry
- Outstanding balance = grand total − sum of all recorded payments
- Invoice status badge updates automatically: Pending (no payments) → Partial (some paid) → Paid (fully paid)
- `PATCH /api/invoices/[id]/status` updates invoice status based on payment totals

### Excluded

- Partial amounts within a single stage (each stage is recorded as one payment)
- Payment deletion or editing after recording

## Acceptance Criteria

- [ ] `PaymentStages` shows three stages with expected amounts pre-calculated from invoice total
- [ ] Owner can enter amount, date, and optional note for each stage and save
- [ ] Outstanding balance updates after each payment is recorded
- [ ] Invoice status badge changes to Partial after first payment, Paid when outstanding = 0
- [ ] Payment records persist in Supabase `payments` table
- [ ] Recorded payments survive page refresh

## Implementation Notes

- Expected amounts are display-only suggestions (60%/30%/10% of grand total). Owner can enter any actual amount received.
- `outstanding = invoice.grand_total - sum(payments.amount)` — computed in the component from fetched data.
- Status update: call `PATCH /api/invoices/[id]/status` after every payment save to recompute and store status.
