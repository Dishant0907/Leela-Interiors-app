# Feature 13c — HSN/SAC in Item Master UI

## Goal
Surface the existing `item_master.hsn_sac` column in the Items Manager table and inline add/edit form.

## Scope
- **In:** `ItemsManager` table column, inline add form field, inline edit form field
- **Out:** HSN/SAC on line items within the costing form (already implemented), new migrations

## Data model changes
None. `item_master.hsn_sac` (text, nullable) already exists.

Verify that `POST /api/items` and `PUT /api/items/[id]` include `hsn_sac` in their insert/update statements. If not, add it — no migration needed, just update the query.

## API routes

### POST /api/items — verify hsn_sac is persisted
Confirm `hsn_sac` is included in the Supabase insert. If absent, add it.

### PUT /api/items/[id] — verify hsn_sac is persisted
Confirm `hsn_sac` is included in the Supabase update. If absent, add it.

No route signature changes required.

## UI components

### ItemsManager

**File:** `app/(app)/items/ItemsManager.tsx` (edit in place)

**Table column:**
- Add "HSN/SAC" as the third column, after "Item Name" and "Unit", before "Rate".
- Read mode: display `item.hsn_sac ?? '—'`.
- Header: `HSN/SAC`, same style as other header cells.

**Inline add form:**
- Add `hsn_sac` text input between the unit and rate inputs.
- Placeholder: `"HSN/SAC (optional)"`.
- Validation: empty is allowed (saves as `null`). If non-empty, must match `/^\d{4,8}$/`; show inline error `"Must be 4–8 digits"` on invalid input. Do not submit the form while the error is shown.
- On save, send `hsn_sac: value || null` in the POST body.

**Inline edit form:**
- Pre-populate `hsn_sac` field from the existing item record.
- Same validation as add form.
- On save, send `hsn_sac: value || null` in the PUT body.

## Pages
None — `ItemsManager` is already mounted on `app/(app)/items/page.tsx`.

## Acceptance criteria
1. The Items Manager table displays an "HSN/SAC" column.
2. An item with a saved HSN/SAC code shows the code in that column.
3. An item with no HSN/SAC code shows "—" in that column.
4. Saving a new item with a valid 6-digit HSN code persists it; fetching the item returns the same code.
5. Saving a new item with no HSN/SAC value saves `null` (not an empty string) in the database.
6. Entering a non-digit or out-of-range value (e.g. "AB12" or "12") in the HSN/SAC field shows the inline error and prevents form submission.
7. Editing an existing item updates `hsn_sac` correctly (including clearing it to `null`).
8. `npm run build` passes with no TypeScript errors.
