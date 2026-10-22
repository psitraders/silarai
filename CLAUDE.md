## specs

Per-feature specs live in `specs/` — table of contents: `specs/index.md`; how specs work: `specs/README.md`. Each spec covers one feature end to end (purpose, scope, functional behaviour, rules, backend data / API / logic, frontend routes / screens / code, known-issue IDs, suggestions, agreed changes). All open problems are in `specs/known-issues.md` (`KI-NNN`). `context.md` holds architecture and cross-cutting detail; `changes.md` holds history.

Before making any change:
- Find the affected feature(s) in `specs/index.md` and read each spec, `specs/_invariants.md`, the spec's *Known issues* entries in `specs/known-issues.md`, and the relevant `context.md` sections.
- Do not break a listed rule (e.g. `CAT-R3`, `INV-2`) without the user's approval.
- Write planned work into the spec's *Changes to be done* before implementing. New feature: copy `specs/_template.md`, set `status: draft`, add it to `specs/index.md`.
- Before building or changing any UI in `frontend/`, read `frontend/design.md` (design rulebook) and follow it.

After making a change (same change, not later):
- Update every affected spec so it describes what the code now does — *Functional behaviour*, *Rules*, *Backend*, *Frontend* — and remove the shipped item from *Changes to be done*.
- `specs/known-issues.md`: delete issues the change fixed (and their IDs from the specs); add any new problem found with the next free ID and list the ID in the affected specs.
- Update `specs/index.md` if a spec was added, renamed or removed; take new rule numbers from the table in `specs/README.md` and update it.
- Update `context.md` only if architecture or cross-cutting detail changed; add one line to `changes.md` tagged with the spec id (e.g. `[catalog-products]`).

Conventions: feature detail lives in the owning spec only (others link to it); spec families share a file-name prefix (e.g. `storefront-builder-*`, `catalog-*`) and a rule-ID prefix; rule and KI IDs are never renumbered or reused. `landing_website/` has no specs.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
