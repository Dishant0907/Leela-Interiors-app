# Feature 03: Costing Form

## What

A two-column page where the owner fills in client details and line items across four sections. Totals calculate live. The owner can save the costing to Supabase.

## Why

This is the primary daily workflow — creating a costing is the first thing the owner does for every new project.

## Scope

### Included

- Route: `app/(app)/costings/new/page.tsx`
- Left column: `CostingForm` client component
  - Client details: name, phone, address, reference
  - Colour fields: Top Shutter, Base Shutter, Cabinet
  - Four item sections: Kitchen Cabinet Work, Accessories, Hardware, Civil Work
  - Each section has add/remove row buttons
  - Each row: description (text), qty (number), rate (number), amount (auto = qty × rate, read-only)
  - Freight & Fitting: single number input below the sections
  - GST rate field (default 18, editable)
  - Notes / Terms field (pre-filled with standard terms from `lib/constants.ts`)
- Right column: `CostingPreview` — live read-only preview of the print document, updates on every change
- `TotalsStrip` component showing section subtotals, GST line, freight, and grand total
- Save button calls `POST /api/costings`
- On successful save, redirect to `costings/[id]`

### Excluded

- Edit existing costing (Feature 03 is new only; edit is a separate task)
- Autosave / draft saving
- Item master autocomplete (added in Feature 08)

## Acceptance Criteria

- [ ] `/costings/new` renders a two-column form + preview layout
- [ ] Adding a row to any section appends a blank row; removing deletes it
- [ ] `amount` column updates immediately when qty or rate changes
- [ ] Section subtotals and grand total update live
- [ ] GST is calculated only on the Kitchen Cabinet Work subtotal
- [ ] Freight is added to the grand total without GST
- [ ] Save button posts to `/api/costings` and redirects to the saved costing detail page
- [ ] Costing number (`LI-YYYY-DDMMYYYY`) is assigned server-side and displayed after save

## Implementation Notes

- Use `useReducer` or `useState` in `CostingForm` for form state — not react-hook-form (too much overhead for dynamic rows).
- `lib/costing.ts` exports `calculateTotals(formState): Totals`. `CostingForm` calls this on every state change and passes result to `TotalsStrip` and `CostingPreview`.
- The costing number is generated in the API route: query max sequence for current year, increment by 1, format as `LI-YYYY-NNN` (zero-padded to 3 digits, e.g. `LI-2026-001`).
- Minimum one row per section is not enforced — sections can be empty.
