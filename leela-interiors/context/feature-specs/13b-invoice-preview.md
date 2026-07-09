# Feature 13b — InvoicePreview Component

## Goal
Create a dedicated `InvoicePreview` component that renders invoice-specific headings and number while preserving the identical GST breakdown from `CostingPreview`.

## Scope
- **In:** `components/costing/InvoicePreview.tsx`, wiring it into `app/(app)/invoices/[id]/page.tsx`
- **Out:** Changes to `CostingPreview`, PDF export, new pages

## Data model changes
None.

## API routes
None.

## UI components

### InvoicePreview

**File:** `components/costing/InvoicePreview.tsx` (new)

**Approach:** Add a `mode` prop (`'costing' | 'invoice'`) to `CostingPreview` and have `InvoicePreview` re-export it with `mode="invoice"` pre-applied. If `CostingPreview` is too tightly coupled to costing copy to accept a prop cleanly, build `InvoicePreview` as a standalone component — layout and GST breakdown must be identical either way.

**Props:**
```ts
interface InvoicePreviewProps {
  invoice: Invoice            // full invoice row with all GST snapshot columns
  businessProfile?: BusinessProfile | null
}
```

**Differences from CostingPreview:**
- Page heading reads **"INVOICE"** (not "QUOTATION" / "COSTING")
- Invoice number (`invoice.invoice_number`) shown prominently below the heading
- Shows invoice date, not costing date

**GST display rules (identical to CostingPreview):**
- `transaction_type === 'intra'` → show CGST row + SGST row; hide IGST
- `transaction_type === 'inter'` → show IGST row; hide CGST/SGST
- Show client GSTIN in the client section if present
- Totals block: Taxable Value → tax rows → Grand Total

## Pages

### app/(app)/invoices/[id]/page.tsx
- Replace the current `CostingPreview` usage with `<InvoicePreview invoice={invoice} businessProfile={businessProfile} />`.
- No changes to data fetching — `businessProfile` is already fetched here.

## Acceptance criteria
1. The invoice detail page (`/invoices/[id]`) renders the heading "INVOICE".
2. The invoice number is displayed prominently below the heading.
3. An intra-state invoice shows CGST and SGST rows; IGST row is absent.
4. An inter-state invoice shows the IGST row; CGST and SGST rows are absent.
5. The Grand Total, Taxable Value, and tax amounts on the invoice preview match the stored snapshot values exactly.
6. Business name, GSTIN, and address from `businessProfile` appear in the invoice header.
7. Client GSTIN appears in the client section when present on the invoice row.
8. `npm run build` passes with no TypeScript errors.
