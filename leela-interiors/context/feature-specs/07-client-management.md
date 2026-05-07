# Feature 07: Client Management

## What

A simple CRUD interface for client records. Clients are created when a costing is saved. The clients page shows all clients and their linked history.

## Why

The owner needs to quickly find all costings and invoices for a specific client.

## Scope

### Included

- Route: `app/(app)/clients/page.tsx` — list of all clients, searchable by name or phone
- Route: `app/(app)/clients/[id]/page.tsx` — client details + list of linked costings + list of linked invoices
- Edit client name, phone, address, reference (inline on detail page)
- `PATCH /api/clients/[id]` — update client details
- When a costing is saved, if a client with the same name does not exist, a new client record is created automatically

### Excluded

- Client deletion
- Client-level analytics or totals

## Acceptance Criteria

- [ ] `/clients` lists all clients with name, phone, and number of costings
- [ ] Search input filters the client list by name or phone in real time
- [ ] `/clients/[id]` shows client details and lists all linked costings and invoices
- [ ] Owner can edit client name, phone, address, reference and save changes
- [ ] Saving a new costing with a new client name creates a client record automatically

## Implementation Notes

- Client matching on costing save: exact case-insensitive name match. If matched, link to existing client. If not, create new.
- The client autocomplete in the costing form is added in Feature 08 (Item Master) — not in this feature.
