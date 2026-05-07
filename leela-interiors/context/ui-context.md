# UI Context

## Theme

Clean, professional, light-mode business app. Minimal and functional — no decorative elements. The printed costing document uses a white background with a black totals block and the LI monogram logo. The web UI uses a neutral off-white background with a dark sidebar. All colors are defined as CSS custom properties in `globals.css`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes.

| Role | CSS Variable | Hex / Value |
| --- | --- | --- |
| Page background | `--bg-base` | `#F5F5F4` |
| Surface / card | `--bg-surface` | `#FFFFFF` |
| Sidebar background | `--bg-sidebar` | `#1C1C1E` |
| Sidebar text | `--text-sidebar` | `#E5E5E5` |
| Primary action | `--accent` | `#1C1C1E` |
| Primary hover | `--accent-hover` | `#3A3A3C` |
| Border | `--border` | `#E4E4E7` |
| Text primary | `--text-primary` | `#18181B` |
| Text secondary | `--text-muted` | `#71717A` |
| Success / Paid | `--status-paid` | `#16A34A` |
| Warning / Partial | `--status-partial` | `#D97706` |
| Neutral / Pending | `--status-pending` | `#71717A` |

## Typography

| Role | Font | CSS Variable |
| --- | --- | --- |
| UI text | Inter | `--font-sans` |
| Print document | Inter | same |

## Border Radius

| Context | Class |
| --- | --- |
| Input fields, badges | `rounded-md` |
| Cards, panels | `rounded-xl` |
| Modal / dialog | `rounded-2xl` |

## Component Library

shadcn/ui on top of Tailwind. Use the shadcn CLI to add components (`npx shadcn-ui@latest add [component]`).

## Layout Patterns

- Authenticated shell: fixed dark sidebar (240px) + scrollable main content area
- Costing form page: two-column layout — form on left (60%), live preview on right (40%)
- Dashboard: top summary cards row, then full-width list below
- Print / PDF view: full-width white A4 layout, sidebar hidden via `print:hidden`

## Icons

Lucide React. Stroke-based only. `h-4 w-4` inline, `h-5 w-5` for buttons and nav items.
