# Specs

Per-feature specs for the Silarai platform (backend + merchant dashboard + storefront + chatbot widget). Each spec covers one feature end to end: **purpose, scope, functional behaviour, rules, backend (data, API, logic), frontend (routes, screens, code), known-issue IDs, suggestions and agreed changes**. Architecture and cross-cutting setup (stack, layers, multi-tenancy, pipeline, secrets, migrations, build & deploy) stay in `../context.md`; history stays in `../changes.md`. The marketing site (`landing_website/`) is not covered.

Specs were rebuilt from the code on 2026-10-21; problems found then are in `known-issues.md`.

## Where to start

- [**index.md**](index.md) — table of contents linking every spec file.
- [**known-issues.md**](known-issues.md) — every open problem (ID, severity, affected specs). Specs list only the IDs.
- [**_invariants.md**](_invariants.md) — rules shared by all features.

## Rule IDs

| Prefix | Highest used | Prefix | Highest used |
|---|---|---|---|
| INV | INV-12 | CH | CH-R5 |
| SHL | SHL-R4 | AIC | AIC-R9 |
| AUTH | AUTH-R12 | CBS | CBS-R17 |
| TEN | TEN-R7 | SF | SF-R11 |
| BIZ | BIZ-R5 | SB | SB-R25 |
| CAT | CAT-R14 | B2B | B2B-R4 |
| CRM | CRM-R7 | MKT | MKT-R8 |
| ORD | ORD-R8 | ANA | ANA-R3 |
| KI (known-issues) | see *Next free ID* in `known-issues.md` | ADM | ADM-R5 |

A new rule takes the next number of its prefix; update this table in the same change.

## Workflow (every change)

1. **Before coding — consult the specs:** open `index.md`, read the spec(s) of every feature the change touches, `_invariants.md`, the relevant *Known issues* in `known-issues.md`, and `../context.md` for architecture. Do not break a listed rule (e.g. `CAT-R3`, `INV-2`) without the user's approval. Write the planned work in the spec's *Changes to be done* (new feature → copy `_template.md`, `status: draft`, add it to `index.md`).
2. **Implement.**
3. **After coding — update the specs in the same change** so they describe what the code now does: *Functional behaviour*, *Rules*, *Backend*, *Frontend*; remove the shipped item from *Changes to be done*; in `known-issues.md` delete fixed issues (and their IDs from the specs) and add any new problem found; update `index.md` if a spec was added / renamed / removed; update `../context.md` only if architecture or cross-cutting detail changed; log one line in `../changes.md` tagged with the spec id, e.g. `2026-09-26 — [catalog-products] …`.

## Conventions

- One feature per file; a fact lives in the spec that owns it — other specs link to it (`see orders-checkout`) instead of repeating it.
- Paths: backend relative to `backend/src/ReplyCart.*` (e.g. `Application/Catalog/…`, `Api/Controllers/v1/…`), frontend relative to `frontend/src/` unless written in full. 🔒 = requires a dashboard JWT.
- Rule IDs are stable: never renumber; strike through a retired rule instead of deleting it; a rule may move to another file of the same family (leave a pointer).
- Problems are recorded once, in `known-issues.md` (stable `KI-NNN` IDs, never reused); a spec's *Known issues* section lists only the IDs. An issue becomes agreed work only when it is added to a spec's *Changes to be done*.
- Add extra sections only when a feature needs them (see the note at the end of `_template.md`).
