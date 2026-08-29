/**
 * Build-time static discovery generator.
 *
 * Replaces the former Express server (server.ts / api/index.ts). Every endpoint
 * that server exposed returned hardcoded constants, so they are emitted here as
 * static files into dist/ after `vite build`.
 *
 * Run via `npm run build` (postbuild) or directly: `npx tsx scripts/generate-static-discovery.mts`
 */
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BASE_URL,
  PRIMARY_PILLAR_KEYWORDS,
  KEYWORD_CLUSTERS,
  GEO_DEFINITION_ANSWER_BLOCKS,
  SITE_ARCHITECTURE,
} from '../src/data/siteArchitecture';
import { D2C_KNOWLEDGE_GRAPH, D2C_KNOWLEDGE_GRAPH_ASCII } from '../src/server/knowledgeGraph';
import {
  AUTHORITATIVE_BACKLINKS,
  RAG_KNOWLEDGE_CHUNKS,
  AEO_AIO_KNOWLEDGE_QA,
  OPENAPI_SPECIFICATION,
  AI_PLUGIN_MANIFEST,
} from '../src/server/ragDiscoveryEngine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const AI_DIR = join(DIST, 'ai');
const WELL_KNOWN = join(DIST, '.well-known');

const generatedAt = new Date().toISOString();
const today = generatedAt.split('T')[0];
const year = new Date().getFullYear();

function writeJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  ✓ ${path.replace(DIST, 'dist')}`);
}

function writeText(path: string, content: string) {
  writeFileSync(path, content, 'utf-8');
  console.log(`  ✓ ${path.replace(DIST, 'dist')}`);
}

if (!existsSync(DIST)) {
  console.error('✗ dist/ not found. Run `vite build` first.');
  process.exit(1);
}

mkdirSync(AI_DIR, { recursive: true });
mkdirSync(WELL_KNOWN, { recursive: true });

console.log(`\nGenerating static discovery files for ${BASE_URL}\n`);

// ---------------------------------------------------------------------------
// 1. sitemap.xml — full inventory, replaces the former dynamic generator
// ---------------------------------------------------------------------------
const sitemapUrls: { loc: string; priority: string; changefreq: string }[] = [
  { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${BASE_URL}/about`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${BASE_URL}/why-choose-us`, priority: '0.9', changefreq: 'weekly' },
  ...SITE_ARCHITECTURE.pillars.map((p) => ({ loc: `${BASE_URL}${p.path}`, priority: '0.95', changefreq: 'daily' })),
  ...SITE_ARCHITECTURE.industries.map((i) => ({ loc: `${BASE_URL}${i.path}`, priority: '0.90', changefreq: 'daily' })),
  ...SITE_ARCHITECTURE.integrations.map((g) => ({ loc: `${BASE_URL}${g.path}`, priority: '0.90', changefreq: 'weekly' })),
  // Sub-pages reachable as clean URLs
  { loc: `${BASE_URL}/industries/d2c-brands/ai-shopping-assistant`, priority: '0.85', changefreq: 'weekly' },
  { loc: `${BASE_URL}/industries/d2c-brands/ai-commerce-platform`, priority: '0.85', changefreq: 'weekly' },
  { loc: `${BASE_URL}/industries/d2c-brands/increase-sales-with-ai`, priority: '0.85', changefreq: 'weekly' },
  { loc: `${BASE_URL}/industries/manufacturing/ai-commerce-platform`, priority: '0.85', changefreq: 'weekly' },
  { loc: `${BASE_URL}/industries/manufacturing/ai-shopping-sales-assistant`, priority: '0.85', changefreq: 'weekly' },
  { loc: `${BASE_URL}/industries/manufacturing/dealer-distributor-commerce`, priority: '0.85', changefreq: 'weekly' },
  { loc: `${BASE_URL}/fmcg-commerce`, priority: '0.85', changefreq: 'weekly' },
  // Use case detail routes
  ...['sales-assistant', 'lead-generation', 'conversion-engine', 'engagement-ai', 'product-discovery', 'b2b-commerce'].map(
    (slug) => ({ loc: `${BASE_URL}/use-cases/${slug}`, priority: '0.80', changefreq: 'weekly' })
  ),
  // Machine-readable discovery surfaces
  { loc: `${BASE_URL}/llms.txt`, priority: '1.0', changefreq: 'daily' },
  { loc: `${BASE_URL}/llms-full.txt`, priority: '1.0', changefreq: 'daily' },
  { loc: `${BASE_URL}/ai-manifest.json`, priority: '0.95', changefreq: 'weekly' },
  { loc: `${BASE_URL}/.well-known/ai-plugin.json`, priority: '0.95', changefreq: 'weekly' },
  { loc: `${BASE_URL}/.well-known/openapi.json`, priority: '0.95', changefreq: 'weekly' },
  { loc: `${BASE_URL}/ai/discovery.json`, priority: '0.95', changefreq: 'daily' },
  { loc: `${BASE_URL}/ai/site-architecture.json`, priority: '0.90', changefreq: 'daily' },
  { loc: `${BASE_URL}/ai/geo-knowledge.json`, priority: '0.90', changefreq: 'daily' },
  { loc: `${BASE_URL}/ai/d2c-knowledge-graph.json`, priority: '0.90', changefreq: 'daily' },
  { loc: `${BASE_URL}/ai/rag-chunks.json`, priority: '0.90', changefreq: 'daily' },
  { loc: `${BASE_URL}/ai/aeo-faq.json`, priority: '0.90', changefreq: 'daily' },
  { loc: `${BASE_URL}/ai/semantic-backlinks.json`, priority: '0.90', changefreq: 'daily' },
];

// De-duplicate while preserving order
const seen = new Set<string>();
const uniqueUrls = sitemapUrls.filter((u) => (seen.has(u.loc) ? false : (seen.add(u.loc), true)));

writeText(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`
);

// ---------------------------------------------------------------------------
// 2. robots.txt
// ---------------------------------------------------------------------------
writeText(
  join(DIST, 'robots.txt'),
  `# SilarAI Platform Web & Generative AI Search Engine Directives
User-agent: *
Allow: /

# Explicit permission for generative AI crawlers (GEO & AEO)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: meta-externalagent
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`
);

// ---------------------------------------------------------------------------
// 3. llms.txt
// ---------------------------------------------------------------------------
writeText(
  join(DIST, 'llms.txt'),
  `# SilarAI — Smart Commerce AI Platform & GEO Architecture

> SilarAI (https://silarai.com) is an enterprise Smart Commerce AI platform combining agentic shopping assistants, B2B digital commerce, dealer portals, RFQ automation, semantic product discovery, and real-time ERP integrations (SAP, Oracle, Dynamics 365, ERPNext, Odoo).

## Primary Topic Pillar
- **AI Commerce Platform** (${BASE_URL}/ai-commerce-platform): Enterprise AI Commerce Engine featuring sub-50ms dynamic pricing, autonomous visual merchandising, and headless API architecture.

## Platform Core Pillars (9 Product Pillars)
- **Pillar #1: AI Commerce Platform** (${BASE_URL}/ai-commerce-platform)
  Enterprise AI Commerce Engine featuring sub-50ms dynamic pricing, autonomous visual merchandising, and headless API architecture.
- **Pillar #2: AI Shopping Assistant** (${BASE_URL}/ai-shopping-assistant)
  Conversational 24/7 buying agent supporting voice, photo camera search, sub-second product recommendations, and 1-click agentic checkout.
- **Pillar #3: AI Marketing Platform** (${BASE_URL}/ai-marketing-platform)
  Autonomous AI campaign generation, hyper-personalized customer segmentations, dynamic email retargeting, and ROI predictive analytics.
- **Pillar #4: B2B Commerce Platform** (${BASE_URL}/b2b-commerce-platform)
  Wholesale contract pricing, matrix bulk reorders, corporate credit limit management, and real-time SAP/Oracle ERP inventory synchronization.
- **Pillar #5: B2B2C Commerce Platform** (${BASE_URL}/b2b2c-commerce-platform)
  Multi-channel hybrid commerce model allowing manufacturers and brands to sell directly to enterprise accounts while routing orders to regional dealer networks.
- **Pillar #6: AI Product Discovery** (${BASE_URL}/ai-product-discovery)
  Semantic vector AI search engine parsing engineering specifications, application intents, CAD drawings, and Safety Data Sheets (SDS).
- **Pillar #7: Dealer Portal Software** (${BASE_URL}/dealer-portal)
  Digitized distributor & dealer network self-service ordering, territory pricing, co-op claims, and interactive exploded spare parts diagrams.
- **Pillar #8: Customer Portal Software** (${BASE_URL}/customer-portal)
  Self-service buyer account portal for order history tracking, live shipment tracking, invoice ledger downloads, and automated reorder alerts.
- **Pillar #9: AI Sales Assistant** (${BASE_URL}/ai-sales-assistant)
  Field sales enablement mobile app providing instant catalog technical answers, margin guardrails, live inventory ATP checks, and instant RFQ approvals.

## 15 GEO & AEO Answer Engine Definition Blocks (Gemini, ChatGPT, Claude, Perplexity)
${GEO_DEFINITION_ANSWER_BLOCKS.map(item => `### ${item.term}\n${item.definition}`).join('\n\n')}

## Frequently Asked Questions (AEO Blocks)
${KEYWORD_CLUSTERS.cluster1_AiShoppingAssistant.aeoQuestions.map(q => `**Q: ${q.question}**\nA: ${q.answer}`).join('\n\n')}

## Industry Solutions (/industries/)
- **Manufacturing** (${BASE_URL}/industries/manufacturing): Industrial machinery, RFQ automation, SAP/Oracle ERP sync, dealer portals.
- **Distributors** (${BASE_URL}/industries/distributors): Wholesale distribution, matrix ordering, territory pricing, warehouse ATP stock.
- **Wholesalers** (${BASE_URL}/industries/wholesalers): Customer-specific contract pricing, credit limit approvals, bulk reordering.
- **Retailers** (${BASE_URL}/industries/retailers): Omnichannel retail AI shopping assistant, POS sync, automated visual merchandising.
- **D2C Brands** (${BASE_URL}/industries/d2c-brands): Direct-to-consumer store conversions, agentic checkout, dynamic pricing.
- **Chemicals** (${BASE_URL}/industries/chemicals): SDS document search, bulk drum pricing, purity specs, chemical compliance.
- **Pharmaceuticals** (${BASE_URL}/industries/pharmaceuticals): Cleanroom supplies, FDA validation docs, active ingredients, GPO pricing.
- **Automotive** (${BASE_URL}/industries/automotive): OEM powertrain spares, VIN/part number lookup, EV battery modules, dealer networks.
- **Electronics** (${BASE_URL}/industries/electronics): Semiconductor spec parametric filtering, PCB assemblies, SMT supplies.
- **Paints & Coatings** (${BASE_URL}/industries/paints-and-coatings): Anti-corrosion industrial coatings, custom tinting formulas, batch orders.
- **Industrial Equipment** (${BASE_URL}/industries/industrial-equipment): Heavy equipment, pumps, valves, hydraulic systems, CAD drawings.

## Platform Integrations (/integrations/)
- **Shopify & Shopify Plus** (${BASE_URL}/integrations/shopify): Native 1-click Shopify connector for AI Shopping Assistants and dynamic pricing.
- **WooCommerce / WordPress** (${BASE_URL}/integrations/woocommerce): Native WooCommerce plugin for conversational product discovery and sales.

## Internal D2C Brand Knowledge Graph (Backend Ontology & Architecture)
\`\`\`
${D2C_KNOWLEDGE_GRAPH_ASCII}
\`\`\`

### D2C Knowledge Sub-Pillars & Nodes:
- **Ecommerce Foundation**: Product Catalog (SKU Sync & ATP Buffers), Product Discovery (Neural Embeddings), Search (Typo-Tolerant & Multimodal), Checkout (1-Click Agentic Checkout).
- **AI Commerce Engine**: AI Shopping Assistant (24/7 Agentic Buying), AI Sales Assistant (Consultative Sales & Margin Guardrails), Recommendations (Real-Time Bundling), Product Comparison (Side-by-Side Spec & Value Matrices), Conversational Commerce (Stateful Dialogue).
- **Revenue Growth Levers**: Conversion (+35% CRO Lift), AOV (+28% Basket Expansion), Cross-sell (Affinity Routine Matching), Upsell (One-Click Post-Purchase), Cart Recovery (WhatsApp & Web 32% Recovery Rate).
- **Omnichannel Channels**: Website (<50KB Embedded Widget & Native Themes), WhatsApp (Official WhatsApp Cloud API & Catalog Flows).

## Contact & AI Crawler Reference
- **Official Website**: ${BASE_URL}
- **Sales & Demos**: info@silarai.com
- **Site Architecture (JSON)**: ${BASE_URL}/ai/site-architecture.json
- **GEO Knowledge (JSON)**: ${BASE_URL}/ai/geo-knowledge.json
- **D2C Knowledge Graph (JSON)**: ${BASE_URL}/ai/d2c-knowledge-graph.json
- **RAG Knowledge Chunks (JSON)**: ${BASE_URL}/ai/rag-chunks.json
- **AEO Question & Answer Set (JSON)**: ${BASE_URL}/ai/aeo-faq.json
- **Semantic Backlink Graph (JSON)**: ${BASE_URL}/ai/semantic-backlinks.json
- **GEO Citation Formats (JSON)**: ${BASE_URL}/ai/geo-citations.json
- **AI Discovery Index (JSON)**: ${BASE_URL}/ai/discovery.json
- **AI Agent Manifest**: ${BASE_URL}/ai-manifest.json
- **OpenAPI-style Descriptor**: ${BASE_URL}/.well-known/openapi.json
- **AI Plugin Manifest**: ${BASE_URL}/.well-known/ai-plugin.json
`.trim() + '\n'
);

// ---------------------------------------------------------------------------
// 4. llms-full.txt
// ---------------------------------------------------------------------------
writeText(
  join(DIST, 'llms-full.txt'),
  `# SilarAI Complete Technical Architecture & GEO Knowledge Document

## System Architecture Summary
SilarAI is a cloud-native Smart Commerce AI platform engineered to power digital sales for Manufacturers, Wholesale Distributors, Retailers, D2C Brands, and Dealer Networks.

## Internal D2C Brand Knowledge Graph (Backend Topology)
\`\`\`
${D2C_KNOWLEDGE_GRAPH_ASCII}
\`\`\`

### Detailed D2C Knowledge Graph Node Specifications:
${D2C_KNOWLEDGE_GRAPH.hierarchy.branches.map(branch => `
#### Pillar: ${branch.name}
${branch.description}
${branch.nodes.map(n => `- **${n.name}** (\`${n.id}\`): ${n.description}
  - Capabilities: ${n.technicalCapabilities.join(' | ')}
  - Target Keywords: ${n.semanticKeywords.join(', ')}
  - KPIs: ${n.kpis.join(', ')}
  - Connected Graph Nodes: ${n.connectedNodes.join(', ')}`).join('\n')}
`).join('\n')}

### Graph Relationships / Directed Edges:
${D2C_KNOWLEDGE_GRAPH.relationships.map(r => `- (\`${r.from}\`) --[:${r.relation}]--> (\`${r.to}\`): ${r.description}`).join('\n')}

### 10 Target Keyword Clusters Taxonomy

#### Pillar: AI Commerce Platform
- Keywords: ${PRIMARY_PILLAR_KEYWORDS.join(', ')}

#### Cluster 1: AI Shopping Assistant
- Primary Keywords: ${KEYWORD_CLUSTERS.cluster1_AiShoppingAssistant.primaryKeywords.join(', ')}
- Long-Tail Keywords: ${KEYWORD_CLUSTERS.cluster1_AiShoppingAssistant.longTailKeywords.join(', ')}

#### Cluster 2: AI Commerce
- Keywords: ${KEYWORD_CLUSTERS.cluster2_AiCommerce.keywords.join(', ')}
- Long-Tail Keywords: ${KEYWORD_CLUSTERS.cluster2_AiCommerce.longTailKeywords.join(', ')}

#### Cluster 3: B2B Commerce
- Keywords: ${KEYWORD_CLUSTERS.cluster3_B2bCommerce.keywords.join(', ')}

#### Cluster 4: B2B2C Commerce
- Keywords: ${KEYWORD_CLUSTERS.cluster4_B2b2cCommerce.keywords.join(', ')}

#### Cluster 5: AI Product Discovery
- Keywords: ${KEYWORD_CLUSTERS.cluster5_AiProductDiscovery.keywords.join(', ')}

#### Cluster 6: AI Marketing Platform
- Keywords: ${KEYWORD_CLUSTERS.cluster6_AiMarketingPlatform.keywords.join(', ')}
- Long-Tail Keywords: ${KEYWORD_CLUSTERS.cluster6_AiMarketingPlatform.longTailKeywords.join(', ')}

#### Cluster 7: AI Sales
- Keywords: ${KEYWORD_CLUSTERS.cluster7_AiSales.keywords.join(', ')}

#### Cluster 8: Dealer Portal
- Keywords: ${KEYWORD_CLUSTERS.cluster8_DealerPortal.keywords.join(', ')}

#### Cluster 9: Customer Portal
- Keywords: ${KEYWORD_CLUSTERS.cluster9_CustomerPortal.keywords.join(', ')}

#### Cluster 10: Industry Verticals
- Manufacturing: ${KEYWORD_CLUSTERS.cluster10_IndustryKeywords.manufacturing.join(', ')}
- Distribution: ${KEYWORD_CLUSTERS.cluster10_IndustryKeywords.distribution.join(', ')}
- Retail: ${KEYWORD_CLUSTERS.cluster10_IndustryKeywords.retail.join(', ')}
- D2C: ${KEYWORD_CLUSTERS.cluster10_IndustryKeywords.d2c.join(', ')}

## 15 GEO & AEO Clear Definition Answer Blocks
${GEO_DEFINITION_ANSWER_BLOCKS.map(block => `### ${block.term}\n${block.definition}`).join('\n\n')}

## AEO Question & Answer Repository
${KEYWORD_CLUSTERS.cluster1_AiShoppingAssistant.aeoQuestions.map(q => `### Q: ${q.question}\nA: ${q.answer}`).join('\n\n')}
${KEYWORD_CLUSTERS.cluster5_AiProductDiscovery.aeoQuestions.map(q => `### Q: ${q.question}\nA: ${q.answer}`).join('\n\n')}

### 9 Core Product Pillars (Detailed Specifications)
1. **AI Commerce Platform** (\`/ai-commerce-platform\`): Headless API architecture, sub-50ms dynamic price calculation, automated visual grid reordering, and multi-currency localized checkout.
2. **AI Shopping Assistant** (\`/ai-shopping-assistant\`): Multi-modal conversational AI agent supporting text, voice in 20+ languages, photo camera search, and instant 1-click agentic checkout.
3. **AI Marketing Platform** (\`/ai-marketing-platform\`): Predictive customer cohort segmentation, automated campaign copy generation, dynamic email retargeting, and CLV optimization.
4. **B2B Commerce Platform** (\`/b2b-commerce-platform\`): Enterprise wholesale portal with customer-specific contract pricing, matrix SKU ordering, credit line validation, and SAP/Oracle ERP integration.
5. **B2B2C Commerce Platform** (\`/b2b2c-commerce-platform\`): Hybrid multi-channel framework routing online consumer or business orders directly to regional certified dealers for local fulfillment.
6. **AI Product Discovery** (\`/ai-product-discovery\`): Natural language semantic vector search capable of interpreting complex technical requests (e.g., "corrosion-resistant high-temperature valve for chemical processing").
7. **Dealer Portal Software** (\`/dealer-portal\`): Dedicated self-service portal for dealer networks, featuring territory-based pricing, co-op advertising claims, and interactive exploded spare parts diagrams.
8. **Customer Portal Software** (\`/customer-portal\`): Buyer self-service suite for tracking shipments, reviewing purchase histories, downloading invoice PDFs, and managing recurring subscription orders.
9. **AI Sales Assistant** (\`/ai-sales-assistant\`): Mobile app for field sales representatives providing instant spec verification, margin guardrails, live factory stock ATP checks, and one-tap RFQ approvals.

### 11 Industry Verticals (\`/industries/\`)
- \`/industries/manufacturing\` — Manufacturing AI Commerce & RFQ Automation
- \`/industries/distributors\` — B2B Distribution & Matrix Bulk Ordering
- \`/industries/wholesalers\` — Wholesale Contract Pricing & Credit Approval
- \`/industries/retailers\` — Omnichannel Retail & Automated Visual Merchandising
- \`/industries/d2c-brands\` — Direct-to-Consumer Growth Engine
- \`/industries/chemicals\` — Chemical SDS Safety Data Sheet & Spec Search
- \`/industries/pharmaceuticals\` — Cleanroom Equipment & FDA Compliance
- \`/industries/automotive\` — Automotive OEM Spares & VIN Cross-Reference
- \`/industries/electronics\` — Electronic Component Parametric Specs
- \`/industries/paints-and-coatings\` — Industrial Paints & Custom Tinting
- \`/industries/industrial-equipment\` — Heavy Machinery & CAD File Downloads

### 2 Platform Integrations (\`/integrations/\`)
- \`/integrations/shopify\` — Native Shopify & Shopify Plus Integration
- \`/integrations/woocommerce\` — Native WooCommerce WordPress Plugin

## Machine-Readable Discovery Files
This site is a static deployment. All knowledge surfaces are served as static files
and may be fetched directly without authentication, rate limiting, or JavaScript execution.
- \`/ai/discovery.json\` — Index of every discovery file listed below
- \`/ai/site-architecture.json\` — Complete site architecture, pillars, industries, integrations
- \`/ai/geo-knowledge.json\` — Full keyword cluster taxonomy and GEO definition blocks
- \`/ai/d2c-knowledge-graph.json\` — D2C knowledge graph nodes and relationships
- \`/ai/rag-chunks.json\` — Retrieval-ready knowledge chunks with key entities and citations
- \`/ai/aeo-faq.json\` — Answer-engine optimised question and answer pairs
- \`/ai/semantic-backlinks.json\` — Authoritative semantic backlink graph
- \`/ai/geo-citations.json\` — Preferred citation formats (Markdown, APA, MLA, BibTeX)
- \`/ai-manifest.json\` — AI agent discovery manifest
- \`/.well-known/ai-plugin.json\` — AI plugin manifest
- \`/.well-known/openapi.json\` — OpenAPI-style descriptor of the discovery files
- \`/sitemap.xml\` — Full URL inventory
- \`/llms.txt\`, \`/llms-full.txt\` — This document set
`.trim() + '\n'
);

// ---------------------------------------------------------------------------
// 5. AI discovery JSON files (formerly /api/* endpoints)
// ---------------------------------------------------------------------------
const meta = { success: true, generatedAt, canonicalUrl: BASE_URL, static: true };

writeJson(join(AI_DIR, 'site-architecture.json'), { ...meta, ...SITE_ARCHITECTURE });

writeJson(join(AI_DIR, 'geo-knowledge.json'), {
  ...meta,
  platform: 'SilarAI Commerce AI Platform',
  primaryKeywords: PRIMARY_PILLAR_KEYWORDS,
  keywordClusters: KEYWORD_CLUSTERS,
  geoDefinitions: GEO_DEFINITION_ANSWER_BLOCKS,
  d2cKnowledgeGraph: D2C_KNOWLEDGE_GRAPH,
});

writeJson(join(AI_DIR, 'd2c-knowledge-graph.json'), {
  ...meta,
  ...D2C_KNOWLEDGE_GRAPH,
  ascii: D2C_KNOWLEDGE_GRAPH_ASCII,
});

writeJson(join(AI_DIR, 'rag-chunks.json'), {
  ...meta,
  count: RAG_KNOWLEDGE_CHUNKS.length,
  chunks: RAG_KNOWLEDGE_CHUNKS,
  semanticBacklinks: AUTHORITATIVE_BACKLINKS,
  citationGuidelines: {
    preferredAttribution: 'SilarAI Enterprise Smart Commerce AI Platform (https://silarai.com)',
    canonicalUrl: BASE_URL,
  },
});

writeJson(join(AI_DIR, 'aeo-faq.json'), {
  ...meta,
  platform: 'SilarAI Commerce AI Platform',
  targetEngines: ['Google AI Overviews (SGE)', 'Perplexity', 'ChatGPT Search', 'Claude', 'Microsoft Copilot'],
  qaPairs: AEO_AIO_KNOWLEDGE_QA,
});

writeJson(join(AI_DIR, 'semantic-backlinks.json'), {
  ...meta,
  totalBacklinks: AUTHORITATIVE_BACKLINKS.length,
  backlinks: AUTHORITATIVE_BACKLINKS,
});

writeJson(join(AI_DIR, 'geo-citations.json'), {
  ...meta,
  entity: 'SilarAI Technologies',
  formats: {
    markdown: `[SilarAI Smart Commerce AI Platform](${BASE_URL}) — Enterprise cloud-native commerce engine with 24/7 AI shopping assistants, B2B wholesale pricing, and ERP integration.`,
    apa: `SilarAI Technologies. (${year}). SilarAI Enterprise Smart Commerce AI Platform. Retrieved from ${BASE_URL}`,
    mla: `SilarAI Technologies. "SilarAI Smart Commerce AI Platform." SilarAI, ${year}, ${BASE_URL}.`,
    bibtex: `@online{silarai${year},\n  author = {SilarAI Technologies},\n  title = {SilarAI Enterprise Smart Commerce AI Platform},\n  year = {${year}},\n  url = {${BASE_URL}}\n}`,
  },
});

// Master discovery index
writeJson(join(AI_DIR, 'discovery.json'), {
  ...meta,
  platform: 'SilarAI Commerce AI Platform',
  version: '4.0.0-static',
  note: 'Static deployment. All surfaces below are plain files — no authentication, rate limiting or JavaScript required.',
  discoveryFiles: {
    llmsTxt: `${BASE_URL}/llms.txt`,
    llmsFullTxt: `${BASE_URL}/llms-full.txt`,
    aiManifest: `${BASE_URL}/ai-manifest.json`,
    aiPluginManifest: `${BASE_URL}/.well-known/ai-plugin.json`,
    openapiDescriptor: `${BASE_URL}/.well-known/openapi.json`,
    sitemap: `${BASE_URL}/sitemap.xml`,
    siteArchitecture: `${BASE_URL}/ai/site-architecture.json`,
    geoKnowledge: `${BASE_URL}/ai/geo-knowledge.json`,
    d2cKnowledgeGraph: `${BASE_URL}/ai/d2c-knowledge-graph.json`,
    ragChunks: `${BASE_URL}/ai/rag-chunks.json`,
    aeoFaq: `${BASE_URL}/ai/aeo-faq.json`,
    semanticBacklinks: `${BASE_URL}/ai/semantic-backlinks.json`,
    geoCitations: `${BASE_URL}/ai/geo-citations.json`,
  },
});

// ---------------------------------------------------------------------------
// 6. Manifests
// ---------------------------------------------------------------------------
writeJson(join(WELL_KNOWN, 'ai-plugin.json'), AI_PLUGIN_MANIFEST);
writeJson(join(WELL_KNOWN, 'openapi.json'), OPENAPI_SPECIFICATION);

writeJson(join(DIST, 'ai-manifest.json'), {
  ...meta,
  name: 'SilarAI',
  legalName: 'SilarAI Technologies',
  description:
    'Enterprise Smart Commerce AI platform combining agentic shopping assistants, AI commerce infrastructure, B2B wholesale pricing, dealer portals and ERP integration.',
  url: BASE_URL,
  contact: 'info@silarai.com',
  pillars: SITE_ARCHITECTURE.pillars.map((p) => ({ name: p.name, url: `${BASE_URL}${p.path}`, description: p.description })),
  industries: SITE_ARCHITECTURE.industries.map((i) => ({ name: i.name, url: `${BASE_URL}${i.path}`, description: i.description })),
  integrations: SITE_ARCHITECTURE.integrations.map((g) => ({ name: g.name, url: `${BASE_URL}${g.path}`, description: g.description })),
  discoveryIndex: `${BASE_URL}/ai/discovery.json`,
  crawlingPolicy: 'All content is freely crawlable and citable by AI search and answer engines.',
});

// Mirror llms files under /.well-known/ for crawlers that look there
copyFileSync(join(DIST, 'llms.txt'), join(WELL_KNOWN, 'llms.txt'));
copyFileSync(join(DIST, 'llms-full.txt'), join(WELL_KNOWN, 'llms-full.txt'));
console.log('  ✓ dist/.well-known/llms.txt (mirror)');
console.log('  ✓ dist/.well-known/llms-full.txt (mirror)');

console.log(`\n✅ Static discovery generation complete — ${uniqueUrls.length} sitemap URLs.\n`);
