Read `AGENTS.md` before starting.

Client management is done. Build the item master price list page and wire autocomplete into the costing form.

## Items Page

Create `src/app/(app)/items/page.tsx`.

Fetch all items for the current user. Group and display by section: Kitchen Cabinet Work, Accessories, Hardware, Civil Work.

Each section shows a table: Name, Default Rate, Active (toggle), Actions (edit).

At the top of each section, an "Add Item" button opens an inline form row: Name input, Rate input, Confirm button.

Clicking the confirm button calls `POST /api/items`.

Each item row has an Edit button — clicking it makes the name and rate inline-editable. Saving calls `PATCH /api/items/[id]`.

The active toggle calls `PATCH /api/items/[id]` with `{ active: boolean }`. Inactive items are shown dimmed.

## API Routes

Create `src/app/api/items/route.ts`:

### POST /api/items
Body: `{ section, name, defaultRate }`
1. Verify auth.
2. Insert into `item_master`.
3. Return `{ data: { id } }`.

Create `src/app/api/items/[id]/route.ts`:

### PATCH /api/items/[id]
Body: `{ name?, defaultRate?, active? }`
1. Verify auth and ownership.
2. Update the item.
3. Return `{ data: { id } }`.

## Costing Form Autocomplete

Update `CostingForm` to fetch active items from Supabase on mount (single fetch, all sections).

In each `ItemRow`, when the description field is focused, show a dropdown of active items for that section filtered by what the user has typed. Clicking a suggestion fills the description and sets the rate.

Pass the items list into `ItemRow` via props from `CostingForm`.

### Check when done

- `/items` shows all items grouped by section
- owner can add a new item per section
- owner can edit name and rate inline
- active toggle updates immediately
- costing form description fields show filtered suggestions from the correct section
- selecting a suggestion fills description and rate
- changing a master item rate does not change any saved costing
