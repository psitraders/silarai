export interface SeoMetaRow {
  id: string;
  section: string;
  view: string;
  subPage?: number;
  category: 'Core Pillar' | 'Industry Solution' | 'Product Module' | 'Platform Comparison' | 'Company';
  path: string;
  canonicalUrl: string;
  seoTitle: string;
  metaDescription: string;
  wordCount: number;
  charCount: number;
  ctrShortDescription?: string; // Strictly under 60 characters for maximum CTR on sub-pages
  shortCharCount?: number;
  primaryKeywords: string[];
  searchIntent: 'Commercial' | 'Transactional' | 'Informational';
  ctrHook: string;
  schemaType: string;
  rating: number;
  reviewCount: number;
}

export function countWords(str: string): number {
  return str.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean).length;
}

// Master SEO Meta Table across all sections of the website
// STRICT REQUIREMENT: Every meta description MUST be within 60 words.
export const RAW_SEO_META_ENTRIES = [
  {
    id: 'home',
    section: 'Homepage (Unified Platform Hub)',
    view: 'home',
    category: 'Core Pillar' as const,
    path: '/',
    canonicalUrl: 'https://silarai.com/',
    seoTitle: 'SilarAi — Smart Commerce AI Platform | Build. Sell. Grow.',
    metaDescription: 'SilarAi is the premier Smart Commerce AI platform combining 24/7 agentic shopping assistants, sub-50ms dynamic pricing, and automated visual merchandising to maximize retail conversion and sales.',
    primaryKeywords: [
      'Smart Commerce AI',
      'AI Shopping Assistant',
      'Dynamic Pricing AI',
      'Ecommerce AI Platform',
      'Conversational Commerce'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '+380% Conversion Lift • Sub-50ms Pricing',
    schemaType: 'SoftwareApplication & WebSite',
    rating: 4.94,
    reviewCount: 142
  },
  {
    id: 'ai-commerce-marketing-platform',
    section: 'AI Commerce & Marketing Platform (Central Pillar)',
    view: 'ai-commerce-marketing-platform',
    category: 'Core Pillar' as const,
    path: '/ai-commerce-marketing-platform/',
    canonicalUrl: 'https://silarai.com/ai-commerce-marketing-platform/',
    seoTitle: 'AI Commerce & Marketing Platform | Commerce Cloud & AI Engine | SilarAI',
    metaDescription: 'SilarAI is the enterprise AI Commerce & Marketing Platform uniting Commerce Cloud, AI Marketing Automation, Customer Intelligence, and 24/7 Conversational Shopping Assistants for B2B and B2C brands.',
    primaryKeywords: [
      'AI Commerce Platform',
      'AI Marketing Platform',
      'Commerce Cloud',
      'AI Marketing Automation',
      'AI Customer Intelligence'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Unified Commerce Cloud • 40 Key Cluster Mappings',
    schemaType: 'SoftwareApplication & WebPage',
    rating: 4.96,
    reviewCount: 142
  },
  {
    id: 'ai-shopping-assistant-voice',
    section: 'AI Shopping Assistant: Conversational & Voice',
    view: 'ai-shopping-assistant',
    subPage: 1,
    category: 'Product Module' as const,
    path: '/?page=ai-shopping-assistant&subPage=1',
    canonicalUrl: 'https://silarai.com/?page=ai-shopping-assistant&subPage=1',
    seoTitle: 'Agentic AI Voice & Conversational Search | SilarAi Shopping Assistant',
    metaDescription: 'Boost conversions with SilarAi Shopping Assistant. Features 20+ multi-language voice search, natural conversational product discovery, zero-hallucination vector catalog search, and 1-click agentic checkout.',
    primaryKeywords: [
      'AI Shopping Assistant',
      'Voice Commerce',
      'Conversational AI Search',
      'Agentic Checkout',
      'Multi-Language Voice Shopping'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '20+ Languages • Sub-second Voice Parsing',
    ctrShortDescription: '20+ language voice search AI. Instant 1-click checkout.',
    schemaType: 'SoftwareApplication',
    rating: 4.95,
    reviewCount: 128
  },
  {
    id: 'ai-shopping-assistant-visual',
    section: 'AI Shopping Assistant: Multimodal Visual Search',
    view: 'ai-shopping-assistant',
    subPage: 2,
    category: 'Product Module' as const,
    path: '/?page=ai-shopping-assistant&subPage=2',
    canonicalUrl: 'https://silarai.com/?page=ai-shopping-assistant&subPage=2',
    seoTitle: 'Visual Search & Multimodal Product Discovery | SilarAi Assistant',
    metaDescription: 'Enable instant camera photo search with SilarAi Multimodal Visual Search. Shoppers snap pictures to find exact catalog matches, alternative styles, and in-stock variants in under 200 milliseconds.',
    primaryKeywords: [
      'AI Visual Search',
      'Photo Camera Product Discovery',
      'Multimodal Shopping AI',
      'Image Product Search'
    ],
    searchIntent: 'Transactional' as const,
    ctrHook: 'Under 200ms Photo Match • 99.2% Accuracy',
    ctrShortDescription: 'Snap photos to find exact catalog matches in under 200ms.',
    schemaType: 'SoftwareApplication',
    rating: 4.93,
    reviewCount: 116
  },
  {
    id: 'ai-shopping-assistant-recommendations',
    section: 'AI Shopping Assistant: Personalized Recommendations',
    view: 'ai-shopping-assistant',
    subPage: 3,
    category: 'Product Module' as const,
    path: '/?page=ai-shopping-assistant&subPage=3',
    canonicalUrl: 'https://silarai.com/?page=ai-shopping-assistant&subPage=3',
    seoTitle: 'Personalized Recommendations & One-Click Agent Checkout | SilarAi',
    metaDescription: 'Lift Average Order Value by 28% with SilarAi Personalized Recommendations and autonomous 1-click checkout. Deliver real-time complementary bundles and hyper-relevant cross-sells across all devices.',
    primaryKeywords: [
      'AI Product Recommendations',
      'One-Click Agent Checkout',
      'Cross-Sell Bundling AI',
      'AOV Optimization'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '+28% AOV Lift • Autonomous Checkout',
    ctrShortDescription: '+28% AOV lift with AI recommendations & 1-click checkout.',
    schemaType: 'SoftwareApplication',
    rating: 4.96,
    reviewCount: 134
  },
  {
    id: 'ai-commerce-platform-pricing',
    section: 'AI Commerce Platform: Real-Time Dynamic Pricing',
    view: 'ai-commerce-platform',
    subPage: 1,
    category: 'Product Module' as const,
    path: '/?page=ai-commerce-platform&subPage=1',
    canonicalUrl: 'https://silarai.com/?page=ai-commerce-platform&subPage=1',
    seoTitle: 'Real-Time Dynamic Pricing Engine | SilarAi Platform Engine',
    metaDescription: 'Maximize profit margins with SilarAi sub-50ms Dynamic Pricing Engine. Continuously recalculates optimal prices using real-time competitor intelligence, inventory elasticity, and buyer purchase intent.',
    primaryKeywords: [
      'Dynamic Pricing Engine',
      'Sub-50ms Price Recalculation',
      'Margin Optimization AI',
      'Competitor Price Tracking'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Sub-50ms Edge Engine • Instant Margin Lift',
    ctrShortDescription: 'Sub-50ms AI dynamic pricing engine to maximize margins.',
    schemaType: 'SoftwareApplication',
    rating: 4.97,
    reviewCount: 140
  },
  {
    id: 'ai-commerce-platform-merchandising',
    section: 'AI Commerce Platform: Visual Merchandising',
    view: 'ai-commerce-platform',
    subPage: 2,
    category: 'Product Module' as const,
    path: '/?page=ai-commerce-platform&subPage=2',
    canonicalUrl: 'https://silarai.com/?page=ai-commerce-platform&subPage=2',
    seoTitle: 'Automated AI Visual Merchandising | SilarAi Platform Engine',
    metaDescription: 'Automate storefront merchandising with SilarAi. Reorders product grids dynamically based on live conversion propensity, stock levels, seasonality trends, and individual shopper browsing history.',
    primaryKeywords: [
      'AI Visual Merchandising',
      'Dynamic Product Grid Sort',
      'Automated Catalog Sorting',
      'Inventory-Aware Merchandising'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Self-Optimizing Grids • +41% Grid CTR',
    ctrShortDescription: 'Automated AI visual merchandising. Lift grid CTR by +41%.',
    schemaType: 'SoftwareApplication',
    rating: 4.94,
    reviewCount: 98
  },
  {
    id: 'ai-commerce-platform-sync',
    section: 'AI Commerce Platform: Multi-Channel Inventory Sync',
    view: 'ai-commerce-platform',
    subPage: 3,
    category: 'Product Module' as const,
    path: '/?page=ai-commerce-platform&subPage=3',
    canonicalUrl: 'https://silarai.com/?page=ai-commerce-platform&subPage=3',
    seoTitle: 'Multi-Channel Inventory & Analytics Sync | SilarAi Platform Engine',
    metaDescription: 'Synchronize catalog, inventory, and analytics across web, social, and mobile channels in real time with SilarAi headless commerce APIs and unified cloud dashboard.',
    primaryKeywords: [
      'Multi-Channel Inventory Sync',
      'Headless Commerce APIs',
      'Real-Time Omnichannel Sync',
      'Catalog Analytics Engine'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '99.99% Uptime • Zero Stockout Discrepancy',
    ctrShortDescription: 'Real-time multi-channel inventory sync & live analytics.',
    schemaType: 'SoftwareApplication',
    rating: 4.92,
    reviewCount: 105
  },
  {
    id: 'retail-commerce',
    section: 'Retail Commerce AI Platform',
    view: 'retail-commerce',
    category: 'Industry Solution' as const,
    path: '/?page=retail-commerce',
    canonicalUrl: 'https://silarai.com/?page=retail-commerce',
    seoTitle: 'AI Commerce Platform for Retail | AI Shopping Assistant | SilarAI',
    metaDescription: 'Transform retail storefronts with SilarAI omnichannel commerce engine: AI shopping assistants, sub-second product search, personalized recommendations, live inventory visibility, and automated customer support.',
    primaryKeywords: [
      'Retail AI Platform',
      'AI Commerce Platform for Retail',
      'Omnichannel Retail AI',
      'Retail Shopping Assistant',
      'Store Inventory Visibility'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Omnichannel Ready • Unified Store & Web Sync',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.95,
    reviewCount: 184
  },
  {
    id: 'd2c-brands',
    section: 'D2C Brands AI Commerce (Master Suite)',
    view: 'd2c-brands',
    category: 'Industry Solution' as const,
    path: '/industries/d2c-brands',
    canonicalUrl: 'https://silarai.com/industries/d2c-brands',
    seoTitle: 'AI Commerce Platform for D2C Brands | AI Shopping Assistant | SilarAI',
    metaDescription: 'Accelerate D2C sales with SilarAI AI Shopping Assistant and Commerce Platform. Guide shoppers, compare products, recover abandoned carts on WhatsApp, and boost conversions by +35%.',
    primaryKeywords: [
      'AI Commerce Platform for D2C Brands',
      'D2C AI Shopping Assistant',
      'D2C Cart Recovery AI',
      'WhatsApp Conversational Commerce',
      'D2C Sales Assistant'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '+35% Checkout Completion • 15-Min Setup',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.97,
    reviewCount: 250
  },
  {
    id: 'd2c-brands-assistant',
    section: 'D2C AI Shopping Assistant',
    view: 'd2c-brands',
    subPage: 1,
    category: 'Industry Solution' as const,
    path: '/industries/d2c-brands/ai-shopping-assistant',
    canonicalUrl: 'https://silarai.com/industries/d2c-brands/ai-shopping-assistant',
    seoTitle: 'AI Shopping Assistant for D2C Brands | SilarAI',
    metaDescription: 'Empower D2C shoppers with conversational AI guidance. Delivers instant product recommendations, answers sizing and specification questions, and streamlines 1-click checkout across web and mobile.',
    primaryKeywords: [
      'AI Shopping Assistant for D2C Brands',
      'Conversational Commerce for D2C',
      'D2C Product Discovery AI',
      'WhatsApp AI Sales Assistant'
    ],
    searchIntent: 'Transactional' as const,
    ctrHook: 'Zero Hallucinations • Natural Language Fit Matching',
    ctrShortDescription: 'D2C AI shopping assistant. Zero-hallucination fit match.',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.97,
    reviewCount: 230
  },
  {
    id: 'd2c-brands-platform',
    section: 'D2C AI Commerce Platform Engine',
    view: 'd2c-brands',
    subPage: 2,
    category: 'Industry Solution' as const,
    path: '/industries/d2c-brands/ai-commerce-platform',
    canonicalUrl: 'https://silarai.com/industries/d2c-brands/ai-commerce-platform',
    seoTitle: 'AI Commerce Platform for D2C Brands | SilarAI',
    metaDescription: 'Scale direct-to-consumer revenue with SilarAI intelligent commerce platform: semantic product discovery, AI sales assistance, real-time customer engagement, and predictive customer cohort intelligence.',
    primaryKeywords: [
      'AI Commerce Platform for D2C Brands',
      'D2C Ecommerce Platform AI',
      'AI Product Search D2C',
      'Customer Cohort Intelligence'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Real-Time Intent Tracking • +28% Higher AOV',
    ctrShortDescription: 'D2C AI commerce engine: real-time intent & +28% AOV lift.',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.98,
    reviewCount: 240
  },
  {
    id: 'd2c-brands-sales',
    section: 'D2C Sales Optimization & Cart Recovery',
    view: 'd2c-brands',
    subPage: 3,
    category: 'Industry Solution' as const,
    path: '/industries/d2c-brands/increase-sales-with-ai',
    canonicalUrl: 'https://silarai.com/industries/d2c-brands/increase-sales-with-ai',
    seoTitle: 'How AI Can Increase D2C Ecommerce Sales | SilarAI',
    metaDescription: 'Unlock 35% higher D2C conversion rates with SilarAI. Recover lost carts automatically via WhatsApp, lift AOV with AI bundling, and convert hesitant visitors into repeat buyers 24/7.',
    primaryKeywords: [
      'AI for D2C Sales',
      'How AI Can Increase D2C Ecommerce Sales',
      'AI Cart Recovery',
      'Automated WhatsApp Re-engagement'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '+35% Conversion Boost • 65% Cart Recovery Rate',
    ctrShortDescription: '+35% D2C sales lift & 65% cart recovery via WhatsApp AI.',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.96,
    reviewCount: 215
  },
  {
    id: 'distributors',
    section: 'Distributors AI B2B Commerce Platform',
    view: 'distributors',
    category: 'Industry Solution' as const,
    path: '/?page=distributors',
    canonicalUrl: 'https://silarai.com/?page=distributors',
    seoTitle: 'AI Commerce Platform for Distributors | AI Shopping Assistant | SilarAI',
    metaDescription: 'Modernize wholesale distribution with SilarAI B2B commerce platform: dealer self-service portals, customer-specific contract pricing, ERP inventory visibility, and conversational AI ordering.',
    primaryKeywords: [
      'AI Commerce Platform for Distributors',
      'Dealer Portal Software',
      'B2B Distribution Commerce',
      'Customer-Specific Pricing AI',
      'ERP Integrated Ordering'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Instant ERP Sync • Contract Matrix Pricing',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.97,
    reviewCount: 192
  },
  {
    id: 'wholesalers',
    section: 'Wholesalers AI B2B Platform',
    view: 'wholesalers',
    category: 'Industry Solution' as const,
    path: '/?page=wholesalers',
    canonicalUrl: 'https://silarai.com/?page=wholesalers',
    seoTitle: 'AI Commerce Platform for Wholesalers | B2B AI Shopping Assistant | SilarAI',
    metaDescription: 'Scale wholesale operations with SilarAI B2B commerce suite: automated RFQ workflows, matrix bulk ordering, multi-tier dealer pricing, and seamless SAP, Oracle, and Dynamics ERP integrations.',
    primaryKeywords: [
      'AI Commerce Platform for Wholesalers',
      'Wholesale Ordering Platform',
      'Wholesale RFQ Automation',
      'Wholesale ERP Integration',
      'Matrix Bulk Reorders'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Automated RFQ Routing • ERP Connected',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.98,
    reviewCount: 210
  },
  {
    id: 'manufacturing',
    section: 'Manufacturing AI Commerce Platform (Master)',
    view: 'manufacturing',
    category: 'Industry Solution' as const,
    path: '/industries/manufacturing',
    canonicalUrl: 'https://silarai.com/industries/manufacturing',
    seoTitle: 'AI Commerce Platform for Manufacturers | B2B AI Assistant | SilarAI',
    metaDescription: 'Empower industrial manufacturers with SilarAI B2B AI commerce platform: automated RFQs, technical specification search, dealer ordering portals, and real-time ERP/CRM workflow synchronizations.',
    primaryKeywords: [
      'AI Commerce Platform for Manufacturing',
      'Manufacturing Ecommerce Platform',
      'Manufacturing RFQ Software',
      'Dealer Portal for Manufacturers',
      'Industrial AI Shopping Assistant'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Technical Spec Parsing • Live ATP Checks',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.99,
    reviewCount: 245
  },
  {
    id: 'manufacturing-platform',
    section: 'Manufacturing AI Commerce Platform',
    view: 'manufacturing',
    subPage: 1,
    category: 'Industry Solution' as const,
    path: '/industries/manufacturing/ai-commerce-platform',
    canonicalUrl: 'https://silarai.com/industries/manufacturing/ai-commerce-platform',
    seoTitle: 'AI Commerce Platform for Manufacturing | SilarAI',
    metaDescription: 'Digitize manufacturing sales with SilarAI: conversational technical product discovery, automated quotation generation, dealer account management, and enterprise-grade ERP connectivity.',
    primaryKeywords: [
      'AI Commerce Platform for Manufacturing',
      'B2B Ecommerce for Manufacturers',
      'Manufacturing Quotation Software',
      'ERP Connected Catalog'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Compliant with SAP & Oracle • Automated Quotes',
    ctrShortDescription: 'B2B manufacturing commerce with SAP, Oracle & live RFQs.',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.99,
    reviewCount: 260
  },
  {
    id: 'manufacturing-assistant',
    section: 'Manufacturing AI Shopping & Sales Assistant',
    view: 'manufacturing',
    subPage: 2,
    category: 'Industry Solution' as const,
    path: '/industries/manufacturing/ai-shopping-sales-assistant',
    canonicalUrl: 'https://silarai.com/industries/manufacturing/ai-shopping-sales-assistant',
    seoTitle: 'AI Shopping Assistant for Manufacturers | SilarAI',
    metaDescription: 'Enable engineers and buyers to search complex industrial catalogs using natural language. SilarAI converts technical requirements into structured RFQs with live inventory checks.',
    primaryKeywords: [
      'AI Shopping Assistant for Manufacturers',
      'Industrial AI Product Discovery',
      'CAD & Spec Search AI',
      'B2B AI Sales Assistant'
    ],
    searchIntent: 'Transactional' as const,
    ctrHook: 'Natural Language Spec Match • Instant RFQ Convert',
    ctrShortDescription: 'Industrial AI spec search. Turn CAD queries into RFQs.',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.98,
    reviewCount: 240
  },
  {
    id: 'manufacturing-dealer-distributor',
    section: 'Manufacturing Dealer & Distributor Commerce',
    view: 'manufacturing',
    subPage: 3,
    category: 'Industry Solution' as const,
    path: '/industries/manufacturing/dealer-distributor-commerce',
    canonicalUrl: 'https://silarai.com/industries/manufacturing/dealer-distributor-commerce',
    seoTitle: 'AI Dealer & Distributor Commerce Platform | SilarAI',
    metaDescription: 'Transform dealer networks with SilarAI AI dealer portal: self-service bulk orders, territory pricing, exploded parts diagram discovery, and automated ERP order dispatching.',
    primaryKeywords: [
      'AI Dealer Portal for Manufacturers',
      'Distributor Ordering Platform',
      'Spare Parts Diagram Discovery',
      'Territory Contract Pricing'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Territory Margin Control • Exploded Parts Search',
    ctrShortDescription: 'AI dealer portal for manufacturers with ERP bulk orders.',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.99,
    reviewCount: 255
  },
  {
    id: 'fmcg-commerce',
    section: 'FMCG & CPG Consumer Brands Commerce',
    view: 'fmcg-commerce',
    category: 'Industry Solution' as const,
    path: '/?page=fmcg-commerce',
    canonicalUrl: 'https://silarai.com/?page=fmcg-commerce',
    seoTitle: 'AI Commerce Platform for FMCG & CPG Brands | SilarAI',
    metaDescription: 'Supercharge fast-moving consumer goods brands with SilarAI AI commerce engine: instant reorders, predictive replenishment alerts, localized inventory visibility, and high-converting conversational shopping.',
    primaryKeywords: [
      'FMCG AI Commerce',
      'CPG Brands Ecommerce AI',
      'Predictive Replenishment AI',
      'Quick Commerce Conversational AI',
      'FMCG Reorder Engine'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Automated 1-Click Replenishment • Hyper-Local Stock',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.96,
    reviewCount: 168
  },
  {
    id: 'why-choose-us',
    section: 'Why Choose SilarAi (ROI & Platform Benchmark)',
    view: 'why-choose-us',
    category: 'Platform Comparison' as const,
    path: '/why-choose-us',
    canonicalUrl: 'https://silarai.com/why-choose-us',
    seoTitle: 'Why Choose SilarAi? | 350% ROI Benchmark vs Legacy Tech Stacks',
    metaDescription: 'See why high-growth brands choose SilarAi: +380% conversion rate lift, sub-50ms pricing recalculations, and 15-minute zero-code script embed for Shopify, WooCommerce, and custom APIs.',
    primaryKeywords: [
      'Why SilarAi',
      'Ecommerce AI ROI',
      'Best AI Shopping Assistant',
      'Smart Commerce Platform Advantages',
      'Retail Conversion Benchmark'
    ],
    searchIntent: 'Informational' as const,
    ctrHook: '350% Verifiable ROI • 15-Min Zero-Code Setup',
    schemaType: 'WebPage & Article',
    rating: 4.98,
    reviewCount: 190
  },
  {
    id: 'shopify-comparison',
    section: 'Shopify vs SilarAi Technical Comparison',
    view: 'shopify-comparison',
    category: 'Platform Comparison' as const,
    path: '/shopify-vs-silarai',
    canonicalUrl: 'https://silarai.com/shopify-vs-silarai',
    seoTitle: 'SilarAi vs Shopify | Next-Gen Agentic Commerce Platform Comparison',
    metaDescription: 'Compare SilarAi vs Shopify: replace 10+ expensive monthly apps with one unified agentic AI platform. Enjoy sub-50ms dynamic pricing, native visual search, and zero theme bloat.',
    primaryKeywords: [
      'SilarAi vs Shopify',
      'Shopify Alternative',
      'AI Commerce vs Shopify',
      'Shopify App Consolidation',
      'Shopify AI Upgrade'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Save 60% App Fees • 0% Storefront Lag',
    schemaType: 'TechArticle',
    rating: 4.97,
    reviewCount: 175
  },
  {
    id: 'woocommerce-comparison',
    section: 'WooCommerce vs SilarAi Technical Comparison',
    view: 'woocommerce-comparison',
    category: 'Platform Comparison' as const,
    path: '/woocommerce-vs-silarai',
    canonicalUrl: 'https://silarai.com/woocommerce-vs-silarai',
    seoTitle: 'SilarAi vs WooCommerce | High-Performance AI Commerce Integration',
    metaDescription: 'Upgrade WooCommerce with SilarAi cloud-hosted AI engine. Eliminate slow WordPress plugin bloat with high-speed vector search, conversational buying assistants, and automated pricing.',
    primaryKeywords: [
      'SilarAi vs WooCommerce',
      'WooCommerce AI Plugin Alternative',
      'Headless WooCommerce AI',
      'WooCommerce Speed Optimization'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '10x Faster Search • Zero Plugin Database Lockups',
    schemaType: 'TechArticle',
    rating: 4.96,
    reviewCount: 162
  },
  {
    id: 'about',
    section: 'About SilarAi (Company & AI Engineering Team)',
    view: 'about',
    category: 'Company' as const,
    path: '/about',
    canonicalUrl: 'https://silarai.com/about',
    seoTitle: 'About SilarAi | Enterprise Agentic AI Commerce Leader & Team',
    metaDescription: 'Meet the engineering and AI research team behind SilarAi. Pioneering autonomous agentic commerce, sub-50ms pricing engines, and enterprise SOC-2 retail infrastructure.',
    primaryKeywords: [
      'About SilarAi',
      'AI Commerce Engineering',
      'Agentic Retail AI Team',
      'SilarAi Research Lab',
      'Enterprise Commerce Infrastructure'
    ],
    searchIntent: 'Informational' as const,
    ctrHook: 'SOC-2 Certified • Enterprise AI Research',
    schemaType: 'AboutPage & Organization',
    rating: 4.98,
    reviewCount: 110
  }
];

// Computed SEO Meta Table with exact word and character counts
export const SEO_META_TABLE: SeoMetaRow[] = RAW_SEO_META_ENTRIES.map((entry) => {
  const wordCount = countWords(entry.metaDescription);
  const charCount = entry.metaDescription.length;
  const shortCharCount = entry.ctrShortDescription ? entry.ctrShortDescription.length : undefined;

  if (wordCount > 60) {
    console.warn(`[SEO Warning] Entry ${entry.id} exceeds 60 words: ${wordCount} words`);
  }

  if (entry.ctrShortDescription && entry.ctrShortDescription.length >= 60) {
    console.warn(`[SEO Warning] Entry ${entry.id} short meta exceeds 60 chars: ${entry.ctrShortDescription.length} chars`);
  }

  return {
    ...entry,
    wordCount,
    charCount,
    shortCharCount
  };
});

// Summary stats for SEO inspection
export const SEO_META_TABLE_SUMMARY = {
  totalSections: SEO_META_TABLE.length,
  maxWords: Math.max(...SEO_META_TABLE.map((e) => e.wordCount)),
  minWords: Math.min(...SEO_META_TABLE.map((e) => e.wordCount)),
  avgWords: Math.round(
    SEO_META_TABLE.reduce((acc, curr) => acc + curr.wordCount, 0) / SEO_META_TABLE.length
  ),
  isCompliantWith60WordRule: SEO_META_TABLE.every((e) => e.wordCount <= 60),
  allSubPagesUnder60Chars: SEO_META_TABLE.filter((e) => e.subPage !== undefined).every(
    (e) => !e.ctrShortDescription || e.ctrShortDescription.length < 60
  ),
  categories: Array.from(new Set(SEO_META_TABLE.map((e) => e.category))),
  totalTargetKeywords: Array.from(
    new Set(SEO_META_TABLE.flatMap((e) => e.primaryKeywords))
  ).length
};

// Lookup helper to retrieve specific section metadata
export function findSeoMetaEntry(view: string, subPage?: number): SeoMetaRow {
  // Try exact match with subPage if provided
  if (subPage !== undefined) {
    const matchWithSub = SEO_META_TABLE.find(
      (entry) => entry.view === view && entry.subPage === subPage
    );
    if (matchWithSub) return matchWithSub;
  }

  // Try matching view without subPage or master view
  const matchView = SEO_META_TABLE.find(
    (entry) => entry.view === view && entry.subPage === undefined
  );
  if (matchView) return matchView;

  // Fallback to any entry with that view
  const anyMatch = SEO_META_TABLE.find((entry) => entry.view === view);
  if (anyMatch) return anyMatch;

  // Fallback to homepage entry
  return SEO_META_TABLE[0];
}
