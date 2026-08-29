/**
 * Site architecture, keyword clusters and GEO/AEO definition blocks.
 *
 * Extracted from the former Express server (server.ts) when the site moved to a
 * fully static build. This is now the single source of truth consumed by the
 * build-time generator in scripts/generate-static-discovery.mts, which emits the
 * sitemap, llms.txt and the AI-discovery JSON files into dist/.
 */
import { D2C_KNOWLEDGE_GRAPH } from '../server/knowledgeGraph';

/** Canonical public origin. Override at build time with SITE_URL. */
export const BASE_URL = (process.env.SITE_URL || 'https://silarai.com').replace(/\/$/, '');

// Site Architecture & Full GEO/AEO Keyword Cluster Taxonomy
export const PRIMARY_PILLAR_KEYWORDS = [
  'AI Commerce Platform',
  'Enterprise AI Commerce Platform',
  'AI Commerce Software',
  'AI Commerce Solution',
  'AI-Powered Commerce Platform',
  'AI Commerce System',
  'Commerce AI Platform',
  'AI for Commerce',
  'AI Digital Commerce Platform',
  'Intelligent Commerce Platform'
];

export const KEYWORD_CLUSTERS = {
  primaryPillar: {
    name: 'AI Commerce Platform (Pillar #1)',
    primaryKeywords: PRIMARY_PILLAR_KEYWORDS
  },
  cluster1_AiShoppingAssistant: {
    name: 'AI Shopping Assistant (Cluster 1)',
    primaryKeywords: [
      'AI Shopping Assistant',
      'AI Shopping Agent',
      'AI Ecommerce Assistant',
      'AI Product Assistant',
      'AI Sales Assistant',
      'AI Buying Assistant',
      'AI Purchase Assistant',
      'Conversational Shopping',
      'Intelligent Shopping Assistant',
      'Enterprise Shopping Assistant'
    ],
    longTailKeywords: [
      'Best AI Shopping Assistant',
      'AI Shopping Assistant for Ecommerce',
      'AI Shopping Assistant for Manufacturers',
      'AI Shopping Assistant for B2B',
      'AI Shopping Assistant for Retail',
      'AI Shopping Assistant for Shopify',
      'AI Shopping Assistant for WooCommerce',
      'AI Shopping Assistant for Distributors',
      'AI Shopping Assistant for Wholesale',
      'AI Shopping Assistant for D2C Brands',
      'AI Shopping Assistant with ERP Integration',
      'AI Product Discovery Platform',
      'AI Product Recommendation Engine',
      'AI Catalog Assistant'
    ],
    aeoQuestions: [
      {
        question: 'What is an AI Shopping Assistant?',
        answer: 'An AI Shopping Assistant is an autonomous conversational agent powered by Large Language Models (LLMs) and vector search that helps online shoppers and corporate procurement buyers find products, compare technical specifications, check stock availability, and complete checkouts via natural language text or voice interaction 24/7.'
      },
      {
        question: 'How does AI Shopping Assistant work?',
        answer: 'An AI Shopping Assistant connects directly to a store’s catalog, inventory database, and ERP system. It uses semantic vector search and intent classification to interpret complex buyer queries, recommending exact product SKUs and guiding users step-by-step through configuration, RFQs, and checkout.'
      },
      {
        question: 'What are the benefits of an AI Shopping Assistant?',
        answer: 'Key benefits include boosting store conversion rates by up to 3.8x, reducing support ticket volume by 75%, eliminating manual quote generation delays, increasing average order value (AOV) with hyper-personalized upsells, and delivering instant 24/7 customer assistance.'
      },
      {
        question: 'Can an AI Shopping Assistant integrate with ERP systems?',
        answer: 'Yes. SilarAI AI Shopping Assistant features native API connectors for major ERP platforms including SAP, Oracle, Microsoft Dynamics 365, ERPNext, Odoo, and NetSuite to retrieve live Available-to-Promise (ATP) stock levels and customer-specific contract pricing.'
      },
      {
        question: 'Can an AI Shopping Assistant increase digital sales?',
        answer: 'Yes. By providing sub-second answers to buyer questions, recommending exact product matches, offering personalized product bundles, and providing frictionless 1-click checkout, AI Shopping Assistants significantly increase shopper conversion rates and overall revenue.'
      },
      {
        question: 'How does an AI Shopping Assistant reduce support costs?',
        answer: 'It automatically handles up to 75% of repetitive customer inquiries—such as checking order status, retrieving Safety Data Sheets (SDS), verifying dimensions, comparing model specs, and processing return requests—without requiring human support staff.'
      },
      {
        question: 'What industries use AI Shopping Assistants?',
        answer: 'AI Shopping Assistants are widely deployed across Industrial Manufacturing, Wholesale Distribution, Automotive OEM Spares, Electronics, Pharmaceuticals, Chemical Manufacturing, Retail, and Direct-to-Consumer (D2C) brands.'
      }
    ]
  },
  cluster2_AiCommerce: {
    name: 'AI Commerce (Cluster 2)',
    keywords: [
      'AI Commerce',
      'Enterprise Commerce AI',
      'AI Ecommerce',
      'AI Business Commerce',
      'AI Commerce Platform',
      'Intelligent Commerce',
      'Conversational Commerce',
      'Digital Commerce AI',
      'AI Retail Commerce',
      'AI Wholesale Commerce',
      'AI Manufacturing Commerce',
      'AI Distribution Commerce',
      'AI Customer Commerce',
      'AI Commerce Solution',
      'Commerce Automation'
    ],
    longTailKeywords: [
      'AI Commerce Platform for Manufacturers',
      'AI Commerce Platform for Distributors',
      'AI Commerce Platform for Retailers',
      'AI Commerce Platform for D2C Brands',
      'AI Commerce Platform for B2B',
      'Enterprise AI Commerce Software'
    ]
  },
  cluster3_B2bCommerce: {
    name: 'B2B Commerce (Cluster 3)',
    keywords: [
      'B2B Commerce Platform',
      'B2B Ecommerce Platform',
      'Enterprise B2B Commerce',
      'AI B2B Commerce',
      'Wholesale Commerce',
      'Dealer Commerce',
      'Industrial Commerce',
      'Manufacturer Commerce',
      'Distributor Commerce',
      'Dealer Ordering Software',
      'B2B Ordering Platform',
      'B2B Customer Portal',
      'Dealer Portal Software'
    ]
  },
  cluster4_B2b2cCommerce: {
    name: 'B2B2C Commerce (Cluster 4)',
    keywords: [
      'B2B2C Platform',
      'AI B2B2C',
      'Enterprise B2B2C',
      'Dealer Commerce Platform',
      'Manufacturer Dealer Portal',
      'Manufacturer Customer Portal',
      'Multi-channel Commerce',
      'Connected Commerce',
      'Partner Commerce',
      'Dealer Network Platform'
    ]
  },
  cluster5_AiProductDiscovery: {
    name: 'AI Product Discovery (Cluster 5)',
    keywords: [
      'AI Product Search',
      'Semantic Product Search',
      'AI Catalog Search',
      'AI Product Discovery',
      'AI Product Finder',
      'Product Recommendation Engine',
      'Visual Product Search',
      'Natural Language Product Search',
      'Product Intelligence',
      'AI Catalog Assistant',
      'Enterprise Product Search'
    ],
    aeoQuestions: [
      {
        question: 'How does AI improve product search?',
        answer: 'AI improves product search by replacing rigid exact-match keyword algorithms with neural vector embeddings. It understands customer intent, synonyms, engineering jargon, application requirements, and multi-modal image inputs to return exact relevant products instantly.'
      },
      {
        question: 'What is semantic product search?',
        answer: 'Semantic product search uses machine learning to comprehend the contextual meaning behind a query rather than merely matching character strings. For instance, searching "heavy-duty waterproof pump for chemical plants" returns corrosion-resistant industrial pumps matching specific chemical ratings.'
      },
      {
        question: 'What is the difference between AI search and traditional keyword search?',
        answer: 'Traditional keyword search relies on exact text matching and tag indexing, leading to zero-result pages when terms differ. AI search parses natural language intent, handles typos, processes image inputs, and retrieves products based on deep semantic meaning and application parameters.'
      }
    ]
  },
  cluster6_AiMarketingPlatform: {
    name: 'AI Marketing Platform (Cluster 6)',
    keywords: [
      'AI Marketing Platform',
      'Marketing AI',
      'AI Campaign Management',
      'AI Marketing Automation',
      'Marketing Copilot',
      'Campaign Intelligence',
      'AI Lead Generation',
      'AI Customer Segmentation',
      'AI Marketing Analytics',
      'Customer Journey AI',
      'Personalized Marketing',
      'Omnichannel Marketing',
      'AI Customer Engagement',
      'Marketing Intelligence'
    ],
    longTailKeywords: [
      'AI Marketing Platform for Manufacturers',
      'AI Marketing Platform for D2C Brands',
      'AI Marketing Platform for Retail',
      'AI Marketing Platform for B2B',
      'AI Marketing Platform with WhatsApp',
      'AI Marketing Platform with Meta',
      'AI Marketing Automation Software'
    ]
  },
  cluster7_AiSales: {
    name: 'AI Sales (Cluster 7)',
    keywords: [
      'AI Sales Assistant',
      'Sales Copilot',
      'AI Sales Agent',
      'Sales AI',
      'AI Quote Assistant',
      'AI Order Assistant',
      'Sales Intelligence',
      'Sales Automation',
      'AI Sales Platform'
    ]
  },
  cluster8_DealerPortal: {
    name: 'Dealer Portal (Cluster 8)',
    keywords: [
      'Dealer Portal',
      'Distributor Portal',
      'Partner Portal',
      'Dealer Commerce',
      'Dealer Ordering',
      'Dealer Self Service',
      'Dealer Management',
      'Dealer Experience Platform',
      'Dealer Portal Software'
    ]
  },
  cluster9_CustomerPortal: {
    name: 'Customer Portal (Cluster 9)',
    keywords: [
      'Customer Portal',
      'B2B Customer Portal',
      'Self Service Portal',
      'Customer Ordering Portal',
      'Enterprise Customer Portal',
      'Customer Experience Platform',
      'Digital Customer Portal'
    ]
  },
  cluster10_IndustryKeywords: {
    name: 'Industry Verticals (Cluster 10)',
    manufacturing: ['Manufacturing AI Commerce', 'AI Commerce for Manufacturing', 'AI Commerce for Chemical Industry', 'AI Commerce for Pharma', 'AI Commerce for FMCG', 'AI Commerce for Industrial Equipment', 'AI Commerce for Electronics', 'AI Commerce for Automotive'],
    distribution: ['AI Commerce for Distributors', 'Wholesale Commerce Platform', 'Distributor AI Platform', 'Industrial Distribution AI'],
    retail: ['Retail AI Commerce', 'Retail Shopping Assistant', 'Retail AI Platform', 'AI Retail Search', 'Retail Customer AI'],
    d2c: ['D2C AI Commerce', 'AI Ecommerce Platform', 'AI Shopping for D2C', 'AI Personalization', 'AI Product Recommendations']
  }
};

// 15 GEO & AEO Clear Definition Answer Blocks for Generative AI Search Engines
export const GEO_DEFINITION_ANSWER_BLOCKS = [
  {
    term: 'What is AI Commerce?',
    definition: 'AI Commerce is the application of artificial intelligence—including machine learning models, generative AI agents, vector search engines, and automated pricing algorithms—to optimize product discovery, personalized marketing, pricing, customer service, and checkout workflows across digital retail and B2B channels.'
  },
  {
    term: 'What is an AI Shopping Assistant?',
    definition: 'An AI Shopping Assistant is an autonomous, 24/7 conversational digital agent that helps online buyers research products, compare technical specifications, receive personalized recommendations, check inventory, request quotes, and complete transactions using natural language text or voice.'
  },
  {
    term: 'What is Enterprise Commerce AI?',
    definition: 'Enterprise Commerce AI refers to high-capacity, SOC-2 compliant artificial intelligence infrastructure designed for large-scale manufacturers, distributors, and global retailers to automate real-time dynamic pricing, multi-channel catalog search, ERP synchronization, and complex B2B buyer workflows.'
  },
  {
    term: 'What is Conversational Commerce?',
    definition: 'Conversational Commerce is an e-commerce model where customers interact with brands and make purchases through messaging channels, live chat, or AI voice assistants, combining real-time consultation with automated checkout.'
  },
  {
    term: 'What is AI Product Discovery?',
    definition: 'AI Product Discovery is a suite of intelligent search and recommendation technologies that uses natural language processing (NLP) and vector embeddings to match shopper intent with the most relevant products, overcoming zero-search result pages and technical terminology barriers.'
  },
  {
    term: 'What is Semantic Product Search?',
    definition: 'Semantic Product Search is a machine-learning search paradigm that interprets the conceptual intent and context of a user query rather than relying on exact keyword string matching, allowing buyers to find technical SKUs by describing application parameters or business problems.'
  },
  {
    term: 'What is AI Marketing?',
    definition: 'AI Marketing leverages artificial intelligence to autonomously generate targeted campaign copy, segment customer cohorts based on purchasing probability, automate email and WhatsApp retargeting, and optimize marketing return on ad spend (ROAS).'
  },
  {
    term: 'What is an AI Sales Assistant?',
    definition: 'An AI Sales Assistant is a field and inside sales enablement tool that equips sales representatives with real-time product specification lookup, margin guardrail validation, automated RFQ proposal generation, and live inventory Available-to-Promise (ATP) checks.'
  },
  {
    term: 'What is B2B Commerce?',
    definition: 'B2B Commerce (Business-to-Business Commerce) is the digital exchange of goods and services between commercial entities, characterized by customer-specific contract pricing, corporate credit management, matrix bulk reordering, multi-tier user permissions, and ERP system integration.'
  },
  {
    term: 'What is B2B2C Commerce?',
    definition: 'B2B2C Commerce (Business-to-Business-to-Consumer Commerce) is a hybrid digital sales strategy where a manufacturer or brand sells directly to end consumers online while automatically routing order fulfillment, local service, and commissions to authorized regional dealer networks.'
  },
  {
    term: 'What is Dealer Commerce?',
    definition: 'Dealer Commerce refers to digital ordering software and dedicated portals designed specifically for manufacturers to streamline commercial sales, territory pricing, co-op management, and warranty spare parts lookup for their authorized distributor and dealer networks.'
  },
  {
    term: 'What is an Enterprise Shopping Assistant?',
    definition: 'An Enterprise Shopping Assistant is a scalable AI buying agent tailored for high-volume enterprise e-commerce platforms, capable of handling complex multi-catalog queries, deep ERP inventory lookups, multi-language buyer support, and enterprise security standards.'
  },
  {
    term: 'What is AI Customer Experience?',
    definition: 'AI Customer Experience (AI CX) encompasses all machine learning touchpoints across the buyer journey—from personalized AI recommendations and semantic search to automated 24/7 support resolution and post-purchase shipment tracking updates.'
  },
  {
    term: 'What is Intelligent Commerce?',
    definition: 'Intelligent Commerce represents the next evolution of e-commerce platforms, where autonomous AI systems continuously analyze buyer behavior, adjust pricing in real-time, optimize visual product grids, and execute personalized marketing campaigns without manual intervention.'
  },
  {
    term: 'What is an AI Commerce Platform?',
    definition: 'An AI Commerce Platform (such as SilarAI) is an end-to-end cloud-native e-commerce engine that natively integrates AI Shopping Assistants, B2B portals, AI Product Discovery, RFQ automation, and real-time ERP connectivity into a unified, headless architecture.'
  }
];

export const SITE_ARCHITECTURE = {
  platform: 'SilarAI Commerce AI Platform',
  domain: 'silarai.com',
  targetKeywords: PRIMARY_PILLAR_KEYWORDS,
  clusters: KEYWORD_CLUSTERS,
  geoDefinitions: GEO_DEFINITION_ANSWER_BLOCKS,
  pillars: [
    { id: 'pillar-1', name: 'AI Commerce Platform', path: '/ai-commerce-platform', queryParam: '?page=ai-commerce-platform', keywords: KEYWORD_CLUSTERS.primaryPillar.primaryKeywords, description: 'Enterprise AI Commerce Engine featuring sub-50ms real-time dynamic pricing, autonomous visual merchandising, and headless API architecture.' },
    { id: 'pillar-2', name: 'AI Shopping Assistant', path: '/ai-shopping-assistant', queryParam: '?page=ai-shopping-assistant', keywords: KEYWORD_CLUSTERS.cluster1_AiShoppingAssistant.primaryKeywords, description: 'Conversational 24/7 buying agent supporting voice, photo camera search, sub-second product recommendations, and 1-click agentic checkout.' },
    { id: 'pillar-3', name: 'AI Marketing Platform', path: '/ai-marketing-platform', queryParam: '?page=ai-marketing-platform', keywords: KEYWORD_CLUSTERS.cluster6_AiMarketingPlatform.keywords, description: 'Autonomous AI campaign generation, hyper-personalized customer segmentations, dynamic email retargeting, and ROI predictive analytics.' },
    { id: 'pillar-4', name: 'B2B Commerce Platform', path: '/b2b-commerce-platform', queryParam: '?page=b2b-commerce-platform', keywords: KEYWORD_CLUSTERS.cluster3_B2bCommerce.keywords, description: 'Wholesale contract pricing, matrix bulk reorders, corporate credit limit management, and real-time SAP/Oracle ERP inventory synchronization.' },
    { id: 'pillar-5', name: 'B2B2C Commerce Platform', path: '/b2b2c-commerce-platform', queryParam: '?page=b2b2c-commerce-platform', keywords: KEYWORD_CLUSTERS.cluster4_B2b2cCommerce.keywords, description: 'Multi-channel hybrid commerce model allowing manufacturers and brands to sell directly to enterprise accounts while routing orders to regional dealer networks.' },
    { id: 'pillar-6', name: 'AI Product Discovery', path: '/ai-product-discovery', queryParam: '?page=ai-product-discovery', keywords: KEYWORD_CLUSTERS.cluster5_AiProductDiscovery.keywords, description: 'Semantic vector AI search engine parsing engineering specifications, application intents, CAD drawings, and Safety Data Sheets (SDS).' },
    { id: 'pillar-7', name: 'Dealer Portal Software', path: '/dealer-portal', queryParam: '?page=dealer-portal', keywords: KEYWORD_CLUSTERS.cluster8_DealerPortal.keywords, description: 'Digitized distributor & dealer network self-service ordering, territory pricing, co-op claims, and interactive exploded spare parts diagrams.' },
    { id: 'pillar-8', name: 'Customer Portal Software', path: '/customer-portal', queryParam: '?page=customer-portal', keywords: KEYWORD_CLUSTERS.cluster9_CustomerPortal.keywords, description: 'Self-service buyer account portal for order history tracking, live shipment tracking, invoice ledger downloads, and automated reorder alerts.' },
    { id: 'pillar-9', name: 'AI Sales Assistant', path: '/ai-sales-assistant', queryParam: '?page=ai-sales-assistant', keywords: KEYWORD_CLUSTERS.cluster7_AiSales.keywords, description: 'Field sales enablement mobile app providing instant catalog technical answers, margin guardrails, live inventory ATP checks, and instant RFQ approvals.' }
  ],
  industries: [
    { slug: 'manufacturing', path: '/industries/manufacturing', queryParam: '?page=manufacturing', name: 'Manufacturing', keywords: KEYWORD_CLUSTERS.cluster10_IndustryKeywords.manufacturing, description: 'AI Commerce Platform for Industrial Manufacturers featuring RFQ automation, SAP/Oracle ERP sync, dealer portals, and technical product search.' },
    { slug: 'distributors', path: '/industries/distributors', queryParam: '?page=distributors', name: 'Distributors', keywords: KEYWORD_CLUSTERS.cluster10_IndustryKeywords.distribution, description: 'B2B Wholesale Distributors AI Commerce Platform with matrix ordering, contract pricing, warehouse inventory visibility, and sales rep tools.' },
    { slug: 'wholesalers', path: '/industries/wholesalers', queryParam: '?page=wholesalers', name: 'Wholesalers', keywords: ['B2B Commerce Platform', 'Wholesale Commerce', 'Customer Portal Software'], description: 'AI Commerce for B2B Wholesalers featuring customer-specific pricing, automated credit approvals, bulk order management, and ERP sync.' },
    { slug: 'retailers', path: '/industries/retailers', queryParam: '?page=retail-commerce', name: 'Retailers', keywords: KEYWORD_CLUSTERS.cluster10_IndustryKeywords.retail, description: 'Retail AI Commerce Platform featuring AI shopping assistants, automated visual merchandising, omnichannel POS sync, and personalized recommendations.' },
    { slug: 'd2c-brands', path: '/industries/d2c-brands', queryParam: '?page=d2c-brands', name: 'D2C Brands', keywords: KEYWORD_CLUSTERS.cluster10_IndustryKeywords.d2c, description: 'Direct-to-Consumer AI Shopping Platform boosting store conversions with agentic assistants, dynamic pricing, and instant checkout.' },
    { slug: 'chemicals', path: '/industries/chemicals', queryParam: '?page=manufacturing#sector-chemicals', name: 'Chemicals & Specialty Compounds', keywords: ['AI Product Discovery Platform', 'Chemical SDS Search'], description: 'AI Commerce for chemical manufacturers with SDS document search, bulk drum pricing, purity spec search, and regulatory compliance.' },
    { slug: 'pharmaceuticals', path: '/industries/pharmaceuticals', queryParam: '?page=manufacturing#sector-pharmaceuticals', name: 'Pharmaceuticals & Cleanroom', keywords: ['Enterprise AI Platform', 'Pharma AI Commerce'], description: 'AI Commerce for pharma equipment, active ingredients, medical packaging, FDA validation docs, and GPO contract pricing.' },
    { slug: 'automotive', path: '/industries/automotive', queryParam: '?page=manufacturing#sector-automotive', name: 'Automotive Components & OEM', keywords: ['Dealer Portal Software', 'Automotive OEM Spares'], description: 'AI Commerce for OEM powertrain spares, chassis parts, EV battery modules, VIN/part cross-reference lookup, and dealer networks.' },
    { slug: 'electronics', path: '/industries/electronics', queryParam: '?page=manufacturing#sector-electronics', name: 'Electronics & Component Manufacturing', keywords: ['AI Product Discovery Platform', 'Electronic Component Search'], description: 'AI Product Discovery for semiconductors, PCB assemblies, connectors, parametric spec filters, and SMT supplies.' },
    { slug: 'paints-and-coatings', path: '/industries/paints-and-coatings', queryParam: '?page=manufacturing#sector-paints', name: 'Paints & Coatings', keywords: ['AI Commerce Platform', 'Industrial Coatings AI'], description: 'AI Commerce for industrial anti-corrosion coatings, architectural finishes, custom tinting calculations, and bulk container shipping.' },
    { slug: 'industrial-equipment', path: '/industries/industrial-equipment', queryParam: '?page=manufacturing#sector-industrial', name: 'Industrial Equipment & Machinery', keywords: ['Enterprise AI Commerce Platform', 'Machinery AI Sales'], description: 'AI Commerce for heavy machinery, pumps, valves, hydraulic systems, factory automation, and CAD drawing downloads.' }
  ],
  integrations: [
    { slug: 'shopify', path: '/integrations/shopify', queryParam: '?page=shopify-vs-silarai', name: 'Shopify & Shopify Plus', description: 'Native 1-click Shopify & Shopify Plus integration for AI Shopping Assistant, sub-50ms dynamic pricing, and automated visual merchandising.' },
    { slug: 'woocommerce', path: '/integrations/woocommerce', queryParam: '?page=woocommerce-vs-silarai', name: 'WooCommerce / WordPress', description: 'Native WooCommerce WordPress AI plugin providing instant conversational AI shopping, semantic catalog search, and revenue optimization.' }
  ],
  d2cKnowledgeGraph: D2C_KNOWLEDGE_GRAPH
};
