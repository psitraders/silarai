# SilarAI Landing Website — Project Context

> **Authoritative project reference.** Read this before implementing features, fixing bugs, or refactoring.
> Update this file whenever architecture, behaviour, workflows, or features change.

Last updated: 2026-09-14

---

## 1. Overview

Marketing / lead-generation website for **SilarAI**, an AI commerce platform (AI Shopping Assistant + AI Commerce Platform). It is a **fully static single-page React application** with a heavy SEO / GEO / AEO layer: a set of generated static files exists purely to make the site machine-readable by AI crawlers (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews).

**There is no backend.** The site builds to plain files and is deployed to Azure Static Web Apps.

Two primary business goals:

1. **Convert visitors into demo requests** — `BookDemoModal` / `ContactUsPage` → pre-filled `mailto:` handoff → the visitor presses Send.
2. **Rank and get cited** — extensive keyword-cluster content, per-view JSON-LD schema, and a set of machine-readable knowledge files under `/ai/`.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19, TypeScript 5.8, JSX runtime `react-jsx` |
| Build | Vite 6 (`@vitejs/plugin-react`) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first `@theme` config in `src/index.css`) |
| Icons | `lucide-react` (~34 components) |
| Charts | `recharts` (only in `RoiCalculator`) |
| Animation | `motion` (Framer Motion successor) — only in `HeroSection`; `canvas-confetti` in `BookDemoModal` |
| Form delivery | `mailto:` handoff to the visitor's own mail client — no backend, no form service |
| Build tooling | `tsx` (runs the discovery generator only — not a runtime dependency) |
| Hosting | Azure Static Web Apps |

### Scripts

- `npm run dev` — `vite` dev server
- `npm run build` — `vite build`, then `npm run generate:discovery`
- `npm run generate:discovery` — `tsx scripts/generate-static-discovery.mts` (emits SEO/AI files into `dist/`)
- `npm run preview` — `vite preview` against `dist/`
- `npm run lint` — `tsc --noEmit` (type-check only; no ESLint configured)

No test framework is configured.

---

## 3. Folder Structure

```
landing_website/
├── index.html               # Vite entry; static SEO/OG/JSON-LD head block
├── src/
│   ├── main.tsx             # React root (StrictMode)
│   ├── App.tsx              # Router + view switch + modal state (the app shell)
│   ├── index.css            # Tailwind v4 @theme design tokens
│   ├── types.ts             # Shared content/domain interfaces
│   ├── config/
│   │   └── forms.ts         # Contact details + mailto: builder (single source of truth)
│   ├── components/          # 36 components: sections, full pages, modals
│   ├── data/
│   │   ├── content.ts       # All marketing copy/data (single source of truth)
│   │   ├── siteArchitecture.ts     # Pillars, industries, keyword clusters, GEO blocks
│   │   ├── seoMetaTable.ts  # Per-view/sub-page SEO meta records + findSeoMetaEntry()
│   │   └── authoritativeBacklinks.ts  # Semantic backlink corpus + helpers
│   ├── lib/                 # ⚠️ DORMANT WordPress clients — see §4.6
│   ├── server/              # Misnomer: build-time data only, no server runtime
│   │   ├── knowledgeGraph.ts       # D2C knowledge graph (nodes/relationships + ASCII)
│   │   └── ragDiscoveryEngine.ts   # RAG chunks, AEO Q&A, OpenAPI spec, plugin manifest
│   └── assets/images/       # Logo concepts & hero imagery (jpg)
├── scripts/
│   └── generate-static-discovery.mts  # Build-time SEO/AI file generator
├── public/
│   └── staticwebapp.config.json  # Azure SWA config (copied to dist/ by Vite)
├── vite.config.ts           # `@` alias → project root; HMR toggle via DISABLE_HMR
└── .env.example             # SITE_URL (forms need no configuration)
```

`src/server/` is a historical name. Nothing in it runs at request time — the two modules are pure data consumed by the build script and by `AiDiscoveryModal`. Consider renaming to `src/knowledge/`.

---

## 4. Architecture

### 4.0 `imported_landing_website/` — do not build from it

The repo root also holds `imported_landing_website/`, a Google AI Studio export of this
same site. **It is a reference folder, not a second app**, and is **gitignored** (root
`.gitignore`) so it never reaches the repo or a build. It still contains the
pre-Azure architecture that was deliberately deleted here — `server.ts`, `api/index.ts`,
`vercel.json`, `VERCEL_DEPLOYMENT.md`, `public/_headers`, `public/_redirects`,
hand-written `public/sitemap.xml` / `llms.txt` / `robots.txt` / `.well-known/*`, and a
`package.json` depending on `express`, `nodemailer` and `@google/genai`.

Its SEO/UI work was merged into `landing_website/` on 2026-09-14 (see `changes.md`).
When merging anything else from it, three things must be adapted rather than copied:

1. **`/api/*` URLs are dead** — this build has no backend. Knowledge surfaces are the
   generated `/ai/*.json` files (§4.4); forms hand off via `mailto:` (§4.7).
2. **Forms must not report false success.** The import's `ContactUsPage` and
   `BookDemoModal` both set `submitted = true` from a `catch` block.
3. **Static files under `public/`** are generated at build time here — copying the
   import's versions would shadow the generator's output.

### 4.1 Client routing (hand-rolled, no router library)

`src/App.tsx` is the router. There is **no** `react-router`. Every page, below-the-fold
home section and modal is loaded through `React.lazy` + `Suspense`, and modals mount
only while open. Routing works by:

- Reading `window.location.pathname` and `?page=` / `?subPage=` / `?industry=` query params in `useState` initialisers.
- A `popstate` listener that re-derives state on back/forward.
- Navigation handlers (`handleNavigate*`) that call `setCurrentView(...)` + `window.history.pushState(...)` + smooth scroll.

**Critical implication:** the path-matching logic is duplicated in two places — the `currentView` `useState` initialiser and the `handlePopState` callback. **Any new route must be added to both**, or deep links will break on back/forward navigation.

`currentView` union:

```
'home' | 'about' | 'contact-us' | 'ai-shopping-assistant' | 'ai-commerce-platform'
| 'why-choose-us' | 'shopify-comparison' | 'woocommerce-comparison' | 'retail-commerce'
| 'd2c-brands' | 'distributors' | 'wholesalers' | 'manufacturing' | 'fmcg-commerce' | 'fmcg'
```

Sub-page state is tracked separately: `aiShoppingSubPage`, `aiCommerceSubPage`, `d2cSubPage`, `manufacturingSubPage` (each `1 | 2 | 3`), plus `activeUseCaseSlug` (from `/use-cases/:slug`) and `activeIndustryId` (from `?industry=`).

Note: `path.startsWith('/industries/')` is the **last** industry branch and acts as a catch-all → any unmatched `/industries/*` URL renders the Manufacturing page.

### 4.2 Route map

| URL(s) | View / component |
|---|---|
| `/` | Home composition (Hero → Products → Integrations → Problems → HowItWorks → Industries → WhySilarAi → Metrics → UseCases → Pricing → FAQ → FinalCta) |
| `/about`, `?page=about` | `AboutPage` |
| `/contact-us`, `/contact`, `?page=contact-us` | `ContactUsPage` (mailto: handoff enquiry form) |
| `/why-choose-us` | `WhyChoosePage` |
| `/shopify-vs-silarai`, `/integrations/shopify` | `ShopifyComparisonPage` |
| `/woocommerce-vs-silarai`, `/integrations/woocommerce` | `WoocommerceComparisonPage` |
| `/ai-shopping-assistant`, `/ai-sales-assistant`, `?page=…&subPage=1..3` | `AiShoppingAssistantPages` |
| `/ai-commerce-platform`, `/ai-marketing-platform`, `/b2b-commerce-platform`, `/b2b2c-commerce-platform`, `/ai-product-discovery`, `/dealer-portal`, `/customer-portal` | `AiCommercePlatformPages` |
| `/industries/retailers`, `/retail-ai-platform`, `?page=retail-commerce` | `RetailIndustryPage` |
| `/industries/d2c-brands[/ai-shopping-assistant\|/ai-commerce-platform\|/increase-sales-with-ai]` | `D2cIndustryPage` (sub-page 1/2/3) |
| `/industries/distributors`, `?page=distributors` | `DistributorsIndustryPage` |
| `/industries/wholesalers`, `?page=wholesalers` | `WholesalersIndustryPage` |
| `/industries/manufacturing[/ai-commerce-platform\|/ai-shopping-sales-assistant\|/dealer-distributor-commerce]` and any other `/industries/*` | `ManufacturingIndustryPage` |
| `/fmcg`, `/fmcg-commerce`, `/industries/fmcg` | `FmcgIndustryPage` |
| `/use-cases/:slug` | Home with `UseCasesSection` deep-linked |

SPA fallback is handled by `staticwebapp.config.json` — `navigationFallback` rewrites unmatched paths to `/index.html`, with exclusions so static assets and knowledge files are served as themselves.

### 4.3 SEO layer (`src/components/SeoHead.tsx`, ~1400 lines)

A side-effect-only component. On every `currentView` / sub-page change it imperatively:

- sets `document.title`, description, keywords, robots, author, publisher
- sets GEO meta (`geo.region`, `geo.position`, ICBM — hardcoded San Francisco)
- sets OG + Twitter tags and the `<link rel="canonical">`
- injects per-view **JSON-LD** schema

Metadata lives in one big `getPageMetadata(...)` `switch` keyed by `currentView` (+ sub-page). Cases exist for: `contact-us`, `about`, `why-choose-us`, `shopify-comparison`, `woocommerce-comparison`, `ai-shopping-assistant`, `ai-commerce-marketing-platform`, `ai-commerce-platform`, `retail-commerce`, `d2c-brands`, `distributors`, `manufacturing`, `wholesalers`, `fmcg-commerce`/`fmcg`, `home`/`default`.

**Adding a view means adding a `case` here**, otherwise it silently falls through to the generic homepage metadata. (The FMCG page had exactly this defect until 2026-09-14.)

`SeoHead` also exports `useSubPageMetaDescription`, which picks a tested under-60-character description per sub-page from `SUBPAGE_CTR_VARIANTS` (3 CTR styles: `direct` / `metric` / `urgency`) and emits `subpage:*` diagnostic meta tags. Sub-page views use that instead of the case's long description.

Two companions:

- **`src/data/seoMetaTable.ts`** — the master table of 24 per-view/sub-page SEO records (title, description, canonical, keywords, CTR hook, schema type, rating), with `findSeoMetaEntry(view, subPage)` and 60-word / 60-char compliance warnings at module load.
- **`src/components/SectionSeoMetaSnippet.tsx`** — renders nothing visible; mounted inside `<main>` in `App.tsx`, it applies title/description/canonical/OG/Twitter and a per-view JSON-LD block from that table. **Because it sits below `SeoHead` in the tree its effect runs last, so `seoMetaTable` wins on title, description and canonical**; `SeoHead` still owns robots, geo, AI-crawler directives and the rich JSON-LD graph. Keep the two in agreement.

**`src/components/Breadcrumbs.tsx`** emits `BreadcrumbList` JSON-LD alongside the visible trail and is mounted at the top of all 12 sub-pages.

> ⚠️ **All of this runs in JavaScript, after load.** Crawlers that do not execute JS — GPTBot, ClaudeBot, PerplexityBot, Bing, LinkedIn, Slack, Facebook — see only the static `<head>` in `index.html`, which is the homepage's. Every route looks identical to them. Prerendering is the fix and is not yet implemented; see §11.

### 4.4 Build-time static generation (`scripts/generate-static-discovery.mts`)

Replaces the former Express server. Every endpoint that server exposed returned hardcoded constants, so they are now emitted as static files into `dist/` after `vite build`.

Generated output:

| File | Contents |
|---|---|
| `sitemap.xml` | 50 URLs, built from `SITE_ARCHITECTURE` + sub-pages + use cases + discovery files |
| `robots.txt` | Crawl directives incl. explicit allows for GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, etc. |
| `llms.txt`, `llms-full.txt` | GEO knowledge documents (also mirrored under `/.well-known/`) |
| `ai-manifest.json` | AI agent discovery manifest |
| `.well-known/ai-plugin.json`, `.well-known/openapi.json` | Plugin + OpenAPI-style descriptors |
| `ai/discovery.json` | Master index of every knowledge surface |
| `ai/site-architecture.json` | Pillars, industries, integrations, keyword clusters |
| `ai/geo-knowledge.json` | Keyword taxonomy + GEO definition blocks + D2C graph |
| `ai/d2c-knowledge-graph.json` | Knowledge graph nodes/relationships + ASCII rendering |
| `ai/rag-chunks.json` | Retrieval chunks + semantic backlinks + citation guidance |
| `ai/aeo-faq.json` | Answer-engine Q&A pairs |
| `ai/semantic-backlinks.json` | Authoritative backlink graph |
| `ai/geo-citations.json` | Markdown / APA / MLA / BibTeX citation formats |

The old `/api/rag/search?q=` filtering is gone. Chunks are served complete and filtered client-side (`AiDiscoveryModal` already does this over the imported constants). This is not a functional loss: the old endpoint returned the entire corpus whenever a query missed, and AI crawlers fetch without a query anyway.

**Source of truth:** `src/data/siteArchitecture.ts` (extracted from the deleted `server.ts`) holds `PRIMARY_PILLAR_KEYWORDS`, `KEYWORD_CLUSTERS`, `GEO_DEFINITION_ANSWER_BLOCKS` and `SITE_ARCHITECTURE`. Adding a pillar or industry there automatically flows into the sitemap, `llms.txt` and the JSON files.

### 4.5 Knowledge data modules

- `src/server/ragDiscoveryEngine.ts` — `RAG_KNOWLEDGE_CHUNKS`, `AEO_AIO_KNOWLEDGE_QA`, `OPENAPI_SPECIFICATION`, `AI_PLUGIN_MANIFEST`, `AUTHORITATIVE_BACKLINKS`.
- `src/server/knowledgeGraph.ts` — `D2C_KNOWLEDGE_GRAPH` + ASCII rendering.
- `src/data/authoritativeBacklinks.ts` — ~1000 lines of backlink entries plus `getBacklinksByCount(n)` and `getDistributorBacklinks()`.

These are imported both by the build script (to emit JSON) and by React components (`AiDiscoveryModal`, `DistributorsBacklinkHub`) — so the same data ships in the JS bundle and as static files.

### 4.6 WordPress integration — DORMANT

`src/lib/wordpress.ts` and `src/lib/WordPressIntegrationManager.ts` are retained but **inactive**. They call `/api/wordpress/*` proxy routes that no longer exist, and no component imports them. Both files carry a header comment saying so.

To re-enable, either enable CORS on the WordPress host and call `wp-json` directly, or reintroduce a proxy (Azure Function, or the existing .NET backend).

### 4.7 Demo request flow

`BookDemoModal` and `ContactUsPage` build a pre-filled `mailto:` URL with `buildMailtoUrl()` from `src/config/forms.ts` and open the visitor's own mail client. **Nothing is delivered until the visitor presses Send in their mail app** — there is no server, no form service, and no API key.

- `src/config/forms.ts` is the single source of truth for `CONTACT_EMAIL`, `CONTACT_PHONE`, `CONTACT_LEGAL_NAME` and `CONTACT_ADDRESS`. Change the destination inbox there and both forms follow.
- Confirmation copy says "press Send", never "sent" — the visitor has not sent anything yet at that point. Keep it that way.
- Both forms show the address as copyable text with a Copy button, because visitors on webmail-only or locked-down devices have no mail client registered and will see nothing happen.
- `buildMailtoUrl()` trims trailing body lines to stay under ~1800 characters, since some clients truncate a long `mailto:` silently.
- **There is no server-side record of an enquiry.** The reply in the inbox is the only record, and there is no way to measure form abandonment.
- Spam handling is not applicable — no endpoint to abuse. The honeypot fields were removed along with the POST.
- If the key is missing or the request fails, the modal now shows an **error state** and does not claim success. (The previous implementation set `submitted = true` in a `finally` block, so users saw "Demo Request Dispatched!" even when the POST failed.)
- Free tier is 250 submissions/month.

---

## 5. Design System

Defined CSS-first in `src/index.css` with Tailwind v4 `@theme`:

| Token family | Anchor value |
|---|---|
| `plum` 50–950 | primary `--color-plum-700: #584053` |
| `teal` 50–950 | primary `--color-teal-400: #8DC6BF` |
| `peach` 50–700 | `--color-peach-300: #FCB666` (warm sand / apricot gold) |
| `coral` 50–700 | accent `--color-coral-400: #F97B4F` |
| Font | `--font-sans: 'Plus Jakarta Sans', system-ui, …` |

Base layer sets smooth scroll, body colour `#221820` on `#faf9f8`, and a custom `::selection`. `index.html` also declares `theme-color: #2b0f38` (a legacy plum that does not match the current token set).

Styling is Tailwind utility classes inline in components — no CSS modules, no styled-components, no component library.

---

## 6. Key Components

### Shell & navigation
- **`Navbar.tsx`** (863 lines) — sticky mega-menu; receives ~14 navigation callbacks from `App`. All navigation is prop-drilled callbacks, not context.
- **`Footer.tsx`** — mirrors the Navbar's link surface (same callback prop set).
- **`SilarAiBrandLogo.tsx`** — brand mark used by Navbar and Footer.

### Home sections (in render order)
`HeroSection` (motion animations) → `ProductsSection` → `TrustedIntegrations` → `ProblemsSection` → `HowItWorks` → `IndustriesSection` → `WhySilarAi` → `CustomerMetrics` → `UseCasesSection` → `PricingSection` → `FaqSection` → `FinalCta`.

### Full pages
`AboutPage`, `WhyChoosePage`, `ShopifyComparisonPage`, `WoocommerceComparisonPage`, `AiShoppingAssistantPages` (3 sub-pages), `AiCommercePlatformPages` (3 sub-pages), and six industry pages (`RetailIndustryPage`, `D2cIndustryPage`, `DistributorsIndustryPage`, `WholesalersIndustryPage`, `ManufacturingIndustryPage`, `FmcgIndustryPage`). Industry pages are the largest files in the repo (1000–1950 lines each) and are largely self-contained copy + layout.

### Interactive
- **`BookDemoModal`** — the main conversion flow. See §4.7.
- **`ProductTourModal`** — static tour walkthrough.
- **`AiDiscoveryModal`** — developer/AI-crawler facing panel listing the static discovery files under `/ai/`, `/llms.txt` and `/.well-known/`. Filters RAG chunks client-side over the imported constants.
- **`RoiCalculator`** (inside `PricingSection`) — recharts area/bar/line chart; inputs traffic, AOV, conversion rate, conversion uplift, AOV boost, timeframe, presets; all derived values via `useMemo`.
- **`FloatingAiAssistantWidget`** — **demo only**. Canned keyword-matched replies on a `setTimeout`; no backend, no LLM call.
- **`DistributorsBacklinkHub`** — renders the backlink corpus inside `DistributorsIndustryPage`.

### Unused / dead code
`DashboardSection.tsx` and `LogoConceptsModal.tsx` are not imported anywhere.

---

## 7. Content & Data Model

All marketing content is centralised in **`src/data/content.ts`** (~1378 lines), typed by `src/types.ts`:

| Export | Type | Purpose |
|---|---|---|
| `INTEGRATIONS` | `IntegrationTool[]` | Shopify, Wix, BigCommerce, Adobe Commerce, WooCommerce, Squarespace, Big Cartel, Square Online, Shift4Shop, Volusion, OpenCart |
| `PROBLEM_CARDS` | `ProblemCard[]` | Pain-point → SilarAI advantage pairs |
| `PRODUCTS` | `ProductDetail[]` | The two core products |
| `HOW_IT_WORKS_STEPS` | `HowItWorksStep[]` | Onboarding timeline |
| `DASHBOARD_FEATURES`, `AI_STUDIO_PRESETS`, `AI_STUDIO_CHECKLIST` | — | Product feature data |
| `INDUSTRIES` | `IndustrySolution[]` | Vertical solution cards |
| `COMPARISON_ROWS` | `ComparisonRow[]` | Traditional vs SilarAI table |
| `KPI_METRICS`, `TESTIMONIALS` | — | Social proof |
| `FAQ_ITEMS` | `FaqAccordionItem[]` | Categories: General / Integration / B2B & Catalog / Setup |
| `PRODUCTS_PRICING` | `ProductPricingData[]` | Two products × Starter / Growth / Enterprise |
| `PRICING_PLANS` | alias | `PRODUCTS_PRICING[0].plans` (shopping-assistant plans) |
| `USE_CASES` | `UseCaseItem[]` | Slugs: `sales-assistant`, `lead-generation`, `conversion-engine`, `engagement-ai`, `product-discovery`, `b2b-commerce` |
| `WHY_SILARAI_BENEFITS` | — | Bullet list |

**Rule:** copy changes belong in `content.ts`, not inline in components — except the industry/pillar pages, which currently hold their own copy inline. Architecture/keyword data belongs in `src/data/siteArchitecture.ts`.

---

## 8. Environment Variables

All are **build-time** — Vite inlines `VITE_*` into the bundle. There is no runtime configuration.

| Variable | Used by | Notes |
|---|---|---|
| *(none for forms)* | — | Enquiry forms hand off to the visitor's mail client; no key or endpoint to configure. |
| `SITE_URL` | `scripts/generate-static-discovery.mts` | Canonical origin for generated sitemap/llms/JSON. Defaults to `https://silarai.com` |
| `VITE_WORDPRESS_URL` | dormant | See §4.6 |
| `DISABLE_HMR` | `vite.config.ts` | `'true'` disables HMR and file watching |

---

## 9. Deployment — Azure Static Web Apps

Build: `npm run build` → output `dist/`.

`public/staticwebapp.config.json` is copied into `dist/` by Vite and configures:

- **`navigationFallback`** → `/index.html`, excluding `/assets/*`, `/ai/*`, `/.well-known/*`, and `*.txt` / `*.xml` / `*.json` / image / font / css / js extensions. **Without those exclusions `llms.txt` and `sitemap.xml` would return HTML.**
- **`mimeTypes`** for `.txt`, `.xml`, `.json`
- **`globalHeaders`** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS
- **`routes`** — immutable caching for `/assets/*`, 1-hour caching and `Access-Control-Allow-Origin: *` for the AI knowledge files (so crawlers and agents can fetch them cross-origin), no-cache for `index.html`
- **`responseOverrides.404`** → rewrite to `/index.html` with status 200

The former 301 redirects for legacy WordPress paths (`/blog*`, `/wp-content*`, `/wp-admin*`, `/wp-login.php`, `/feed*` → `blog.silarai.com`) were **removed on 2026-09-04** — the WordPress blog was retired rather than migrated. See `DEPLOYMENT.md`'s status note for the full picture.

### Domain layout

DNS now lives in **Cloudflare** (moved off Hostinger's zone editor; Hostinger still hosts mailboxes). Verified live 2026-09-04 via direct DNS queries and HTTP fetches:

| Hostname | Serves | Status |
|---|---|---|
| `silarai.com` | This site (Azure SWA `black-mushroom`), via `CNAME @` (Cloudflare flattens the apex) | ✅ live, confirmed serving correct content |
| `www.silarai.com` | Should redirect to apex | ❌ NXDOMAIN — no CNAME record exists yet |
| `app.silarai.com` | Separate, pre-existing Azure SWA (`lemon-sea`) — the product dashboard, not this site | ✅ live |
| `stage.silarai.com` | Documented as a separate Azure SWA | not present in the current Cloudflare zone — unverified |
| Email (`info@silarai.com`) | Hostinger (DKIM CNAMEs for `hostingermail-a/b/c` are in the zone) | ❌ **no MX record** — mail to `@silarai.com` cannot be delivered. Enquiries are unaffected: forms route to `psitraders@outlook.com`. |
| `blog.silarai.com` | Retired — no longer part of this deployment | DNS still resolves to the old Hostinger IP (`94.136.187.227`) but serves an empty page; safe to delete the record |

### Deployment checklist

1. The live workflow is `.github/workflows/azure-static-web-apps-black-mushroom-050c17800.yml` (`app_location: ./landing_website`, `output_location: dist`) — the "black-mushroom" Azure Static Web App is what serves `silarai.com`.
2. **No secrets are needed for forms.** Enquiry forms hand off to the visitor's mail client, so there is no key to configure. `SITE_URL` is hardcoded to `https://silarai.com` in the workflow's `env:` block; change it there if the canonical origin ever moves. (Vite inlines `VITE_*` **at build time** inside Oryx, so anything of that shape must be set in the workflow, not as an Azure Portal application setting.)
3. To change the enquiry destination inbox, edit `CONTACT_EMAIL` in `src/config/forms.ts` — it is the single source of truth for both forms and the contact block.
4. `landing_website/bun.lock` and `landing_website/package-lock.json` are both committed — only `package-lock.json` reflects the npm scripts CI actually runs; the stray `bun.lock` is a candidate for removal (not yet done, flagged 2026-09-04).

**Full step-by-step procedure, including the DNS cutover and the WordPress move: see `DEPLOYMENT.md`.**

---

## 10. Conventions

- Named exports for components (`export const Foo: React.FC<FooProps>`); `App` is the only default export component.
- Props are explicit interfaces named `<Component>Props`, declared directly above the component.
- Navigation and modal control are **prop-drilled callbacks** from `App` — no Context, Redux, or state library.
- Local state only: `useState` / `useMemo` / `useEffect`. No data-fetching library.
- Path alias `@/*` → project root (configured in both `vite.config.ts` and `tsconfig.json`); components mostly use relative imports.
- Tailwind utilities inline; design tokens via `@theme` custom colours (`plum`, `teal`, `peach`, `coral`).
- Anything that must be crawlable belongs in the build-time generator, not in a component.

---

## 11. Known Gaps / Follow-ups

Ordered by impact.

1. **No MX record for `silarai.com` (live, 2026-09-04).** `info@silarai.com` cannot receive mail. **Enquiries are no longer affected** — forms now route to `psitraders@outlook.com`, an Outlook mailbox on a different domain. Still worth fixing so `@silarai.com` addresses work at all; needs an MX record in Cloudflare pointing at whatever host serves that mailbox (the `hostingermail-a/b/c` DKIM CNAMEs suggest Hostinger Email). See `DEPLOYMENT.md` status note.
2. **`www.silarai.com` does not resolve (live, 2026-09-04).** NXDOMAIN. Needs a `CNAME www` → the SWA hostname in Cloudflare, set to redirect to the apex.
3. **No prerendering.** All per-page metadata and JSON-LD is applied by JS after load, so non-JS crawlers (GPTBot, ClaudeBot, PerplexityBot, Bing, LinkedIn, Slack) see homepage metadata on all ~50 routes. This undercuts the entire GEO/AEO strategy. Deliberately deferred to a separate change; it touches the router and build pipeline.
4. **Two pages from `imported_landing_website/` are not merged yet** — `HeroSection` (adds two image tabs plus a lightbox; needs `shopping_assistant_ui_1788795889801.jpg` and `commerce_cloud_platform_1788795904634.jpg` copied into `src/assets/images/`) and `AiCommerceMarketingPlatformPage` (new ~1,000-line pillar page; `SeoHead` already carries its metadata case, but no route is wired).
5. **`index.html` still lists `info@silarai.com`** in its static Organization JSON-LD, while `config/forms.ts`, `SeoHead` and both forms now use `psitraders@outlook.com`. Since `info@` has no MX record (gap 1), the static block is advertising an address that cannot receive mail — worth aligning.
6. **Route logic duplicated** in `App.tsx` (`useState` initialiser vs `handlePopState`) — easy source of deep-link bugs.
6. **`mailto:` handoff has inherent leakage.** A visitor with no mail client registered (webmail-only, managed device, some mobile browsers) sees nothing happen; the copyable fallback mitigates but does not eliminate this. There is also no record of enquiries that were composed but never sent, and no way to measure that drop-off. If lead volume matters more than avoiding a third party, a hosted form service is the fix.
7. **No form validation beyond `required` on name/email.** Not a spam risk any more (no endpoint), but malformed input still reaches the mail body verbatim.
8. **`FloatingAiAssistantWidget` is a mock** — hardcoded replies, no LLM backend. It presents as a live product demo.
9. **WordPress integration dormant** (§4.6) — ~620 lines retained but non-functional, and now more likely to stay that way since the blog itself was retired rather than fixed.
10. **Dead components**: `DashboardSection.tsx`, `LogoConceptsModal.tsx`.
11. **Bundle size** — was 1.72 MB (428 KB gzipped) in a single chunk. `App.tsx` now `React.lazy`-loads every page, below-the-fold home section and modal, so this should be substantially split; re-measure on the next build and update this line.
12. **`src/server/` is a misleading directory name** — it contains build-time data only.
13. **No tests, no ESLint**; `npm run lint` is a type-check only.
14. **Knowledge data ships twice** — once in the JS bundle (imported by `AiDiscoveryModal` / `DistributorsBacklinkHub`) and once as static JSON. Fetching the JSON at runtime instead would cut bundle size.
