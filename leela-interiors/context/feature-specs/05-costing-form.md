Read `AGENTS.md` before starting.

Utilities are ready. Build the new costing form page — form only, no preview panel yet.

## Route

Create `src/app/(app)/costings/new/page.tsx`.

This is the main daily workflow page. The owner fills in client details and line items, then saves.

## CostingForm Component

Create `src/components/costing/CostingForm.tsx` as a client component.

Use `useReducer` for form state — not react-hook-form. The state shape matches `CostingFormState` from `src/types/costing.ts`.

### Client Details Section

Fields: Name (required), Phone, Address, Reference.

### Colour Fields

Three text inputs in a row: Top Shutter, Base Shutter, Cabinet.

### Item Sections

Four sections in order: Kitchen Cabinet Work, Accessories, Hardware, Civil Work.

Each section:
- heading is bold, slightly larger, uppercase — visually clear separator
- table with columns: #, Description, Qty, Rate (₹), Amount (₹, read-only)
- "Add Row" button appends a blank row
- each row has a delete button (trash icon) on the right
- `amount` auto-updates when qty or rate changes: `amount = qty × rate`

### Bottom Fields

- Freight & Fitting: single number input
- GST Rate: number input, default 18, label shows "GST on Kitchen Work only"
- Notes / Terms: textarea, pre-filled with `DEFAULT_TERMS` from `lib/constants.ts`

### Save Button

On click, POST to `/api/costings`. On success, redirect to `/costings/[id]`. Show loading state during submission. Show inline error if request fails.

## ItemSection Component

Create `src/components/costing/ItemSection.tsx`.

Accepts: `section`, `items`, `onAdd`, `onRemove`, `onChange` props.

## ItemRow Component

Create `src/components/costing/ItemRow.tsx`.

Accepts: `item`, `index`, `onChange`, `onRemove` props. Amount field is read-only and formatted with `formatINR`.

### Check when done

- `/costings/new` renders without errors
- adding a row appends a blank row to the correct section
- removing a row deletes it
- amount updates immediately when qty or rate changes
- save button POSTs correctly (API route built in next spec)
- form state does not reset on re-render
