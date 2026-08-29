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
