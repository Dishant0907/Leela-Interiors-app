Read `AGENTS.md` before starting.

All core features are built. Build the dashboard home page.

## Dashboard Page

Create `src/app/(app)/dashboard/page.tsx` as a Server Component. This is also the default redirect after login.

Fetch all data server-side using the server Supabase client.

## Summary Cards

Three cards in a row at the top:

**Costings This Month** — count of costings where `created_at` is within the current calendar month.

**Invoiced This Month** — sum of `grand_total` from invoices created this month. Display with `formatINR`.

**Outstanding** — sum of `grand_total` from all invoices where `status != 'paid'`, minus sum of all payments against those invoices. Display with `formatINR`.

## Recent Costings

Below the cards: a table showing the 5 most recent costings.

Columns: Costing No., Client, Grand Total, Date, a "View" link.

Heading row has a "View All" link to `/costings`.

## Search

A search input at the top of the page. On submit (GET form), query Supabase for costings where `costing_number` or `client_name` matches the search term (case-insensitive). Display results in a table below the search bar, or show "No results found" if empty. Clear results when the input is cleared.

Implement as a client component `DashboardSearch` that handles the input state and fires the search.

### Check when done

- `/dashboard` is the page shown after login
- three cards show correct values sourced from Supabase
- recent costings shows the 5 most recent
- search finds costings by costing number or client name
- all values reflect actual DB state on each page load
- `npm run build` passes with no errors
