# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. `context/project-overview.md` — product definition, goals, features, and scope
2. `context/architecture-context.md` — system structure, boundaries, storage model, and invariants
3. `context/ui-context.md` — theme, colors, typography, and component conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
6. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in the context files, update the relevant file before continuing.

## Business Domain Rules

These rules are absolute. Never violate them regardless of what seems simpler to implement:

- GST (18%) is calculated **only** on the Kitchen Cabinet Work section subtotal. Never apply GST to Accessories, Hardware, Civil Work, or Freight.
- Costing numbers follow the format `LI-YYYY-NNN` (e.g. `LI-2026-001`). Invoice numbers follow `INV-YYYY-NNN`. Both are generated server-side by querying the max sequence for the current year and incrementing by 1. The sequence resets each calendar year.
- Saved costing line items are a JSONB snapshot. Never mutate them after save.
- Invoice line items are locked at creation. Never allow edits after an invoice is generated.
- All database mutations go through `app/api/` route handlers. Client components never write to Supabase directly.
- RLS is enforced on every table. No query ever returns rows belonging to another user.
- This is a single-owner app. There is no multi-user access, no roles, no sharing.