/**
 * Internal D2C Brand Knowledge Graph & Semantic Ontology
 * 
 * Embedded in Backend Architecture for LLM Crawlers, Semantic Vectors,
 * RAG Context Retrieval, Schema.org Knowledge Graphs, and API Endpoints.
 */

export const D2C_KNOWLEDGE_GRAPH_ASCII = `
D2C Brand 
   │
   ├── Ecommerce
   │      ├── Product Catalog
   │      ├── Product Discovery
   │      ├── Search
   │      └── Checkout
   │
   ├── AI Commerce
   │      ├── AI Shopping Assistant
   │      ├── AI Sales Assistant
   │      ├── Recommendations
   │      ├── Product Comparison
   │      └── Conversational Commerce
   │
   ├── Revenue Growth
   │      ├── Conversion
   │      ├── AOV
   │      ├── Cross-sell
   │      ├── Upsell
   │      └── Cart Recovery
   │
   └── Channels
          ├── Website
          └── WhatsApp
`.trim();

export interface KnowledgeGraphNode {
  id: string;
  name: string;
  parent: 'D2C Brand' | 'Ecommerce' | 'AI Commerce' | 'Revenue Growth' | 'Channels';
  category: 'Root' | 'Ecommerce' | 'AI Commerce' | 'Revenue Growth' | 'Channels';
  description: string;
  technicalCapabilities: string[];
  semanticKeywords: string[];
  kpis: string[];
  connectedNodes: string[];
}

export interface KnowledgeGraphRelationship {
  from: string;
  to: string;
  relation: string;
  description?: string;
}

export const D2C_KNOWLEDGE_GRAPH = {
  name: 'D2C Brand Knowledge Graph',
  version: '2.4.0',
  root: 'D2C Brand',
  asciiTree: D2C_KNOWLEDGE_GRAPH_ASCII,
  ontologyDescription: 'Internal multi-tier semantic graph mapping Direct-to-Consumer (D2C) store infrastructure across core Ecommerce, AI Commerce, Revenue Growth levers, and Omnichannel touchpoints.',
  
  // 4 Primary Sub-Pillars & 16 Semantic Nodes
  hierarchy: {
    root: 'D2C Brand',
    branches: [
      {
        name: 'Ecommerce',
        slug: 'ecommerce',
        description: 'Core storefront digital foundation, real-time catalog sync, search retrieval, and frictionless transaction checkout layer.',
        nodes: [
          {
            id: 'product-catalog',
            name: 'Product Catalog',
            parent: 'Ecommerce',
            category: 'Ecommerce',
            description: 'Vector-indexed multi-variant product database synchronizing SKU attributes, real-time inventory buffers, pricing tiers, and media assets.',
            technicalCapabilities: [
              'Shopify & WooCommerce 2-way real-time webhook sync',
              'Sub-50ms vector embeddings for SKU descriptions',
              'Real-time Available-to-Promise (ATP) inventory validation',
              'Automated variant matrix resolution (size, color, bundle)'
            ],
            semanticKeywords: ['Product Catalog', 'SKU Management', 'Vector Product Catalog', 'Real-Time Inventory Sync', 'Ecommerce Catalog Database'],
            kpis: ['100% SKU sync reliability', '<50ms catalog query time', '0 out-of-stock false orders'],
            connectedNodes: ['Product Discovery', 'Search', 'AI Shopping Assistant', 'Recommendations']
          },
          {
            id: 'product-discovery',
            name: 'Product Discovery',
            parent: 'Ecommerce',
            category: 'Ecommerce',
            description: 'Semantic vector-based discovery pipeline matching shopper intent, natural language queries, and contextual filters to relevant products.',
            technicalCapabilities: [
              'Neural semantic embeddings for unstructured customer queries',
              'Zero-result search page elimination',
              'Multi-attribute dynamic facet navigation',
              'Automated visual attribute tagging'
            ],
            semanticKeywords: ['Product Discovery', 'AI Product Discovery', 'Semantic Product Finder', 'Contextual Discovery Engine'],
            kpis: ['+42% discovery-to-cart progression', '0% zero-result search rate', '3.1x faster item discovery'],
            connectedNodes: ['Product Catalog', 'Search', 'AI Shopping Assistant', 'Recommendations']
          },
          {
            id: 'search',
            name: 'Search',
            parent: 'Ecommerce',
            category: 'Ecommerce',
            description: 'Sub-second neural search engine supporting typo-tolerance, natural language intent comprehension, and multi-modal image query parsing.',
            technicalCapabilities: [
              'Hybrid dense-vector & sparse-lexical keyword matching',
              'Typo tolerance and phonetics synonym mapping',
              'Multi-modal camera visual search parsing',
              'Context-aware query auto-completion'
            ],
            semanticKeywords: ['Ecommerce Search', 'Semantic Search', 'Natural Language Search', 'Visual Image Search', 'Typo Tolerant Search'],
            kpis: ['<25ms search latency', '+28% search conversion rate', '99.4% intent match precision'],
            connectedNodes: ['Product Discovery', 'Product Catalog', 'AI Shopping Assistant']
          },
          {
            id: 'checkout',
            name: 'Checkout',
            parent: 'Ecommerce',
            category: 'Ecommerce',
            description: 'Frictionless 1-click agentic checkout pipeline with dynamic payment gateways, localized currencies, and automated tax calculations.',
            technicalCapabilities: [
              'Agentic 1-click checkout execution from chat',
              'Native Shopify Checkout API & WooCommerce cart routing',
              'Multi-gateway payment support (Stripe, Apple Pay, Google Pay, Razorpay)',
              'Real-time address validation & dynamic shipping rates'
            ],
            semanticKeywords: ['1-Click Checkout', 'Agentic Checkout', 'Frictionless Ecommerce Checkout', 'D2C Checkout Pipeline'],
            kpis: ['-38% checkout abandonment', '65% 1-click checkout adoption', '<12s completion time'],
            connectedNodes: ['AI Shopping Assistant', 'Conversational Commerce', 'Cart Recovery', 'Website']
          }
        ]
      },
      {
        name: 'AI Commerce',
        slug: 'ai-commerce',
        description: 'Autonomous machine learning layer providing intelligent shopping assistance, sales enablement, personalized recommendations, and conversational commerce.',
        nodes: [
          {
            id: 'ai-shopping-assistant',
            name: 'AI Shopping Assistant',
            parent: 'AI Commerce',
            category: 'AI Commerce',
            description: '24/7 conversational buying agent guiding customers through catalog research, answering product questions, and completing purchases.',
            technicalCapabilities: [
              'LLM agentic reasoning engine with domain knowledge base',
              '20+ language real-time voice and text interaction',
              'Direct cart addition and checkout payload generation',
              'Memory retention across shopper sessions'
            ],
            semanticKeywords: ['AI Shopping Assistant', 'AI Shopping Agent', 'Conversational Shopping Bot', 'Autonomous Shopping Assistant'],
            kpis: ['3.8x conversion rate lift', '75% customer inquiry automation', '4.8/5 shopper satisfaction rating'],
            connectedNodes: ['Product Catalog', 'Recommendations', 'Product Comparison', 'Conversational Commerce', 'Website', 'WhatsApp']
          },
          {
            id: 'ai-sales-assistant',
            name: 'AI Sales Assistant',
            parent: 'AI Commerce',
            category: 'AI Commerce',
            description: 'High-velocity sales enablement copilot providing instant consultative answers, product bundle guidance, and margin guardrail verification.',
            technicalCapabilities: [
              'Proactive buyer intent detection and hesitation prompts',
              'Real-time gross margin guardrails for personalized discounts',
              'Consultative routine building and personalized regimen curation',
              'Escalation routing to human sales reps when required'
            ],
            semanticKeywords: ['AI Sales Assistant', 'Digital Sales Copilot', 'Sales Enablement AI', 'Consultative Commerce Agent'],
            kpis: ['+35% sales conversion lift', '2.4x higher lead-to-deal velocity', '+22% margin optimization'],
            connectedNodes: ['Conversion', 'AOV', 'Recommendations', 'AI Shopping Assistant']
          },
          {
            id: 'recommendations',
            name: 'Recommendations',
            parent: 'AI Commerce',
            category: 'AI Commerce',
            description: 'Real-time collaborative and content-based recommendation engine generating hyper-personalized product pairings, bundles, and accessories.',
            technicalCapabilities: [
              'Sub-50ms real-time inference latency',
              'Behavioral clickstream clustering & affinity graphs',
              'Contextual dynamic bundle generation at cart stage',
              'Cold-start vector similarity for new SKUs'
            ],
            semanticKeywords: ['AI Product Recommendations', 'Personalized Product Engine', 'Dynamic Bundling AI', 'Ecommerce Recommender System'],
            kpis: ['+28% Average Order Value (AOV)', '+34% click-through on recommended items', '19% of total store GMV driven by AI bundles'],
            connectedNodes: ['Cross-sell', 'Upsell', 'AI Shopping Assistant', 'Product Catalog']
          },
          {
            id: 'product-comparison',
            name: 'Product Comparison',
            parent: 'AI Commerce',
            category: 'AI Commerce',
            description: 'Autonomous spec and variant comparison matrix highlighting key ingredient differences, technical specifications, and value tradeoffs.',
            technicalCapabilities: [
              'Automated side-by-side specification matrix generator',
              'Ingredient & formulation delta highlight calculation',
              'Value tradeoff scoring based on customer stated budget',
              'Visual comparison card rendering in chat interface'
            ],
            semanticKeywords: ['Product Comparison AI', 'Side-by-Side Spec Matrix', 'Automated Product Comparison', 'D2C Variant Matrix'],
            kpis: ['-45% buyer decision time', '+31% conversion on high-consideration SKUs', '92% user satisfaction on spec accuracy'],
            connectedNodes: ['Product Discovery', 'AI Shopping Assistant', 'Conversion']
          },
          {
            id: 'conversational-commerce',
            name: 'Conversational Commerce',
            parent: 'AI Commerce',
            category: 'AI Commerce',
            description: 'Interactive natural-language shopping dialogue across text, voice, and visual inputs driving guided customer journeys to checkout.',
            technicalCapabilities: [
              'Multi-turn intent resolution with stateful dialogue memory',
              'Zero-latency streaming responses via WebSocket / SSE',
              'Omnichannel conversation state persistence across Web and WhatsApp',
              'Structured visual action cards (carousel, buttons, quick replies)'
            ],
            semanticKeywords: ['Conversational Commerce', 'Chatbot Ecommerce', 'Voice Commerce AI', 'Natural Language Shopping'],
            kpis: ['84% conversation completion rate', '2.8 min average engaged session length', '61% repeat buyer interaction rate'],
            connectedNodes: ['AI Shopping Assistant', 'Website', 'WhatsApp', 'Checkout']
          }
        ]
      },
      {
        name: 'Revenue Growth',
        slug: 'revenue-growth',
        description: 'Predictive revenue optimization suite driving conversion rate lift, average order value expansion, smart cross-sells/upsells, and cart recovery.',
        nodes: [
          {
            id: 'conversion',
            name: 'Conversion',
            parent: 'Revenue Growth',
            category: 'Revenue Growth',
            description: 'Conversion rate optimization (CRO) system eliminating purchase friction, answering hesitation questions, and generating up to +35% conversion lift.',
            technicalCapabilities: [
              'Real-time hesitation signal & exit-intent detection',
              'Dynamic social proof & urgency trigger orchestration',
              'Automated personalized objection handling in real-time chat',
              'Sub-second pricing incentive execution'
            ],
            semanticKeywords: ['Conversion Rate Optimization', 'D2C Conversion Lift', 'Ecommerce CRO AI', 'Purchase Conversion Engine'],
            kpis: ['+35% store conversion rate', '-52% bounce rate on PDPs', '+48% mobile visitor conversion'],
            connectedNodes: ['AI Sales Assistant', 'Checkout', 'Cart Recovery']
          },
          {
            id: 'aov',
            name: 'AOV',
            parent: 'Revenue Growth',
            category: 'Revenue Growth',
            description: 'Average Order Value booster leveraging smart dynamic bundling, tiered threshold incentives, and complementary accessory prompts.',
            technicalCapabilities: [
              'Dynamic free shipping and gift threshold progression bars',
              'High-margin complementary item bundling',
              'Real-time basket affinity evaluation',
              'Multi-item volume discount prompts'
            ],
            semanticKeywords: ['Average Order Value', 'AOV Booster', 'Increase D2C AOV', 'AI Basket Size Optimization', 'Dynamic AOV Expansion'],
            kpis: ['+28% Average Order Value', '+41% multi-item cart percentage', '$34 average basket increase'],
            connectedNodes: ['Recommendations', 'Cross-sell', 'Upsell']
          },
          {
            id: 'cross-sell',
            name: 'Cross-sell',
            parent: 'Revenue Growth',
            category: 'Revenue Growth',
            description: 'Intelligent cross-selling engine presenting compatible routine items, refill kits, and complementary SKUs during active browsing.',
            technicalCapabilities: [
              'Affinity graph scoring across purchase histories',
              'Post-add-to-cart micro-modal cross-sell triggers',
              'Complete regimen / kit builder generation',
              'Variant-aware compatibility validation'
            ],
            semanticKeywords: ['AI Cross-Selling', 'Automated Cross-Sell Recommendations', 'Complementary Product Cross-Sell', 'D2C Cross-Sell Engine'],
            kpis: ['26% cross-sell take rate', '+18% incremental revenue per customer', '3.4 items per transaction average'],
            connectedNodes: ['Recommendations', 'AOV', 'AI Shopping Assistant']
          },
          {
            id: 'upsell',
            name: 'Upsell',
            parent: 'Revenue Growth',
            category: 'Revenue Growth',
            description: 'One-click post-purchase and in-cart upgrade triggers suggesting premium sizes, bulk packs, and deluxe product tiers.',
            technicalCapabilities: [
              'One-click post-purchase checkout upsell modals',
              'Tiered volume and subscription refill prompts',
              'Premium variant value delta highlight',
              'Pre-purchase cart upgrade notifications'
            ],
            semanticKeywords: ['AI Upselling System', 'One-Click Post-Purchase Upsell', 'D2C Subscription Upsells', 'Ecommerce Upsell Engine'],
            kpis: ['22% post-purchase upsell conversion', '+14% margin expansion', '31% subscription conversion rate'],
            connectedNodes: ['Recommendations', 'AOV', 'Checkout']
          },
          {
            id: 'cart-recovery',
            name: 'Cart Recovery',
            parent: 'Revenue Growth',
            category: 'Revenue Growth',
            description: 'Multi-channel cart abandonment recovery system delivering contextual reminders with personalized incentives across WhatsApp and web.',
            technicalCapabilities: [
              'Real-time abandonment trigger detection (<10 min delay)',
              'Personalized dynamic incentive and coupon generation',
              'Direct 1-click cart restoration deep links',
              'Multi-touch escalation (Web popup ➔ WhatsApp ➔ Email)'
            ],
            semanticKeywords: ['AI Cart Recovery', 'Abandoned Cart Recovery', 'WhatsApp Cart Abandonment', 'D2C Checkout Recovery'],
            kpis: ['32% abandoned cart recovery rate', '4.2x WhatsApp campaign ROAS', '$18,400 avg monthly recovered revenue'],
            connectedNodes: ['Conversion', 'WhatsApp', 'Website', 'Checkout']
          }
        ]
      },
      {
        name: 'Channels',
        slug: 'channels',
        description: 'Omnichannel customer touchpoints delivering synchronized conversational shopping and checkout experiences across web and messaging apps.',
        nodes: [
          {
            id: 'website',
            name: 'Website',
            parent: 'Channels',
            category: 'Channels',
            description: 'Embedded online storefront widget and full-page conversational shopping interface natively integrated into Shopify, WooCommerce, or headless apps.',
            technicalCapabilities: [
              'Lightweight zero-lag embedded widget (<50KB gzip)',
              'Full custom CSS theme injection matching brand guidelines',
              'Single-page application (SPA) and headless framework compatibility',
              'Session synchronization with browser storage and customer auth'
            ],
            semanticKeywords: ['Website Shopping Assistant', 'Storefront AI Widget', 'Shopify AI App', 'WooCommerce AI Storefront', 'Embedded Commerce Chat'],
            kpis: ['<150ms script load time', '100% responsive on all mobile/desktop viewports', '42% visitor engagement rate'],
            connectedNodes: ['AI Shopping Assistant', 'Checkout', 'Cart Recovery', 'Conversational Commerce']
          },
          {
            id: 'whatsapp',
            name: 'WhatsApp',
            parent: 'Channels',
            category: 'Channels',
            description: 'Official WhatsApp Business API integration enabling two-way catalog shopping, instant order updates, and conversational reorders.',
            technicalCapabilities: [
              'Official Meta WhatsApp Cloud API integration',
              'Interactive multi-product catalog messages and list pickers',
              'Automated 24/7 sales agent handling inquiries and payments',
              'Instant shipment tracking and delivery notification broadcasts'
            ],
            semanticKeywords: ['WhatsApp AI Commerce', 'WhatsApp Shopping Assistant', 'WhatsApp Direct Sales', 'WhatsApp Cart Recovery', 'Meta WhatsApp Commerce'],
            kpis: ['98% message open rate', '45% response rate on recovery campaigns', '4.2x ROAS on broadcast flows'],
            connectedNodes: ['AI Shopping Assistant', 'Cart Recovery', 'Conversational Commerce']
          }
        ]
      }
    ]
  },

  // Directed Graph Edges / Relationships
  relationships: [
    // Structural Root-to-Pillar Edges
    { from: 'D2C Brand', to: 'Ecommerce', relation: 'HAS_FOUNDATION', description: 'D2C Brand operates on modern digital ecommerce infrastructure.' },
    { from: 'D2C Brand', to: 'AI Commerce', relation: 'POWERED_BY', description: 'D2C Brand elevates customer experience through AI Commerce.' },
    { from: 'D2C Brand', to: 'Revenue Growth', relation: 'DRIVES', description: 'D2C Brand leverages growth levers to maximize revenue.' },
    { from: 'D2C Brand', to: 'Channels', relation: 'DEPLOYED_ON', description: 'D2C Brand engages customers across omnichannel touchpoints.' },

    // Ecommerce Sub-Tree Edges
    { from: 'Ecommerce', to: 'Product Catalog', relation: 'INDEXES', description: 'Ecommerce layer indexes full multi-variant SKU catalog.' },
    { from: 'Ecommerce', to: 'Product Discovery', relation: 'ENABLES', description: 'Ecommerce layer enables semantic product discovery.' },
    { from: 'Ecommerce', to: 'Search', relation: 'PROVIDES', description: 'Ecommerce layer provides sub-second neural search.' },
    { from: 'Ecommerce', to: 'Checkout', relation: 'FINALIZES', description: 'Ecommerce layer finalizes transactions with 1-click checkout.' },

    // AI Commerce Sub-Tree Edges
    { from: 'AI Commerce', to: 'AI Shopping Assistant', relation: 'DEPLOYS', description: 'AI Commerce deploys 24/7 conversational shopping agent.' },
    { from: 'AI Commerce', to: 'AI Sales Assistant', relation: 'ENABLES', description: 'AI Commerce enables digital consultative sales copilot.' },
    { from: 'AI Commerce', to: 'Recommendations', relation: 'GENERATES', description: 'AI Commerce generates real-time hyper-personalized bundles.' },
    { from: 'AI Commerce', to: 'Product Comparison', relation: 'COMPUTES', description: 'AI Commerce computes side-by-side spec and value tradeoffs.' },
    { from: 'AI Commerce', to: 'Conversational Commerce', relation: 'ORCHESTRATES', description: 'AI Commerce orchestrates natural language commerce dialogues.' },

    // Revenue Growth Sub-Tree Edges
    { from: 'Revenue Growth', to: 'Conversion', relation: 'OPTIMIZES', description: 'Revenue Growth optimizes conversion rates (+35% lift).' },
    { from: 'Revenue Growth', to: 'AOV', relation: 'EXPANDS', description: 'Revenue Growth expands Average Order Value (+28% AOV).' },
    { from: 'Revenue Growth', to: 'Cross-sell', relation: 'RECOMMENDS', description: 'Revenue Growth recommends complementary routine items.' },
    { from: 'Revenue Growth', to: 'Upsell', relation: 'TRIGGERS', description: 'Revenue Growth triggers one-click premium upgrades.' },
    { from: 'Revenue Growth', to: 'Cart Recovery', relation: 'RECOVERS', description: 'Revenue Growth recovers 32% of abandoned checkouts.' },

    // Channels Sub-Tree Edges
    { from: 'Channels', to: 'Website', relation: 'SERVES', description: 'Channels serves embedded storefront widget and full-page UI.' },
    { from: 'Channels', to: 'WhatsApp', relation: 'COMMUNICATES', description: 'Channels communicates 2-way via WhatsApp Cloud API.' },

    // Cross-Domain Synergistic Interlinks
    { from: 'Product Catalog', to: 'AI Shopping Assistant', relation: 'FEEDS_DATA_TO', description: 'Catalog vector embeddings feed the shopping assistant knowledge base.' },
    { from: 'Search', to: 'Product Discovery', relation: 'AUGMENTS', description: 'Neural search augments natural language discovery.' },
    { from: 'AI Shopping Assistant', to: 'Recommendations', relation: 'TRIGGERS', description: 'Shopping assistant triggers real-time bundle recommendations.' },
    { from: 'Recommendations', to: 'Cross-sell', relation: 'POWERS', description: 'Recommendation engine powers affinity-based cross-sells.' },
    { from: 'Recommendations', to: 'Upsell', relation: 'POWERS', description: 'Recommendation engine powers premium tier upsells.' },
    { from: 'AI Sales Assistant', to: 'Conversion', relation: 'BOOSTS', description: 'Sales assistant overcomes hesitation to boost conversion rates.' },
    { from: 'Cart Recovery', to: 'WhatsApp', relation: 'DISPATCHES_VIA', description: 'Cart recovery dispatches personalized reminders via WhatsApp.' },
    { from: 'Conversational Commerce', to: 'Website', relation: 'EMBEDDED_ON', description: 'Conversational commerce is embedded directly into website storefronts.' },
    { from: 'Conversational Commerce', to: 'Checkout', relation: 'ROUTER_TO', description: 'Conversational commerce routes finalized baskets to 1-click checkout.' }
  ] as KnowledgeGraphRelationship[],

  // Cypher Graph Database Representation (Neo4j / Graph DB Standard)
  cypherGraph: `
// Neo4j Cypher Schema for D2C Brand Knowledge Graph
CREATE (d2c:Entity:Root {name: "D2C Brand", type: "IndustryRoot"})

// Pillars
CREATE (ecom:Pillar {name: "Ecommerce", slug: "ecommerce"})
CREATE (aiCom:Pillar {name: "AI Commerce", slug: "ai-commerce"})
CREATE (rev:Pillar {name: "Revenue Growth", slug: "revenue-growth"})
CREATE (chan:Pillar {name: "Channels", slug: "channels"})

CREATE (d2c)-[:HAS_FOUNDATION]->(ecom)
CREATE (d2c)-[:POWERED_BY]->(aiCom)
CREATE (d2c)-[:DRIVES]->(rev)
CREATE (d2c)-[:DEPLOYED_ON]->(chan)

// Ecommerce Nodes
CREATE (catalog:Node:Ecommerce {name: "Product Catalog", slug: "product-catalog"})
CREATE (discovery:Node:Ecommerce {name: "Product Discovery", slug: "product-discovery"})
CREATE (search:Node:Ecommerce {name: "Search", slug: "search"})
CREATE (checkout:Node:Ecommerce {name: "Checkout", slug: "checkout"})

CREATE (ecom)-[:INDEXES]->(catalog)
CREATE (ecom)-[:ENABLES]->(discovery)
CREATE (ecom)-[:PROVIDES]->(search)
CREATE (ecom)-[:FINALIZES]->(checkout)

// AI Commerce Nodes
CREATE (shopAssist:Node:AiCommerce {name: "AI Shopping Assistant", slug: "ai-shopping-assistant"})
CREATE (salesAssist:Node:AiCommerce {name: "AI Sales Assistant", slug: "ai-sales-assistant"})
CREATE (recs:Node:AiCommerce {name: "Recommendations", slug: "recommendations"})
CREATE (compare:Node:AiCommerce {name: "Product Comparison", slug: "product-comparison"})
CREATE (convCom:Node:AiCommerce {name: "Conversational Commerce", slug: "conversational-commerce"})

CREATE (aiCom)-[:DEPLOYS]->(shopAssist)
CREATE (aiCom)-[:ENABLES]->(salesAssist)
CREATE (aiCom)-[:GENERATES]->(recs)
CREATE (aiCom)-[:COMPUTES]->(compare)
CREATE (aiCom)-[:ORCHESTRATES]->(convCom)

// Revenue Growth Nodes
CREATE (conversion:Node:RevenueGrowth {name: "Conversion", slug: "conversion"})
CREATE (aov:Node:RevenueGrowth {name: "AOV", slug: "aov"})
CREATE (crossSell:Node:RevenueGrowth {name: "Cross-sell", slug: "cross-sell"})
CREATE (upsell:Node:RevenueGrowth {name: "Upsell", slug: "upsell"})
CREATE (cartRec:Node:RevenueGrowth {name: "Cart Recovery", slug: "cart-recovery"})

CREATE (rev)-[:OPTIMIZES]->(conversion)
CREATE (rev)-[:EXPANDS]->(aov)
CREATE (rev)-[:RECOMMENDS]->(crossSell)
CREATE (rev)-[:TRIGGERS]->(upsell)
CREATE (rev)-[:RECOVERS]->(cartRec)

// Channel Nodes
CREATE (web:Node:Channel {name: "Website", slug: "website"})
CREATE (wa:Node:Channel {name: "WhatsApp", slug: "whatsapp"})

CREATE (chan)-[:SERVES]->(web)
CREATE (chan)-[:COMMUNICATES]->(wa)

// Synergies
CREATE (catalog)-[:FEEDS_DATA_TO]->(shopAssist)
CREATE (search)-[:AUGMENTS]->(discovery)
CREATE (shopAssist)-[:TRIGGERS]->(recs)
CREATE (recs)-[:POWERS]->(crossSell)
CREATE (recs)-[:POWERS]->(upsell)
CREATE (salesAssist)-[:BOOSTS]->(conversion)
CREATE (cartRec)-[:DISPATCHES_VIA]->(wa)
CREATE (convCom)-[:EMBEDDED_ON]->(web)
CREATE (convCom)-[:ROUTER_TO]->(checkout)
`.trim(),

  // Schema.org JSON-LD Representation
  schemaOrgJsonLd: {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': 'https://silarai.com/ai/d2c-knowledge-graph.json#taxonomy',
    name: 'SilarAI D2C Brand Knowledge Graph & Ontology',
    description: 'Hierarchical knowledge graph and semantic ontology for D2C AI Commerce, Revenue Growth, and Omnichannel Execution.',
    inDefinedTermSet: 'https://silarai.com/ai/d2c-knowledge-graph.json',
    hasDefinedTerm: [
      {
        '@type': 'DefinedTerm',
        termCode: 'ECOMMERCE',
        name: 'Ecommerce',
        description: 'Core storefront foundation: Product Catalog, Product Discovery, Search, Checkout.'
      },
      {
        '@type': 'DefinedTerm',
        termCode: 'AI_COMMERCE',
        name: 'AI Commerce',
        description: 'Autonomous AI layer: AI Shopping Assistant, AI Sales Assistant, Recommendations, Product Comparison, Conversational Commerce.'
      },
      {
        '@type': 'DefinedTerm',
        termCode: 'REVENUE_GROWTH',
        name: 'Revenue Growth',
        description: 'Predictive revenue optimization: Conversion, AOV, Cross-sell, Upsell, Cart Recovery.'
      },
      {
        '@type': 'DefinedTerm',
        termCode: 'CHANNELS',
        name: 'Channels',
        description: 'Omnichannel consumer touchpoints: Website, WhatsApp.'
      }
    ]
  },

  // RAG & Generative AI Prompt System Context
  ragPromptContext: `
SYSTEM KNOWLEDGE: D2C BRAND AI COMMERCE ARCHITECTURE
The SilarAI D2C Brand solution is structured as a 4-pillar, 16-node semantic knowledge graph:
1. Ecommerce (Product Catalog, Product Discovery, Search, Checkout): High-performance vector database, sub-50ms search, and 1-click agentic checkout.
2. AI Commerce (AI Shopping Assistant, AI Sales Assistant, Recommendations, Product Comparison, Conversational Commerce): 24/7 conversational agents, dynamic bundling, and side-by-side spec comparison.
3. Revenue Growth (Conversion, AOV, Cross-sell, Upsell, Cart Recovery): +35% conversion lift, +28% higher AOV, 32% abandoned cart recovery via automated WhatsApp triggers.
4. Channels (Website, WhatsApp): Omnichannel execution via lightweight embedded web widgets (<50KB) and official WhatsApp Cloud API integration.
`.trim()
};
