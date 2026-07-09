# Feature 04: Costing Detail & PDF Export

## What

A detail page for a saved costing that shows the full document preview and lets the owner print or export as PDF.

## Why

The owner needs to share the costing with the client — printed or as a PDF file.

## Scope

### Included

- Route: `app/(app)/costings/[id]/page.tsx` — Server Component, fetches costing from Supabase
- Full costing document rendered as `CostingPreview` component (same as used in the form)
- Print / Export PDF button — triggers `window.print()`
- Print CSS: A4 portrait, 14mm margins, sidebar and action buttons hidden (`print:hidden`)
- "Convert to Invoice" button (links to invoice creation — wired up in Feature 05)
- "Edit" button (wired up when edit feature is built)
- Costing list page: `app/(app)/costings/page.tsx` — table of all costings, sorted by date desc

### Excluded

- PDF generation via a library (browser print is sufficient)
- Email / WhatsApp sending

## Acceptance Criteria

- [x] `/costings/[id]` renders the full costing document using data from Supabase
- [x] "Print / Export PDF" button opens the browser print dialog
- [x] Printed output shows: LI logo, COSTING heading, client details, colour fields, four item sections, totals block, terms & conditions
- [x] Sidebar and buttons are hidden in the printed output
- [x] `/costings` shows a list of all costings with costing number, client name, grand total, date, status
- [x] Clicking a costing in the list navigates to its detail page

## Implementation Notes

- `CostingPreview` is shared between the new costing form (live preview) and this detail page.
- On the detail page, `CostingPreview` receives static data — no form state.
- The LI logo is a styled text element (`LI` in a black square), not an image file.
- Terms & Conditions text is stored in `lib/constants.ts` as `DEFAULT_TERMS`.
