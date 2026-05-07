Read `AGENTS.md` before starting.

The costing form and API are working. Build the costing detail page and the costings list page.

## Costing Detail Page

Create `src/app/(app)/costings/[id]/page.tsx` as a Server Component.

Fetch the costing from Supabase using the server client. If not found or not owned by the current user, return `notFound()`.

Page layout:
- action bar at top (hidden on print): "Print / Export PDF" button, "Convert to Invoice" button (links to invoice creation — wired in spec 08), "Back to Costings" link
- full `CostingPreview` component below, rendered with static costing data

The "Print / Export PDF" button calls `window.print()`. It is a client component — extract it as `src/components/costing/PrintButton.tsx`.

Print styles:
- `@media print`: hide sidebar, action bar, and all buttons
- A4 portrait, 14mm margins

## Costing List Page

Create `src/app/(app)/costings/page.tsx` as a Server Component.

Fetch all costings for the current user, ordered by `created_at` desc.

Render a table with columns: Costing No., Client, Grand Total, Date, Status, Actions.

Actions column: "View" link to `/costings/[id]`.

Add a "New Costing" button at the top right that links to `/costings/new`.

Use `formatINR` for amounts and `formatDate` for dates.

Empty state: show a message and a prominent "Create your first costing" button if no costings exist.

### Check when done

- `/costings` lists all saved costings with correct data
- clicking a costing navigates to its detail page
- `/costings/[id]` renders the full print-ready document
- print dialog opens on button click
- sidebar and buttons are absent in the printed output
- "New Costing" button navigates to `/costings/new`
