## specs

Per-feature specs live in `specs/` (index: `specs/README.md`). They hold purpose, scope, rules, UI, suggestions and agreed changes; `context.md` holds implementation detail; `changes.md` holds history.

Rules:
- Before changing a feature, read `context.md`, `specs/_invariants.md` and that feature's spec. Do not break a listed rule (e.g. `CAT-R3`, `INV-2`) without the user's approval.
- Planned work goes into the spec's *Changes to be done* before implementation. New feature: copy `specs/_template.md`, set `status: draft`, add it to `specs/README.md`.
- In the same change: update the spec's Rules/Scope/UI if behaviour changed and remove the shipped item from *Changes to be done*; update `context.md` if implementation detail changed; add one line to `changes.md` tagged with the spec id (e.g. `[catalog]`).
- Keep specs high-level; do not copy implementation detail from `context.md` into them. `landing_website/` has no specs.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
