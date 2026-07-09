


# Feature 08: Item Master Price List

## What

An admin page where the owner manages the standard catalogue of items and their default rates. The costing form uses this list for autocomplete suggestions.

## Why

Rates change over time. One place to update standard prices instead of typing them fresh on every costing.

## Scope

### Included

- Route: `app/(app)/items/page.tsx` — list of all active items grouped by section
- Add new item: section (dropdown), name, default rate
- Edit item name and default rate inline
- Toggle item active/inactive (inactive items hidden from costing form suggestions)
- `POST /api/items` — create item
- `PATCH /api/items/[id]` — update item or toggle active
- Costing form item description fields show a dropdown/autocomplete populated from active items in that section

### Excluded

- Item categories beyond the four sections (Kitchen Cabinet Work, Accessories, Hardware, Civil Work)
- Item deletion (use active/inactive toggle instead)

## Acceptance Criteria

- [ ] `/items` lists all items grouped by section with name, rate, and active toggle
- [ ] Owner can add a new item with section, name, and rate
- [ ] Owner can edit name and rate of an existing item
- [ ] Toggling inactive hides the item from the costing form suggestions
- [ ] Costing form description fields show filtered suggestions from the relevant section's active items
- [ ] Changing a master item rate does not alter any previously saved costing

## Implementation Notes

- Autocomplete in costing form: fetch active items on form load and filter client-side as the owner types.
- Sections enum: `kitchen | accessories | hardware | civil` — matches the `line_items` JSONB structure.
- Item master data is loaded once per form session; no live refetch needed.
