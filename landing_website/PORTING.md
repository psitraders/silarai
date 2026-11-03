# Porting an AI Studio export into `landing_website/`

The marketing site is designed in Google AI Studio, exported into the gitignored
`imported_landing_website/` folder at the repo root, and **ported by hand** into
`landing_website/`. The export is a reference, never a build source.

Read this before every import round. Background and the reasons behind each rule are in
`context.md` §4.0; history of every round is in `changes.md`.

---

## 1. Workflow

1. **Export** from AI Studio into `imported_landing_website/` (replace its contents).
2. **Diff** against this folder. Normalise a copy of the export first, so the diff shows
   real upstream changes rather than our standing URL adaptations, and ignore CR (a
   Windows checkout makes our files CRLF; the export is LF):
   ```bash
   cp -r imported_landing_website/src /tmp/imp && \
   find /tmp/imp -name '*.ts*' -exec sh -c 'python3 landing_website/scripts/normalize-import.py "$1" "$1"' _ {} \;
   diff -rq --strip-trailing-cr /tmp/imp landing_website/src
   ```
   Classify every changed/new/deleted file: *port*, *port with adaptation*, or *exclude* (§3).
   Files the export deleted are dead code here too — delete them (asks for permission).
3. **Pause on anomalies.** Anything that changes contact details, URLs/canonicals, the
   no-backend rule, published claims or the build pipeline needs a decision before
   porting — list them and ask.
4. **Port** the approved files, applying every adaptation in §2.
5. **Re-check the recurring regressions** in §4.
6. **Verify** (§5).
7. **Document**: update `context.md` (routes, components, gaps), add dated lines to
   `changes.md`, and add one summary line to the root `changes.md`.

## 2. Adaptation rules (apply on every round)

| # | Rule | What the export does |
|---|---|---|
| A1 | **Canonical host is the apex `https://silarai.com`.** | Uses `https://www.silarai.com` (NXDOMAIN). |
| A2 | **Keep the current URL scheme**: no trailing slashes, existing paths, sub-pages keep their own URLs. A URL migration is a separate, planned change. | Adds trailing slashes, collapses sub-pages, ships `src/lib/canonicalUrls.ts` with 301 maps. |
| A3 | **No `/api/*` URLs.** Knowledge surfaces are the generated `/ai/*.json` files. On Azure SWA `/api` is reserved for Functions. | Reintroduces `/api/*` in `ragDiscoveryEngine`, `knowledgeGraph`, `authoritativeBacklinks`. |
| A4 | **Contact details come from `src/config/forms.ts`** (`CONTACT_EMAIL`, phone, legal name, address). Forms use `buildMailtoUrl()` / `openMailClient()`. | Hardcodes an inbox (latest: `sales@silarai.com`) and builds its own `mailto:`. |
| A5 | **No false success.** Every form/widget says "press Send" — never "sent", "dispatched" or "we'll reply in N minutes". Failure shows an error. | The chat widget and forms claim delivery. |
| A6 | **No backend.** Nothing that needs a server, API key or Node runtime. | Ships `server.ts`/Express history, `vercel.json`, `/api` dev middleware. |
| A7 | **Generated files stay generated.** Don't copy `public/sitemap.xml`, `llms*.txt`, `robots.txt`, `ai/`, `.well-known/`, `api/`, `_headers`, `_redirects`, `seo-meta-table*`. New routes go into `scripts/generate-static-discovery.mts`. | Ships hand-written copies. |
| A8 | **Our files win** for `package.json` (name, scripts, deps), `vite.config.ts` (only build-time HTML tweaks ported), `.env.example`, `DEPLOYMENT.md`, `src/vite-env.d.ts`, `src/server/` location. | Renames the package, adds unused deps (`d3`), moves data to `src/data/`. |
| A9 | **`index.html`**: take content/meta changes only. Drop the AI Studio WebSocket/console-suppression `<script>`. | Prepends a script that patches `WebSocket`, `console.error/warn` and swallows errors. |
| A10 | **Router**: every new route goes into **both** the `currentView` initialiser and `handlePopState` in `App.tsx`, before the `/industries/*` catch-all, plus `handleNavigateUniversal` / `handleSelectIndustry` if linked by id. | Same, but with its own URL style. |

The URL part of A1–A3 is mechanical. Run it per ported file:

```bash
python3 landing_website/scripts/normalize-import.py imported_landing_website/src/<file> landing_website/src/<file>
```

`scripts/normalize-import.py` (dev tool, not part of the build): `www.` → apex;
`/api/<x>` → matching `/ai/*.json`; strip trailing slashes on site paths — quoted strings
and `${CANONICAL_HOST}/…/` / `${origin}/…/` templates — except `/` and
`/ai-commerce-marketing-platform/`. Prefix strings passed to `startsWith` / `replace` /
`includes` etc. are left alone (stripping `'/sector/'` there breaks slug parsing). Then
review the diff by hand — it does not cover contact details, copy, or route logic.

`/api` → `/ai` map: `aeo/faq`→`aeo-faq.json` · `ai-discovery`→`discovery.json` ·
`d2c-knowledge-graph`, `knowledge-graph/d2c`→`d2c-knowledge-graph.json` ·
`geo-knowledge`→`geo-knowledge.json` · `rag/context`→`rag-chunks.json` ·
`site-architecture` and any `*/keywords`, `*/seo`→`site-architecture.json`.
Links to `/ai/*.json` files the generator does not emit (e.g. `/ai/keywords.json`,
`/ai/seo.json`, `/ai/seo-meta-table.json`) → point at `site-architecture.json` /
`geo-knowledge.json`, or drop them.

## 3. Standing exclusions (do not port)

- **Author-facing SEO tooling**: `BacklinkAuthorityHub`, `PartnerOutreachSuggester`,
  `PartnerEmailDrafter`, `SearchPreviewPane`, `SeoMetaTableModal`,
  `data/partnerOutreachMatrix.ts`, `data/seoMetaTableGenerator.ts`,
  `server/seoMetaTableBackend.ts`, their `/backlinks` `/partners` `/research`
  `/seo-meta-table` routes, the hidden Footer entry points and the
  `onOpenSeoMetaTable` / `onOpenBacklinkHub` / `onOpenFullTable` props.
- **`AiDiscoveryModal`** — the export embeds `SearchPreviewPane`; keep ours.
- **`src/lib/canonicalUrls.ts`** and the export's `scripts/generateStaticFiles.ts`. When the
  export's `SeoHead` calls `getCanonicalUrlForView()`, keep our local `CANONICAL_PATHS`
  map in `SeoHead` instead and add any new view to it.
- **The export's hosting configs**: `staticwebapp.config.json` (root and `public/` —
  `trailingSlash: "always"` + 301 map), `nginx.conf`, `web.config`. Ours stays; port
  individual rules only on request (the WordPress `410` rules were taken 2026-10-31).
- **Dark-mode CSS** in `index.css` — no toggle exists (declined 2026-10-19).
- Everything in A6/A7.

## 4. Recurring regressions to re-fix

These have come back in more than one round:

- `Breadcrumbs` items use `active:` / `current:` → must be `isCurrent: true`.
- `D2cIndustryPage` `setDemoResponse(preset)` → presets key the text as `query`, state
  field is `userText`.
- `DistributorsIndustryPage` `onNavigateToPage` receives a **URL** (from
  `DistributorsBacklinkHub`) — wire it to `handleNavigateToUrl`, not the view-based
  `handleNavigateUniversal`.
- Forms/widget setting success from a `catch`/`finally`, or hardcoding the inbox.
- Internal-link `path` values that the router doesn't resolve (soft 404 via SWA fallback).
- Sub-page canonicals collapsed into the parent in `seoMetaTable` / `SeoHead` (AI Shopping
  Assistant 2–3, Commerce Platform 2–3, D2C 1–3, Manufacturing 1–3) → restore per-sub-page URLs.
- `SeoHead` dropping the `noindex` for preview/AI Studio/localhost hosts.
- `RoiCalculator` imported eagerly → keep it `React.lazy` inside `PricingSection`.
- Type errors the export ships with (2026-10-31: `ErrorBoundary`'s cast-based class
  declaration) — `npm run lint` must pass before anything else.

## 5. Verification checklist

Run from a Linux copy if the Windows `node_modules` can't execute (`npm ci` there).

- [ ] `npm run lint` (tsc) passes; `tsc --noEmit --noUnusedLocals` shows nothing new in ported files.
- [ ] `npm run build` passes; sitemap count printed matches expectations.
- [ ] `grep -r "/api/\|www\.silarai" dist/ai dist/.well-known dist/*.json dist/*.txt` → nothing.
- [ ] `grep -rl "SeoMetaTableModal\|BacklinkAuthorityHub" dist/assets` → nothing.
- [ ] Every new route renders its page (not home/manufacturing) with its own title and
      canonical, with and without a trailing slash, and no console errors.
- [ ] Demo form, contact form and chat widget open a `mailto:` to `CONTACT_EMAIL` and say
      "press Send".

## 6. Decisions log

| Date | Decision |
|---|---|
| 2026-09-14 | Forms use `mailto:` handoff; author SEO tooling excluded. |
| 2026-09-20 | Chat widget kept as canned demo (export needed `/api/chat`). `AiDiscoveryModal` kept. |
| 2026-10-19 | Inbox stays `psitraders@outlook.com` until `silarai.com` has a working MX. URL scheme kept (no www, no trailing slashes, sub-pages kept); URL migration deferred. Export's client-side chat widget ported with honest `mailto:` lead form. Ported: PWA manifest, hero-image preload, non-blocking CSS + inline critical CSS. Declined: dark-mode CSS. |
| 2026-10-31 | URL migration still deferred (export now ships real SWA 301s + `trailingSlash: always`, but on `www` and with a `/contact*` loop); only its WordPress `410` rules taken. Dead components the export deleted were deleted here. `SeoHead` is the single owner of head metadata/JSON-LD (inline JSON-LD removed upstream). `RoiCalculator` kept lazy. Preview-host `noindex` kept. |
