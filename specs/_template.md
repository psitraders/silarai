---
id: <feature-id>          # kebab-case, matches the file name (family prefix first, e.g. catalog-coupons)
status: draft             # draft | current | deprecated
prefix: XXX               # rule-ID prefix; files of one family share it and one number sequence
related: []               # other spec ids this one depends on
---
# <Feature name>

## Purpose
One to three lines: what this feature does and for whom.

## Scope
- **In:** what this feature owns.
- **Out:** what it deliberately does not own (link the spec that does).

## Functional behaviour
How the feature works from the user's point of view: main flows, states, limits, notifications. Short bullets.

## Rules
Business rules and invariants that must not break. Stable IDs, never renumbered; deprecated rules are struck through, not deleted. Take the next free number of the prefix from `README.md`.
- **XXX-R1** — …

## Backend
- **Data:** entities and the fields that matter (`Domain/<Area>/…`), tenant scope, soft delete.
- **API:** `METHOD route` — auth — what it does. Group by controller.
- **Logic:** handlers / services and the non-obvious steps (validation, caching, side effects, emails).

## Frontend
- **Routes & screens:** route → page (`frontend/src/…`), who can see it.
- **Code:** API module, components, state, notable client-side logic.

## Known issues
IDs of open problems that affect this feature, e.g. `KI-012, KI-031` — the detail lives in [`known-issues.md`](known-issues.md). When there are none: `None open — see [known-issues](known-issues.md).`

## Suggestions
Improvement ideas. Not yet agreed work.

## Changes to be done
Agreed work, written here **before** implementation. Remove an item once it ships (the history lives in `changes.md`).
- [ ] …

<!-- Extend only when needed, e.g. "## Open questions" or "## Plan" (or a link to a plan in docs/). -->
