# Feature 09: Dashboard

## What

A summary home page showing key business metrics and recent activity.

## Why

The owner needs a quick overview of monthly activity and outstanding payments without digging into lists.

## Scope

### Included

- Route: `app/(app)/dashboard/page.tsx` (also the default redirect after login)
- Summary cards:
  - Costings created this month (count)
  - Total invoiced this month (sum of invoice grand totals)
  - Outstanding payments (sum of grand totals minus sum of payments across all unpaid/partial invoices)
- Recent costings: last 5 costings, showing costing number, client name, total, date
- Search bar: search by client name or costing number — navigates to matching costing or client on submit

### Excluded

- Charts or graphs
- Date range filtering
- Export of dashboard data

## Acceptance Criteria

- [ ] `/dashboard` is the page shown after login
- [ ] Three summary cards show correct counts/amounts sourced from Supabase
- [ ] Recent costings list shows the 5 most recent costings with correct data
- [ ] Search finds a costing by costing number or client name and navigates to it
- [ ] All values update on page refresh to reflect latest data

## Implementation Notes

- All dashboard data fetched server-side in the Server Component — no client-side data fetching.
- "This month" = current calendar month (first day to today).
- Outstanding = `SUM(invoices.grand_total) WHERE status != 'paid'` minus `SUM(payments.amount)` for those invoices.
- Search is a simple form submit (GET) that queries Supabase for matching costings, not a live search.
