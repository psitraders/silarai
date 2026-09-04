# Change Log

Chronological history of changes. Newest entries at the bottom.

---

- 2026-08-26 — Added `context.md` at project root documenting architecture, routing, server layers, design system, content model, env vars, deployment, conventions, and known gaps.
- 2026-08-26 — Added `changes.md` at project root to track the chronological change history.
- 2026-08-28 — Deleted `server.ts`, `api/index.ts`, `vercel.json` and `VERCEL_DEPLOYMENT.md`; the site is now a fully static build with no backend.
- 2026-08-28 — Deleted `public/_headers` and `public/_redirects` (Cloudflare Pages config, ignored by Azure).
- 2026-08-28 — Added `src/data/siteArchitecture.ts` holding `PRIMARY_PILLAR_KEYWORDS`, `KEYWORD_CLUSTERS`, `GEO_DEFINITION_ANSWER_BLOCKS` and `SITE_ARCHITECTURE`, extracted from the deleted `server.ts`.
- 2026-08-28 — Added `scripts/generate-static-discovery.mts` generating `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `ai-manifest.json`, `.well-known/*` and eight `/ai/*.json` knowledge files into `dist/` at build time.
- 2026-08-28 — Sitemap grew from 22 hand-maintained URLs to 50 generated from `SITE_ARCHITECTURE`, sub-pages, use cases and discovery files.
- 2026-08-28 — Repointed all `/api/*` knowledge references to `/ai/*.json` across `AiDiscoveryModal`, `DistributorsBacklinkHub`, `authoritativeBacklinks.ts`, `knowledgeGraph.ts` and `ragDiscoveryEngine.ts`.
- 2026-08-28 — Added `src/config/forms.ts` with Web3Forms endpoint, access key and recipient configuration.
- 2026-08-28 — Rewired `BookDemoModal` from `POST /api/book-demo` to a client-side Web3Forms submission, added a honeypot field and an `AlertCircle` error state.
- 2026-08-28 — Fixed `BookDemoModal` reporting success on failed submissions (`submitted` was set in a `finally` block regardless of outcome).
- 2026-08-28 — Added `public/staticwebapp.config.json` with SPA navigation fallback, MIME types, security headers, cache rules and CORS for the AI knowledge files.
- 2026-08-28 — Marked `src/lib/wordpress.ts` and `src/lib/WordPressIntegrationManager.ts` dormant with header comments; they depend on removed proxy routes.
- 2026-08-28 — Fixed type error in `D2cIndustryPage.tsx` where a demo preset lacking `userText` was passed to `setDemoResponse`; `npm run lint` now passes clean.
- 2026-08-28 — Removed `express`, `nodemailer`, `dotenv`, `esbuild`, `@google/genai`, `d3` and related type packages from `package.json`; renamed the package from `react-example` to `silarai-landing-website`; `dev` is now plain `vite` and `build` runs the discovery generator.
- 2026-08-28 — Added `.env.example` (`VITE_WEB3FORMS_ACCESS_KEY`, `SITE_URL`) and typed `import.meta.env` in `src/vite-env.d.ts`.
- 2026-08-28 — Rewrote `context.md` for the static architecture: build-time generation, Web3Forms flow, Azure deployment checklist, re-ranked known gaps.
- 2026-08-28 — Added 301 redirect routes in `staticwebapp.config.json` sending `/blog*`, `/wp-content*`, `/wp-admin*`, `/wp-login.php` and `/feed*` to `blog.silarai.com`.
- 2026-08-28 — Added `DEPLOYMENT.md`: step-by-step runbook for the Azure Static Web Apps deployment and the silarai.com DNS cutover, including relocating WordPress to `blog.silarai.com`.
- 2026-08-29 — Corrected `DEPLOYMENT.md` step 2.2: Hostinger's Add Subdomain creates an empty document root by default, which caused an outage when step 2.3 redirected the live site into it; added the custom-folder requirement, a verification gate, and a recovery procedure.
- 2026-08-29 — Changed `DEPLOYMENT.md` step 2.3 to set `WP_HOME`/`WP_SITEURL` in `wp-config.php` rather than the WordPress admin UI, so the change is reversible when the site stops loading.
- 2026-09-04 — Fixed `.github/workflows/azure-static-web-apps-black-mushroom-050c17800.yml` (the workflow that deploys `landing_website` to `silarai.com`): added an `env:` block injecting `VITE_WEB3FORMS_ACCESS_KEY` (from a GitHub Actions secret) and `SITE_URL` into the `Azure/static-web-apps-deploy@v1` build step. Neither was previously wired in, despite `DEPLOYMENT.md` instructing it — Vite bakes `VITE_*` at build time inside Oryx, so without this the deployed demo-request form fails silently. The `VITE_WEB3FORMS_ACCESS_KEY` GitHub secret must still be added by hand.
- 2026-09-04 — Reverted uncommitted drift in `public/staticwebapp.config.json`: restored the `responseOverrides.404` → `/index.html` (200) rewrite and the `includeSubDomains` directive on the HSTS header, both of which had been locally removed without a corresponding commit or changelog entry.
- 2026-09-04 — Verified the static build end-to-end (fresh `npm install` + `npm run build` off-repo, since the mounted `D:\work\silarai\repo` path rejects some file operations from this environment): compiles clean, sitemap/robots/canonical all resolve to `https://silarai.com`, `blog.silarai.com` appears only in the intended 301 redirect rules. Noted `bun.lock` and `package-lock.json` are both committed — flagged as a candidate cleanup, not changed.
- 2026-09-04 — Verified the live cutover by fetching the production site directly: `https://silarai.com` and `/sitemap.xml` serve correct content, `https://app.silarai.com` serves the separate dashboard product correctly. DNS now runs on Cloudflare (moved off Hostinger's zone editor); the apex `CNAME`/`TXT` records the user configured there are correct (Cloudflare flattens apex CNAMEs; the TXT is Azure's domain-ownership validation).
- 2026-09-04 — Found via live DNS queries: no MX record for `silarai.com` (mail to `info@silarai.com`, where Web3Forms sends demo-request leads, cannot be delivered) and `www.silarai.com` does not resolve (NXDOMAIN). Both documented in `context.md` §11 and `DEPLOYMENT.md`'s status note; neither fixed here — needs a DNS change in Cloudflare, which this session has no access to.
- 2026-09-04 — Retired the WordPress blog (user decision: no longer migrating to `blog.silarai.com`, which was found live but serving an empty page). Removed the `/blog*`, `/wp-content*`, `/wp-admin*`, `/wp-login.php`, `/feed*` redirect routes from `public/staticwebapp.config.json`; marked `DEPLOYMENT.md` Phase 2 and Phase 5 as retired/historical, updated its target-end-state table, post-cutover checklist and rollback section accordingly; updated `context.md` §9 domain layout table and §11 known gaps to match.
