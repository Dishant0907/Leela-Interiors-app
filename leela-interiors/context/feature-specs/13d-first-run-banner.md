# Feature 13d — First-Run Business Profile Banner

## Goal
Prompt users with an incomplete business profile to fill in Settings before their costings and invoices print with missing GSTIN or business name.

## Scope
- **In:** `FirstRunBanner` component, wired into costing new, costing detail, and invoice detail pages
- **Out:** Blocking users from creating costings, auto-filling profile fields, email reminders

## Data model changes
None.

## API routes
None.

## UI components

### FirstRunBanner

**File:** `components/shared/FirstRunBanner.tsx` (new)

**Props:**
```ts
interface FirstRunBannerProps {
  show: boolean    // parent decides visibility based on profile completeness
}
```

**Behaviour:**
- Render nothing when `show` is `false`.
- When `show` is `true`, render an amber/yellow dismissible banner at the top of the page content area, below the top nav and above the page heading.
- Banner copy: **"Your business profile is incomplete. Invoices and costings won't show your GSTIN or business name until you fill in Settings."**
- CTA: **"Go to Settings →"** — links to `/settings`.
- Dismiss button (✕) in the top-right corner of the banner.
- On dismiss, set `sessionStorage.setItem('bannerDismissed', 'true')` and hide the banner.
- On mount, check `sessionStorage.getItem('bannerDismissed')`; if `'true'`, do not show the banner even if `show` is `true`.
- Banner reappears on next session (new tab or cleared sessionStorage) until the profile is complete.

**Completeness condition (evaluated by the parent, not the component):**
Banner `show` = `!businessProfile?.gstin || !businessProfile?.business_name`

## Pages

### app/(app)/costings/new/page.tsx
Already fetches `businessProfile`. Add:
```tsx
<FirstRunBanner show={!businessProfile?.gstin || !businessProfile?.business_name} />
```
Place immediately before the page heading.

### app/(app)/costings/[id]/page.tsx
Already fetches `businessProfile`. Add the same `<FirstRunBanner>` in the same position.

### app/(app)/invoices/[id]/page.tsx
Already fetches `businessProfile`. Add the same `<FirstRunBanner>` in the same position.

## Acceptance criteria
1. A user whose `businessProfile` has no `gstin` sees the amber banner on `/costings/new`.
2. A user whose `businessProfile` has no `business_name` sees the amber banner on `/costings/[id]` and `/invoices/[id]`.
3. The "Go to Settings →" link navigates to `/settings`.
4. Clicking ✕ dismisses the banner for the current session; the banner does not reappear on page refresh within the same session.
5. Opening a new session (or clearing `sessionStorage`) causes the banner to reappear if the profile is still incomplete.
6. A user with both `gstin` and `business_name` filled in does **not** see the banner on any of the three pages.
7. `npm run build` passes with no TypeScript errors.

