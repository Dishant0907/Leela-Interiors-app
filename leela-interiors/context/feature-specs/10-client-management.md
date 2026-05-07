Read `AGENTS.md` before starting.

Payments are working. Build the client management pages.

## Client List Page

Create `src/app/(app)/clients/page.tsx` as a Server Component.

Fetch all clients for the current user. For each client, also fetch the count of linked costings.

Render a table: Name, Phone, Address, Costings (count), Date Added.

Clicking a row navigates to `/clients/[id]`.

Add a client search input at the top. Filtering happens client-side on the fetched data — extract the table into a `ClientTable` client component that accepts the full list and filters on input change.

## Client Detail Page

Create `src/app/(app)/clients/[id]/page.tsx` as a Server Component.

Fetch client, linked costings, and linked invoices.

Layout:
- client details card at top: Name, Phone, Address, Reference — each field is editable inline
- "Save Changes" button calls `PATCH /api/clients/[id]`
- costings table below: Costing No., Date, Grand Total, link to view
- invoices table below that: Invoice No., Date, Grand Total, Status

## API Route

Create `src/app/api/clients/[id]/route.ts`.

### PATCH /api/clients/[id]

1. Verify auth and ownership — return 401/403 appropriately.
2. Accept: `{ name, phone, address, reference }`.
3. Update the `clients` row.
4. Return `{ data: { id } }`.

### Check when done

- `/clients` lists all clients with costing counts
- search filters the list in real time
- `/clients/[id]` shows client details and linked costings and invoices
- editing and saving client details updates the DB
- navigating to a non-owned client returns 404
