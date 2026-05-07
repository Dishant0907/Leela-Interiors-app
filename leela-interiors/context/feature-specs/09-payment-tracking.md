Read `AGENTS.md` before starting.

Invoices are working. Build payment milestone tracking on the invoice detail page.

## API Route

Create `src/app/api/payments/route.ts`.

### POST /api/payments

Body: `{ invoiceId: string, stage: 'advance' | 'pre_delivery' | 'completion', amount: number, paidAt: string, notes?: string }`

1. Verify auth — return 401 if unauthenticated.
2. Validate the invoice belongs to the current user.
3. Insert into `payments` table.
4. After insert, recompute invoice status: fetch all payments for this invoice, sum amounts. If sum >= invoice.grand_total, set status to `paid`. If sum > 0, set to `partial`. Otherwise `pending`. Update `invoices.status`.
5. Return `{ data: { id } }`.

## PaymentStages Component

Create `src/components/invoice/PaymentStages.tsx` as a client component.

Receives: `invoice` (with `grand_total`), `existingPayments` (array from DB).

Renders three stage rows. Each row:

- Stage label: "Advance (60%)", "Pre-Delivery (30%)", "Completion (10%)"
- Expected amount: calculated from grand total (display only, not enforced)
- If stage already has a payment recorded: show amount paid, date, notes, and a green "Paid" badge
- If stage not yet paid: show amount input, date picker (date input), notes input, "Record Payment" button

On "Record Payment" click: POST to `/api/payments`. On success, refresh the page data to show the updated state.

Below the three stages, show:
- Total Received: sum of all payments
- Outstanding: `grand_total - total received`
- Overall status badge

Use `formatINR` for all amounts.

## Wire Into Invoice Detail

Update `src/app/(app)/invoices/[id]/page.tsx` to fetch existing payments and pass them to `PaymentStages`.

Place `PaymentStages` below `InvoicePreview`. Wrap in `print:hidden` so it doesn't appear on printed invoice.

### Check when done

- all three stages render with expected amounts
- recording a payment saves to Supabase and updates the display
- outstanding balance is always `grand_total - sum(payments)`
- invoice status badge updates: Pending → Partial → Paid
- recorded payments survive page refresh
- payment section is hidden on print
