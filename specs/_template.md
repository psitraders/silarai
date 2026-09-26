---
id: <feature-id>          # kebab-case, matches the file name
status: draft             # draft | current | deprecated
context: "§x.y"           # where the implementation detail lives in context.md
---
# <Feature name>

## Purpose
One to three lines: what this feature does and for whom.

## Scope
- **In:** what this feature owns.
- **Out:** what it deliberately does not own (link the spec that does).

## Rules
Business rules and invariants that must not break. Stable IDs, never renumbered; deprecated rules are struck through, not deleted.
- **XXX-R1** — …

## UI
Main screens / entry points (paths relative to `frontend/src/`).

## Suggestions
Improvement ideas and known gaps. Not yet agreed work.

## Changes to be done
Agreed work, written here **before** implementation. Remove an item once it ships (the history lives in `changes.md`).
- [ ] …

<!-- Extend only when needed, e.g. "## Open questions" or "## Plan" (or a link to a plan in docs/). -->
