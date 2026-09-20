export interface SeoMetaRow {
  id: string;
  section: string;
  view: string;
  subPage?: number;
  category: 'Core Pillar' | 'Industry Solution' | 'Product Module' | 'Platform Comparison' | 'Company' | 'Sector Landing' | 'Use Case';
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
    seoTitle: 'SilarAI — Smart Commerce AI Platform | Build. Sell. Grow.',
    metaDescription: 'SilarAI is the premier Smart Commerce AI platform combining 24/7 agentic shopping assistants, sub-50ms dynamic pricing, and automated visual merchandising to maximize retail conversion and sales.',
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
    path: '/shopping-assistant',
    canonicalUrl: 'https://silarai.com/shopping-assistant',
    seoTitle: 'Agentic AI Voice & Conversational Search | SilarAI Shopping Assistant',
    metaDescription: 'Boost conversions with SilarAI Shopping Assistant. Features 20+ multi-language voice search, natural conversational product discovery, zero-hallucination vector catalog search, and 1-click agentic checkout.',
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
    seoTitle: 'Visual Search & Multimodal Product Discovery | SilarAI Assistant',
    metaDescription: 'Enable instant camera photo search with SilarAI Multimodal Visual Search. Shoppers snap pictures to find exact catalog matches, alternative styles, and in-stock variants in under 200 milliseconds.',
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
    seoTitle: 'Personalized Recommendations & One-Click Agent Checkout | SilarAI',
    metaDescription: 'Lift Average Order Value by 28% with SilarAI Personalized Recommendations and autonomous 1-click checkout. Deliver real-time complementary bundles and hyper-relevant cross-sells across all devices.',
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
    path: '/commerce-platform',
    canonicalUrl: 'https://silarai.com/commerce-platform',
    seoTitle: 'Real-Time Dynamic Pricing Engine | SilarAI Platform Engine',
    metaDescription: 'Maximize profit margins with SilarAI sub-50ms Dynamic Pricing Engine. Continuously recalculates optimal prices using real-time competitor intelligence, inventory elasticity, and buyer purchase intent.',
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
    seoTitle: 'Automated AI Visual Merchandising | SilarAI Platform Engine',
    metaDescription: 'Automate storefront merchandising with SilarAI. Reorders product grids dynamically based on live conversion propensity, stock levels, seasonality trends, and individual shopper browsing history.',
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
    seoTitle: 'Multi-Channel Inventory & Analytics Sync | SilarAI Platform Engine',
    metaDescription: 'Synchronize catalog, inventory, and analytics across web, social, and mobile channels in real time with SilarAI headless commerce APIs and unified cloud dashboard.',
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
    ctrHook: '+35% Conversion Lift • 65% Cart Recovery (Benchmark)',
    ctrShortDescription: '+35% D2C sales lift & 65% cart recovery (benchmark) via WhatsApp AI.',
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
    section: 'Why Choose SilarAI (ROI & Platform Benchmark)',
    view: 'why-choose-us',
    category: 'Platform Comparison' as const,
    path: '/why-choose-us',
    canonicalUrl: 'https://silarai.com/why-choose-us',
    seoTitle: 'Why Choose SilarAI? | 350% ROI Benchmark vs Legacy Tech Stacks',
    metaDescription: 'See why high-growth brands choose SilarAI: +380% conversion rate lift, sub-50ms pricing recalculations, and 15-minute zero-code script embed for Shopify, WooCommerce, and custom APIs.',
    primaryKeywords: [
      'Why SilarAI',
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
    section: 'Shopify vs SilarAI Technical Comparison',
    view: 'shopify-comparison',
    category: 'Platform Comparison' as const,
    path: '/shopify-vs-silarai',
    canonicalUrl: 'https://silarai.com/shopify-vs-silarai',
    seoTitle: 'SilarAI vs Shopify | Next-Gen Agentic Commerce Platform Comparison',
    metaDescription: 'Compare SilarAI vs Shopify: replace 10+ expensive monthly apps with one unified agentic AI platform. Enjoy sub-50ms dynamic pricing, native visual search, and zero theme bloat.',
    primaryKeywords: [
      'SilarAI vs Shopify',
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
    section: 'WooCommerce vs SilarAI Technical Comparison',
    view: 'woocommerce-comparison',
    category: 'Platform Comparison' as const,
    path: '/woocommerce-vs-silarai',
    canonicalUrl: 'https://silarai.com/woocommerce-vs-silarai',
    seoTitle: 'SilarAI vs WooCommerce | High-Performance AI Commerce Integration',
    metaDescription: 'Upgrade WooCommerce with SilarAI cloud-hosted AI engine. Eliminate slow WordPress plugin bloat with high-speed vector search, conversational buying assistants, and automated pricing.',
    primaryKeywords: [
      'SilarAI vs WooCommerce',
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
    section: 'About SilarAI (Company & AI Engineering Team)',
    view: 'about',
    category: 'Company' as const,
    path: '/about',
    canonicalUrl: 'https://silarai.com/about',
    seoTitle: 'About SilarAI | Enterprise Agentic AI Commerce Leader & Team',
    metaDescription: 'Meet the engineering and AI research team behind SilarAI. Pioneering autonomous agentic commerce, sub-50ms pricing engines, and enterprise SOC-2 retail infrastructure.',
    primaryKeywords: [
      'About SilarAI',
      'AI Commerce Engineering',
      'Agentic Retail AI Team',
      'SilarAI Research Lab',
      'Enterprise Commerce Infrastructure'
    ],
    searchIntent: 'Informational' as const,
    ctrHook: 'SOC-2 Certified • Enterprise AI Research',
    schemaType: 'AboutPage & Organization',
    rating: 4.98,
    reviewCount: 110
  },
  // 11 High-Authority Sector Landing Pages
  {
    id: 'sector-boutiques',
    section: 'Boutiques & Curated Apparel (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/boutiques',
    canonicalUrl: 'https://silarai.com/sector/boutiques',
    seoTitle: 'AI Commerce Platform for Boutiques & Curated Brands | Launch in 3 Hours | SilarAI',
    metaDescription: 'Launch your boutique and dual B2B2C store in under 3 hours. Features 24/7 AI Personal Stylist, instant sizing guidance, wholesale multi-tier buyer pricing, and zero custom code.',
    ctrShortDescription: 'Launch boutique store in 3 hrs with AI Stylist & B2B2C.',
    primaryKeywords: [
      'Boutique Ecommerce Platform',
      'B2B2C Store for Boutiques',
      'AI Shopping Assistant for Boutiques',
      'Launch Boutique Online Store',
      'Fashion AI Stylist'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Launch in 3 Hours • AI Personal Stylist • B2B2C Dual Tiers',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.97,
    reviewCount: 168
  },
  {
    id: 'sector-b2b2c',
    section: 'B2B2C Multi-Tier Marketplace & Storefront (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/b2b2c',
    canonicalUrl: 'https://silarai.com/sector/b2b2c',
    seoTitle: 'B2B2C Multi-Tier Marketplace & Storefront Platform | Turnkey Launch | SilarAI',
    metaDescription: 'Launch a turnkey dual-channel B2B2C storefront in 4 hours. Deliver consumer retail checkout, multi-tier wholesale pricing, sub-account dealer portals, and 1-click AI drop-in assistant.',
    ctrShortDescription: 'Launch B2B2C store in 4 hrs with dual wholesale & retail.',
    primaryKeywords: [
      'B2B2C Ecommerce Platform',
      'Multi-Tier Storefront Software',
      'Wholesale and Retail Portal',
      'Dual Channel Ecommerce AI',
      'Drop-in AI Shopping Assistant'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Live in 4 Hours • Dual Wholesale & Retail • Sub-50ms Pricing',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.98,
    reviewCount: 154
  },
  {
    id: 'sector-jeweller',
    section: 'Jewellers & Luxury Goods (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/jeweller',
    canonicalUrl: 'https://silarai.com/sector/jeweller',
    seoTitle: 'AI Luxury Commerce Platform for Jewellers & Fine Goods | 4Cs Assistant | SilarAI',
    metaDescription: 'Launch your luxury jewellery online store in 4 hours with high-touch conversational AI guiding 4Cs diamond education, certified hallmark security, and bespoke appointment bookings.',
    ctrShortDescription: 'Luxury jewellery AI store with 4Cs diamond assistant.',
    primaryKeywords: [
      'Jewellery Ecommerce Platform',
      'Luxury AI Shopping Assistant',
      'Diamond 4Cs AI Matcher',
      'Fine Jewellery Online Store',
      'High-Ticket AI Commerce'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '4Cs AI Education • High-Ticket Conversions • Custom Booking',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.96,
    reviewCount: 92
  },
  {
    id: 'sector-home-sellers',
    section: 'Home Decor, Furniture & Kitchenware (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/home-sellers',
    canonicalUrl: 'https://silarai.com/sector/home-sellers',
    seoTitle: 'AI Commerce Platform for Home Decor & Furniture Sellers | SilarAI',
    metaDescription: 'Launch home decor and furniture stores in 4 hours. Equip shoppers with conversational room dimension matchers, bundle suggestions, and real-time freight shipping calculations.',
    ctrShortDescription: 'Furniture & home decor AI store with dimension matching.',
    primaryKeywords: [
      'Home Decor Ecommerce Platform',
      'Furniture Online Store AI',
      'Room Dimension Matching AI',
      'Home Furnishings Storefront',
      'Bulky Goods Freight AI'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Room Dimension Matcher • Bundle Discovery • Zero Retainers',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.95,
    reviewCount: 88
  },
  {
    id: 'sector-beauty-brands',
    section: 'Beauty, Cosmetics & Skincare (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/beauty-brands',
    canonicalUrl: 'https://silarai.com/sector/beauty-brands',
    seoTitle: 'AI Beauty & Skincare Commerce Platform | Routine Matcher | SilarAI',
    metaDescription: 'Deploy an AI-powered cosmetics and skincare store in 3 hours with intelligent skin type diagnostic quiz, ingredient safety analyzer, and automated replenishment subscriptions.',
    ctrShortDescription: 'Beauty & skincare AI store with custom routine quiz.',
    primaryKeywords: [
      'Beauty Ecommerce Platform',
      'Skincare Routine AI Assistant',
      'Cosmetics Online Storefront',
      'Clean Beauty AI Recommendation',
      'Beauty Subscription Commerce'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Skin Diagnostic AI • 42% AOV Boost • Clean Beauty Matching',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.97,
    reviewCount: 134
  },
  {
    id: 'sector-food-packaging',
    section: 'Food Packaging & Restaurant Supplies (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/food-packaging',
    canonicalUrl: 'https://silarai.com/sector/food-packaging',
    seoTitle: 'B2B Food Packaging & Restaurant Supplies Commerce Platform | SilarAI',
    metaDescription: 'Launch B2B food packaging and restaurant supply stores in 4 hours with automated bulk tier pricing, sample request workflows, and recurring replenishment subscriptions.',
    ctrShortDescription: 'B2B food packaging store with bulk tier pricing & samples.',
    primaryKeywords: [
      'Food Packaging Ecommerce',
      'Restaurant Supply B2B Portal',
      'Bulk Tier Pricing Software',
      'Eco Packaging Storefront',
      'Wholesale Restaurant Supplies AI'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Bulk Tier Pricing • Instant Sample Requests • Recurring Orders',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.93,
    reviewCount: 76
  },
  {
    id: 'sector-handicrafts',
    section: 'Artisanal Handicrafts & Custom Goods (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/handicrafts',
    canonicalUrl: 'https://silarai.com/sector/handicrafts',
    seoTitle: 'Artisanal Handicrafts & Custom Goods AI Commerce Platform | SilarAI',
    metaDescription: 'Empower artisans and handmade crafters with a storefront launched in 3 hours featuring bespoke order specifications, artisan storytelling, and global currency checkout.',
    ctrShortDescription: 'Artisanal handicrafts AI store with custom order tools.',
    primaryKeywords: [
      'Handicrafts Ecommerce Platform',
      'Artisan Online Storefront',
      'Custom Handmade Goods AI',
      'Artisanal Direct-to-Consumer',
      'Handmade Craft Marketplace'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Artisan Storytelling • Custom Orders • Global Multi-Currency',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.96,
    reviewCount: 82
  },
  {
    id: 'sector-cosmetic-wellness',
    section: 'Cosmetic Wellness & Personal Care (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/cosmetic-wellness',
    canonicalUrl: 'https://silarai.com/sector/cosmetic-wellness',
    seoTitle: 'Cosmetics & Wellness AI Commerce Platform | Clean Beauty AI | SilarAI',
    metaDescription: 'Build personal care and wellness storefronts in under 3 hours with AI ingredient contraindication checks, regimen bundles, and frictionless mobile checkout.',
    ctrShortDescription: 'Wellness & personal care AI store with regimen bundles.',
    primaryKeywords: [
      'Cosmetic Wellness Ecommerce',
      'Personal Care Online Store',
      'Wellness Regimen AI Matcher',
      'Clean Cosmetics Storefront',
      'Health and Wellness Commerce'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Regimen Bundles • Contraindication AI • Fast Mobile Checkout',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.94,
    reviewCount: 95
  },
  {
    id: 'sector-small-medium-fmcg',
    section: 'Small-to-Medium FMCG & Packaged Goods (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/small-medium-fmcg',
    canonicalUrl: 'https://silarai.com/sector/small-medium-fmcg',
    seoTitle: 'FMCG & Packaged Goods AI Commerce Engine | Direct Retail Reorders | SilarAI',
    metaDescription: 'Equip emerging FMCG brands with rapid store deployment in 4 hours, WhatsApp quick-reorder bots, case-pack volume discounts, and route delivery tracking.',
    ctrShortDescription: 'FMCG AI commerce with WhatsApp reorder & case pack pricing.',
    primaryKeywords: [
      'FMCG Ecommerce Platform',
      'Packaged Goods Storefront',
      'WhatsApp Quick Reorder AI',
      'Case Pack Pricing Software',
      'Emerging Consumer Brands AI'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'WhatsApp Quick Reorders • Case Pack Pricing • 4-Hr Launch',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.95,
    reviewCount: 114
  },
  {
    id: 'sector-distributors',
    section: 'Distributors & Regional Trade Hubs (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/distributors',
    canonicalUrl: 'https://silarai.com/sector/distributors',
    seoTitle: 'AI Commerce Platform for Distributors & Supply Hubs | SilarAI',
    metaDescription: 'Modernize trade distribution with sub-50ms bulk order pricing, dealer credit limit management, automated ERP sync, and 24/7 AI stock inquiries.',
    ctrShortDescription: 'Distributor AI portal with live ERP & credit terms.',
    primaryKeywords: [
      'Distributor Ecommerce Portal',
      'Wholesale Trade Hub AI',
      'B2B Dealer Credit Management',
      'ERP Integrated Commerce',
      'Supply Chain Ordering AI'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Sub-50ms Bulk Pricing • Dealer Credit Lines • Live ERP Sync',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.98,
    reviewCount: 140
  },
  {
    id: 'sector-wholesalers',
    section: 'Wholesalers & Cash and Carry (Sector Landing)',
    view: 'sector-landing',
    category: 'Sector Landing' as const,
    path: '/sector/wholesalers',
    canonicalUrl: 'https://silarai.com/sector/wholesalers',
    seoTitle: 'High-Volume Wholesale & Cash & Carry Commerce Platform | SilarAI',
    metaDescription: 'Launch wholesale digital portals in 4 hours with minimum order quantity rules, tiered pallet discounts, automated tax exemption certificates, and net-term invoicing.',
    ctrShortDescription: 'High-volume wholesale AI portal with pallet tier pricing.',
    primaryKeywords: [
      'Wholesale Ecommerce Software',
      'Cash and Carry Digital Portal',
      'MOQ and Pallet Tier Pricing',
      'B2B Wholesale Invoicing AI',
      'Bulk Wholesale Order Engine'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: 'Pallet Tier Discounts • MOQ Enforcement • Net 30 Terms',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.97,
    reviewCount: 128
  },
  // 6 Curated AI Commerce Use Case Landing Pages
  {
    id: 'use-case-product-discovery',
    section: 'Product Discovery (Find the right product from complex catalogs)',
    view: 'use-cases',
    category: 'Use Case' as const,
    path: '/use-cases/product-discovery',
    canonicalUrl: 'https://silarai.com/use-cases/product-discovery',
    seoTitle: 'Product Discovery AI | Find the Right Product from Complex Catalogs | SilarAI',
    metaDescription: 'Help buyers find the right product from complex catalogs with SilarAI vector semantic search. Eliminates zero-result searches, understands technical specs, and boosts search conversions by 2.8x.',
    ctrShortDescription: 'Find the right product from complex catalogs with AI.',
    primaryKeywords: [
      'Product Discovery',
      'Find the right product from complex catalogs',
      'AI Product Discovery',
      'Semantic Vector Search E-commerce',
      'Complex Catalog Search AI',
      'Intent-Driven Product Finder',
      'Visual & Conversational Product Search',
      'Natural Language Product Search'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '2.8x Search Conversion • Zero Search Result Drop-offs',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.98,
    reviewCount: 184
  },
  {
    id: 'use-case-sales-assistant',
    section: 'AI Sales Assistant (Turn product conversations into sales)',
    view: 'use-cases',
    category: 'Use Case' as const,
    path: '/use-cases/sales-assistant',
    canonicalUrl: 'https://silarai.com/use-cases/sales-assistant',
    seoTitle: 'AI Sales Assistant | Turn Product Conversations into Sales | SilarAI',
    metaDescription: 'Turn product conversations into sales with SilarAI 24/7 autonomous sales assistant. Answers technical product questions, resolves buyer hesitation, and accelerates time-to-checkout by 3.4x.',
    ctrShortDescription: 'Turn product conversations into sales with 24/7 AI agent.',
    primaryKeywords: [
      'AI Sales Assistant',
      'Turn product conversations into sales',
      'Sales Assistant AI',
      'Conversational Commerce Assistant',
      'AI Shopping Co-pilot',
      'E-commerce Sales Agent',
      '24/7 AI Sales Representative',
      'Autonomous Sales Agent'
    ],
    searchIntent: 'Transactional' as const,
    ctrHook: '3.4x Faster Checkout • +38% Assisted Conversions',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.99,
    reviewCount: 210
  },
  {
    id: 'use-case-lead-generation',
    section: 'Lead Generation (Capture and qualify high-intent buyers)',
    view: 'use-cases',
    category: 'Use Case' as const,
    path: '/use-cases/lead-generation',
    canonicalUrl: 'https://silarai.com/use-cases/lead-generation',
    seoTitle: 'AI Lead Generation | Capture and Qualify High-Intent Buyers | SilarAI',
    metaDescription: 'Capture and qualify high-intent buyers automatically with SilarAI conversational intelligence. Delivers 3.2x higher capture rates over static web forms and syncs qualified leads with CRM instantly.',
    ctrShortDescription: 'Capture & qualify high-intent buyers with AI dialog.',
    primaryKeywords: [
      'Lead Generation',
      'Capture and qualify high-intent buyers',
      'AI Lead Generation',
      'Conversational Lead Capture',
      'Automated B2B Lead Qualification',
      'AI Lead Routing Engine',
      'High-Intent Buyer Capture',
      'Lead Intelligence AI'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '3.2x Lead Capture • 92% Qualification Accuracy',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.97,
    reviewCount: 165
  },
  {
    id: 'use-case-conversion-engine',
    section: 'Conversion & Cart Recovery (Turn more visitors into customers)',
    view: 'use-cases',
    category: 'Use Case' as const,
    path: '/use-cases/conversion-engine',
    canonicalUrl: 'https://silarai.com/use-cases/conversion-engine',
    seoTitle: 'Conversion & Cart Recovery | Turn More Visitors into Customers | SilarAI',
    metaDescription: 'Turn more visitors into customers with SilarAI conversion and cart recovery. Recovers 34% of abandoned carts across web and WhatsApp with personalized dynamic upselling and checkout incentives.',
    ctrShortDescription: 'Turn visitors into customers & recover abandoned carts.',
    primaryKeywords: [
      'Conversion & Cart Recovery',
      'Turn more visitors into customers',
      'AI Cart Abandonment Recovery',
      'WhatsApp Cart Recovery',
      'E-commerce Conversion Rate Optimization',
      'Personalized Dynamic Upselling',
      'Conversion Optimization AI'
    ],
    searchIntent: 'Transactional' as const,
    ctrHook: '+42% Conversion Lift • 34% Abandoned Carts Recovered',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.98,
    reviewCount: 192
  },
  {
    id: 'use-case-engagement-ai',
    section: 'Customer Engagement (Engage customers across web and WhatsApp)',
    view: 'use-cases',
    category: 'Use Case' as const,
    path: '/use-cases/engagement-ai',
    canonicalUrl: 'https://silarai.com/use-cases/engagement-ai',
    seoTitle: 'Customer Engagement AI | Engage Customers Across Web & WhatsApp | SilarAI',
    metaDescription: 'Engage customers across web and WhatsApp with SilarAI omnichannel commerce engine. Delivers personalized reorder alerts, VIP loyalty rewards, and automated messaging that increases repeat purchases by 65% (tested benchmark).',
    ctrShortDescription: 'Engage customers across web and WhatsApp with AI.',
    primaryKeywords: [
      'Customer Engagement',
      'Engage customers across web and WhatsApp',
      'Omnichannel Customer Engagement AI',
      'WhatsApp Commerce Engagement',
      'AI Customer Retention Engine',
      'Social Commerce AI Engagement',
      'Meta AI Shopping Engagement'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '+65% Repeat Purchases (Benchmark) • Unified Web & WhatsApp',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.96,
    reviewCount: 158
  },
  {
    id: 'use-case-b2b-commerce',
    section: 'B2B Commerce (Connect buyers, dealers, distributors and sales teams.)',
    view: 'use-cases',
    category: 'Use Case' as const,
    path: '/use-cases/b2b-commerce',
    canonicalUrl: 'https://silarai.com/use-cases/b2b-commerce',
    seoTitle: 'B2B Commerce Platform | Connect Buyers, Dealers & Sales Teams | SilarAI',
    metaDescription: 'Connect buyers, dealers, distributors and sales teams with SilarAI B2B commerce engine. Features custom contract pricing, Net-30 terms, automated RFQs, and ERP inventory synchronization.',
    ctrShortDescription: 'Connect buyers, dealers, distributors and sales teams.',
    primaryKeywords: [
      'B2B Commerce',
      'Connect buyers, dealers, distributors and sales teams',
      'B2B Commerce AI',
      'B2B Net Terms Portal',
      'Wholesale Ordering Engine',
      'Manufacturer & Distributor E-commerce',
      'Automated RFQ & Quote Generator',
      'B2B Digital Transformation'
    ],
    searchIntent: 'Commercial' as const,
    ctrHook: '75% Faster Wholesale Quotes • ERP & Net Terms Ready',
    schemaType: 'SoftwareApplication & Service',
    rating: 4.99,
    reviewCount: 220
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
export function findSeoMetaEntry(view: string, subPage?: number, sectorSlug?: string, useCaseSlug?: string): SeoMetaRow {
  // Use case landing match with slug
  if (useCaseSlug || view === 'use-cases' || view.startsWith('use-case')) {
    const slug = useCaseSlug || (view.startsWith('use-case-') ? view.replace('use-case-', '') : (view === 'use-cases' ? 'product-discovery' : view));
    const ucMatch = SEO_META_TABLE.find(
      (entry) =>
        entry.id === `use-case-${slug}` ||
        entry.path === `/use-cases/${slug}` ||
        entry.id.includes(slug)
    );
    if (ucMatch) return ucMatch;
  }

  // Sector landing match with slug
  if (view === 'sector-landing' && sectorSlug) {
    const sectorMatch = SEO_META_TABLE.find(
      (entry) => entry.id === `sector-${sectorSlug}` || entry.path === `/sector/${sectorSlug}`
    );
    if (sectorMatch) return sectorMatch;
  }

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

