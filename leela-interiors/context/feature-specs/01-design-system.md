Read `AGENTS.md` before starting.

We're setting up the Next.js project, installing dependencies, and configuring the design system.

## Project Setup

Run `npx create-next-app@latest leela-interiors` with TypeScript, Tailwind, App Router, and src dir enabled.

Install dependencies:

- `@supabase/supabase-js`
- `@supabase/ssr`
- `lucide-react`
- `zod`

## shadcn/ui

Run `npx shadcn-ui@latest init`. Choose dark theme base.

Add these components:

- Button
- Card
- Input
- Label
- Dialog
- Table
- Badge
- Separator
- ScrollArea
- Tabs

Do not modify generated `components/ui/*` files after installation.

Create `lib/utils.ts` with a reusable `cn()` helper for merging Tailwind classes.

## Design Tokens

Define all CSS custom properties in `src/app/globals.css`:

```css
--bg-base: #F5F5F4;
--bg-surface: #FFFFFF;
--bg-sidebar: #1C1C1E;
--text-sidebar: #E5E5E5;
--accent: #1C1C1E;
--accent-hover: #3A3A3C;
--border: #E4E4E7;
--text-primary: #18181B;
--text-muted: #71717A;
--status-paid: #16A34A;
--status-partial: #D97706;
--status-pending: #71717A;
```

All components must use these tokens. No hardcoded hex values or raw Tailwind color classes like `bg-zinc-900`.

## Environment

Create `.env.local` with placeholders:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Check when done

- `npm run dev` starts without errors
- All shadcn components import without TypeScript errors
- `cn()` works correctly
- All color tokens are defined in `globals.css`
- No default light styling bleeds through
