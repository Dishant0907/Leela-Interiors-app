# Development Workflow

## Approach

Always read `project-overview.md`, `architecture-context.md`, and the relevant feature spec before writing any code. Implement exactly what the spec says — do not add features, pages, or UI elements not listed. If something is ambiguous, state the assumption explicitly and proceed. Update `progress-tracker.md` at the end of every session.

## Scoping Rules

- One feature spec = one implementation unit. Do not combine two feature specs in a single session.
- A feature is complete when all its acceptance criteria are checked off.
- Do not refactor unrelated code while implementing a feature — log it in Open Questions instead.
- Never touch the database schema without updating `architecture-context.md` in the same session.

## When To Split Work

Split an implementation step if it combines:

- A schema change + a UI change
- Two or more unrelated pages or routes
- A new shared component + the feature that consumes it

If a single task would touch more than 4 files across different layers, the scope is too broad — split it.

## Handling Missing Requirements

- If a spec is silent on a detail, use the simplest reasonable default and note the assumption in a code comment.
- If a requirement contradicts an invariant in `architecture-context.md`, stop and flag it — do not work around invariants silently.
- Never invent new features, pages, or data models not described in the spec.

## Protected Foundation Components

Do not modify the following unless explicitly instructed:

- `lib/supabase/client.ts` and `lib/supabase/server.ts`
- `lib/costing.ts` GST calculation logic
- `types/supabase.ts` (regenerate via CLI only)
- The authenticated layout shell in `app/(app)/layout.tsx`

## Keeping Docs In Sync

Update the relevant context file whenever implementation changes:

- Schema change → update `architecture-context.md` Storage Model section
- New shared utility → add to `code-standards.md` File Organisation
- Feature completed → check off acceptance criteria in feature spec + add one-line entry to `progress-tracker.md`
- Permanent architectural decision made → add to `progress-tracker.md` Architecture Decisions

## Before Moving To The Next Unit

1. All acceptance criteria in the feature spec are checked off.
2. `progress-tracker.md` is updated with the completed feature.
3. No TypeScript errors (`tsc --noEmit` passes).
4. The page or feature works end-to-end in the browser (not just compiles).
5. Any schema changes are reflected in `architecture-context.md`.
