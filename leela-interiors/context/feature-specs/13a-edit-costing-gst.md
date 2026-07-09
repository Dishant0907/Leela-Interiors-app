# Feature 13a — Edit Costing: GST Fields Persistence

## Goal
Ensure `PUT /api/costings/[id]` saves all GST-related fields when a costing is edited.

## Scope
- **In:** `PUT /api/costings/[id]` persisting `transaction_type`, `cgst_rate`, `sgst_rate`, `igst_rate`, `cgst_amount`, `sgst_amount`, `igst_amount`, `client_gstin`
- **Out:** Recalculation logic, UI changes, any other route

## Data model changes
None. All columns already exist on the `costings` table.

## API routes

### PUT /api/costings/[id]

| | |
|---|---|
| **Method** | PUT |
| **Path** | `/api/costings/[id]` |
| **Auth** | Supabase session cookie — RLS enforced |

**Request body:**
```ts
{
  title?: string
  client_name?: string
  line_items?: LineItem[]
  totals?: Totals
  transaction_type?: 'intra' | 'inter'
  cgst_rate?: number
  sgst_rate?: number
  igst_rate?: number
  cgst_amount?: number
  sgst_amount?: number
  igst_amount?: number
  client_gstin?: string | null
}
```

**Behaviour:**
- Merge incoming fields with existing row; do not overwrite fields absent from the request body.
- Persist all GST fields as supplied — do not recalculate server-side (same pattern as POST).
- Saving `client_gstin` as `null` (not empty string) when the field is cleared.

**Response (200):**
```ts
{ costing: Costing }
```

**Error cases:**
- 400 — `transaction_type` not in `('intra', 'inter')`
- 401 — no session
- 403 — costing belongs to a different user
- 404 — costing id not found
- 500 — Supabase error

## UI components
None — this is a backend-only change.

## Pages
None.

## Acceptance criteria
1. Editing a costing and switching transaction type from intra to inter persists the updated `transaction_type`, `igst_rate`, `igst_amount` and zeroes out `cgst_rate`, `cgst_amount`, `sgst_rate`, `sgst_amount` in the DB row.
2. Editing a costing and switching from inter to intra persists the correct CGST/SGST values and zeroes IGST.
3. Clearing `client_gstin` on edit saves `null` in the database, not an empty string.
4. A PUT request with no GST fields in the body leaves the existing GST values unchanged.
5. A PUT request with `transaction_type: 'invalid'` returns 400.
6. `npm run build` passes with no TypeScript errors.
