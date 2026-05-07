Read `AGENTS.md` before starting.

The form UI is ready. Build the costing API route, the live preview panel, and the totals strip.

## API Route

Create `src/app/api/costings/route.ts`.

### POST /api/costings

1. Verify auth — return 401 if unauthenticated.
2. Parse and validate request body with Zod.
3. Call `calculateTotals(body)` to compute all totals.
4. Generate costing number: query `MAX(costing_number)` for the current year from the `costings` table, extract sequence, increment by 1, format as `LI-YYYY-NNN` (zero-padded to 3 digits).
5. Match client by name (case-insensitive). If no match, create a new `clients` row. Use the matched or created `client_id`.
6. Insert into `costings` table with all computed fields.
7. Return `{ data: { id, costing_number } }`.

Return `{ error: string }` with appropriate status on failure.

## TotalsStrip Component

Create `src/components/costing/TotalsStrip.tsx`.

Receives a `Totals` object. Renders a dark block showing:

- Kitchen Cabinet Work subtotal
- Accessories subtotal
- Hardware subtotal
- Civil Work subtotal
- Freight & Fitting
- GST (18% on Kitchen Work)
- **Grand Total** (larger, bold)

All amounts formatted with `formatINR`.

## CostingPreview Component

Create `src/components/costing/CostingPreview.tsx`.

This is the live print document preview. It renders what will be printed/PDFed.

Layout (A4 proportions, white background):
- Header row: `LI` monogram (black square, white text) on left, "LEELA INTERIORS" + "COSTING" heading on right
- Costing number and date below header
- Client details block: Name, Phone, Address, Reference
- Colour details: Top Shutter, Base Shutter, Cabinet
- Item table: four sections with category rows, line item rows, section subtotals
- Totals block (black background): mirrors TotalsStrip
- Terms & Conditions at bottom

Receives `CostingFormState` + `Totals` as props. Updates live as form state changes.

## Wire Preview into Form

Update `src/app/(app)/costings/new/page.tsx` to two-column layout:
- Left (60%): `CostingForm`
- Right (40%): `CostingPreview` (sticky, scrolls with page)

`CostingForm` calls `calculateTotals` on every state change and passes result down to `TotalsStrip` (inside form) and up to the preview panel.

### Check when done

- `POST /api/costings` creates a row in Supabase and returns `{ data: { id, costing_number } }`
- costing number follows `LI-YYYY-NNN` format and increments correctly
- preview panel updates live on every keystroke
- totals strip shows correct values with GST only on kitchen total
- saving redirects to `/costings/[id]`
- `npm run build` passes
