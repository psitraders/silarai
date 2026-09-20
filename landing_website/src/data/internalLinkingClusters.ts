export interface InternalLinkItem {
  title: string;
  anchorText: string;
  path: string;
  view: string;
  category: 'Core Pillar' | 'Industry Vertical' | 'Platform Comparison' | 'Strategic Architecture';
  badge: string;
  description: string;
  iconName: 'Bot' | 'ShoppingBag' | 'Cpu' | 'Layers' | 'Building2' | 'Workflow' | 'Zap' | 'Sparkles' | 'BarChart3' | 'Boxes' | 'ShieldCheck' | 'Globe';
  options?: {
    pageId?: number;
    subPageId?: number;
    section?: string;
  };
}

export interface PageInternalCluster {
  pageKey: string;
  pageTitle: string;
  pagePath: string;
  clusterTheme: string;
  description: string;
  links: InternalLinkItem[]; // Exactly 8 curated links
}

export const INTERNAL_LINKING_CLUSTERS: Record<string, PageInternalCluster> = {
  'home': {
    pageKey: 'home',
    pageTitle: 'SilarAI Smart Commerce AI Platform',
    pagePath: '/',
    clusterTheme: 'Ecosystem Overview & Core Solutions',
    description: 'Foundational commerce pillars, vertical industry engines, and native integration connectors across the SilarAI platform.',
    links: [
      {
        title: 'AI Shopping Assistant',
        anchorText: 'Explore 24/7 AI Shopping Assistant & Conversational Agent',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Conversational Buying',
        description: 'Autonomous conversational commerce agent guiding shoppers from discovery to instant 1-click checkout.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'AI Commerce Platform',
        anchorText: 'Discover Core AI Commerce & Dynamic Pricing Engine',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Dynamic Pricing',
        description: 'Headless, high-velocity digital commerce foundation with sub-50ms pricing and automated catalog synchronization.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Unify Commerce with Autonomous AI Marketing Automation',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Marketing Cloud',
        description: 'Enterprise umbrella connecting automated promotional campaigns, predictive RFM segmentation, and multi-channel reach.',
        iconName: 'Workflow'
      },
      {
        title: 'Shopify vs SilarAI',
        anchorText: 'Compare SilarAI vs Shopify Plus Native AI Architecture',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Headless Sync',
        description: 'Side-by-side speed, cost, and AI agent capability comparison for high-volume Shopify merchants.',
        iconName: 'Layers'
      },
      {
        title: 'WooCommerce vs SilarAI',
        anchorText: 'Compare SilarAI Headless Engine with Legacy WooCommerce',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WordPress Speed',
        description: 'Modern API-first solution replacing heavy PHP catalog plugins with instant vector-powered search.',
        iconName: 'Zap'
      },
      {
        title: 'Retail Commerce Solutions',
        anchorText: 'Implement Omnichannel Retail AI for Storefronts & POS',
        path: '/industries/retailers',
        view: 'retail-commerce',
        category: 'Industry Vertical',
        badge: 'Omnichannel POS',
        description: 'Unified inventory visibility, digital visual merchandising, and in-store conversational sales enablement.',
        iconName: 'ShoppingBag'
      },
      {
        title: 'D2C Brands AI Platform',
        anchorText: 'Accelerate D2C Direct Storefront Revenue with AI Agents',
        path: '/industries/d2c-brands',
        view: 'd2c-brands',
        category: 'Industry Vertical',
        badge: 'Direct-to-Consumer',
        description: 'Tailored conversion optimization, automated WhatsApp cart re-engagement, and 1-to-1 personalization.',
        iconName: 'Sparkles'
      },
      {
        title: 'Why Choose SilarAI',
        anchorText: 'Review SilarAI Architectural Benchmark & Performance Proof',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'ROI Proof',
        description: 'Comprehensive technical review of speed benchmarks, lower total cost of ownership, and native AI integration.',
        iconName: 'ShieldCheck'
      }
    ]
  },

  'about': {
    pageKey: 'about',
    pageTitle: 'About SilarAI & Leadership Team',
    pagePath: '/about',
    clusterTheme: 'Company Mission, Architectural Vision & Innovation',
    description: 'Explore the vision, core engineering pillars, and strategic industry vertical solutions pioneered by SilarAI.',
    links: [
      {
        title: 'AI Commerce Platform',
        anchorText: 'Review the Core AI Commerce Platform Architecture',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Dynamic Pricing',
        description: 'The high-throughput commerce kernel engineering team that powers modern digital storefronts.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Shopping Assistant',
        anchorText: 'Experience Conversational AI Shopping Assistant',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Autonomous Agent',
        description: 'Our proprietary natural language buying agent delivering 24/7 clienteling and 1-click checkout.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'Why Choose SilarAI',
        anchorText: 'Understand SilarAI Architecture vs Legacy Monoliths',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Architectural Edge',
        description: 'Why modern enterprises choose SilarAI for 3x conversion lift and sub-50ms response times.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Explore Autonomous Marketing & Growth Automation',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Growth Engine',
        description: 'AI-driven campaign automation, continuous RFM segmentation, and cross-channel merchandising.',
        iconName: 'Workflow'
      },
      {
        title: 'Shopify Integration Architecture',
        anchorText: 'Learn How SilarAI Augments Shopify Stores',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Storefront Embed',
        description: 'How we provide Shopify merchants with enterprise dynamic pricing and conversational buying.',
        iconName: 'Layers'
      },
      {
        title: 'WooCommerce Integration Guide',
        anchorText: 'Accelerate WordPress Stores with SilarAI Headless API',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WordPress Speed',
        description: 'Overcoming WooCommerce database bottlenecks with offloaded AI search and pricing logic.',
        iconName: 'Zap'
      },
      {
        title: 'D2C Industry Solutions',
        anchorText: 'See D2C Brand Transformations Powered by SilarAI',
        path: '/industries/d2c-brands',
        view: 'd2c-brands',
        category: 'Industry Vertical',
        badge: 'D2C Growth',
        description: 'How high-growth consumer brands scale repeat orders and reduce abandoned carts.',
        iconName: 'Sparkles'
      },
      {
        title: 'Contact & Demonstration Portal',
        anchorText: 'Connect with SilarAI Solution Architects',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Get in Touch',
        description: 'Request a customized architectural walkthrough and benchmark evaluation for your store.',
        iconName: 'Building2'
      }
    ]
  },

  'why-choose-us': {
    pageKey: 'why-choose-us',
    pageTitle: 'Why Choose SilarAI - Modern Platform Comparison',
    pagePath: '/why-choose-us',
    clusterTheme: 'Comparative Benchmarks & Architecture Evaluation',
    description: 'Deep dive into performance benchmarks, native vs bolt-on AI comparisons, and enterprise migration paths.',
    links: [
      {
        title: 'Shopify vs SilarAI Comparison',
        anchorText: 'Read Full Shopify Plus vs SilarAI Technical Benchmark',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Shopify vs SilarAI',
        description: 'Detailed analysis of API throughput, native AI integration, and total cost of ownership.',
        iconName: 'Layers'
      },
      {
        title: 'WooCommerce vs SilarAI Comparison',
        anchorText: 'Evaluate WooCommerce vs SilarAI Database Scalability',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WooCommerce vs SilarAI',
        description: 'Comparing WordPress MySQL bottlenecks against SilarAI sub-50ms vector query execution.',
        iconName: 'Zap'
      },
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Examine SilarAI Headless Commerce Engine',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Commerce Engine',
        description: 'The foundation powering automated catalog updates, RFQ workflows, and real-time ATP stock.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Shopping Assistant',
        anchorText: 'Discover 24/7 AI Shopping Agent Capabilities',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Conversion Agent',
        description: 'Natural language product recommendations that drive +35% conversion lifts over static filters.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Explore SilarAI Unified Marketing Automation Cloud',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Marketing Cloud',
        description: 'Unified product taxonomy, 40-keyword cluster indexing, and predictive buyer retention.',
        iconName: 'Workflow'
      },
      {
        title: 'D2C Brands AI Platform',
        anchorText: 'Explore High-Growth D2C Brand Implementations',
        path: '/industries/d2c-brands',
        view: 'd2c-brands',
        category: 'Industry Vertical',
        badge: 'D2C Commerce',
        description: 'How fast-scaling consumer brands eliminate manual merchandising and boost customer LTV.',
        iconName: 'Sparkles'
      },
      {
        title: 'Manufacturing AI Commerce',
        anchorText: 'Discover Manufacturing RFQ & Dealer Portal Architecture',
        path: '/industries/manufacturing',
        view: 'manufacturing',
        category: 'Industry Vertical',
        badge: 'B2B Manufacturing',
        description: 'Configurable BOM quoting, spare part vector matching, and ERP synchronization.',
        iconName: 'Boxes'
      },
      {
        title: 'About SilarAI Leadership',
        anchorText: 'Learn About the Vision & Engineering Behind SilarAI',
        path: '/about',
        view: 'about',
        category: 'Strategic Architecture',
        badge: 'Company Story',
        description: 'Our engineering philosophy, global infrastructure footprint, and AI research commitment.',
        iconName: 'Globe'
      }
    ]
  },

  'shopify-comparison': {
    pageKey: 'shopify-comparison',
    pageTitle: 'Shopify vs SilarAI Platform Comparison',
    pagePath: '/shopify-vs-silarai',
    clusterTheme: 'Shopify Migration, Integration & Alternative Architecture',
    description: 'Explore how high-volume merchants upgrade from rigid Shopify app stacks to SilarAI native AI architecture.',
    links: [
      {
        title: 'AI Shopping Assistant',
        anchorText: 'Embed SilarAI Conversational Assistant into Shopify',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: '1-Click Embed',
        description: 'Add our 24/7 buying agent to existing Shopify stores via simple script tag or headless API.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Discover SilarAI Enterprise Dynamic Pricing Engine',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Headless Core',
        description: 'Upgrade to millisecond-grade price recalculation and automated catalog sync beyond Shopify limits.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'WooCommerce vs SilarAI',
        anchorText: 'Compare WooCommerce Architecture vs SilarAI',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WordPress Comparison',
        description: 'See how SilarAI also provides a faster, modern headless alternative for WooCommerce stores.',
        iconName: 'Zap'
      },
      {
        title: 'Why Choose SilarAI',
        anchorText: 'Analyze Speed Benchmarks & Total Cost of Ownership',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Architectural Edge',
        description: 'Detailed financial and technical breakdown of app subscription bloat versus unified AI.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'D2C Brands AI Platform',
        anchorText: 'Explore D2C Storefront Scaling with SilarAI',
        path: '/industries/d2c-brands',
        view: 'd2c-brands',
        category: 'Industry Vertical',
        badge: 'D2C Ecommerce',
        description: 'Eliminate cart abandonment with WhatsApp follow-ups, dynamic bundles, and instant checkout.',
        iconName: 'Sparkles'
      },
      {
        title: 'Retail Omnichannel Commerce',
        anchorText: 'Connect Physical Stores & Shopify Digital Catalogs',
        path: '/industries/retailers',
        view: 'retail-commerce',
        category: 'Industry Vertical',
        badge: 'Omnichannel POS',
        description: 'Synchronize brick-and-mortar point-of-sale inventory with online AI shopping assistants.',
        iconName: 'ShoppingBag'
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Supercharge Marketing Automation with SilarAI',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Marketing Cloud',
        description: 'Autonomous multi-channel ad copy generation, RFM customer clustering, and loyalty incentives.',
        iconName: 'Workflow'
      },
      {
        title: 'Book a Migration Consultation',
        anchorText: 'Schedule Shopify Store Migration Architecture Review',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Migration Help',
        description: 'Our technical team will assess your catalog and design a zero-downtime migration blueprint.',
        iconName: 'Building2'
      }
    ]
  },

  'woocommerce-comparison': {
    pageKey: 'woocommerce-comparison',
    pageTitle: 'WooCommerce vs SilarAI Architecture Comparison',
    pagePath: '/woocommerce-vs-silarai',
    clusterTheme: 'WordPress Optimization, Headless Commerce & B2B Solutions',
    description: 'Discover how WooCommerce stores overcome PHP plugin latency and database locking with SilarAI.',
    links: [
      {
        title: 'Shopify vs SilarAI Comparison',
        anchorText: 'Compare SilarAI vs Shopify Plus Architecture',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Shopify Comparison',
        description: 'Cross-platform benchmark comparing both hosted and open-source commerce against SilarAI.',
        iconName: 'Layers'
      },
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Discover Headless Commerce Engine for WordPress',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Headless Engine',
        description: 'Decouple your WordPress frontend while offloading heavy checkout and pricing logic to SilarAI.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Shopping Assistant',
        anchorText: 'Add AI Conversational Commerce to WooCommerce',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'AI Search Agent',
        description: 'Replace slow SQL table scans with instant semantic vector search and real-time product matching.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'Wholesale & B2B Commerce',
        anchorText: 'Explore High-Volume B2B Ordering Matrix Solutions',
        path: '/industries/wholesalers',
        view: 'wholesalers',
        category: 'Industry Vertical',
        badge: 'B2B Wholesale',
        description: 'Support multi-tiered pricing, bulk SKU grids, and corporate accounts without crashing WordPress.',
        iconName: 'Boxes'
      },
      {
        title: 'Distributor Portal Solutions',
        anchorText: 'Implement Authorized Distributor Portals with SilarAI',
        path: '/industries/distributors',
        view: 'distributors',
        category: 'Industry Vertical',
        badge: 'Distributor Hub',
        description: 'Provide dealer self-service reorders, credit approvals, and warehouse ATP stock visibility.',
        iconName: 'Building2'
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Automate WooCommerce Marketing with Native AI',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Marketing Cloud',
        description: 'Generate hyper-personalized email recommendations and automate seasonal discount campaigns.',
        iconName: 'Workflow'
      },
      {
        title: 'Why Choose SilarAI',
        anchorText: 'Read Architectural Scalability & Latency Benchmarks',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Performance Edge',
        description: 'Sub-50ms query response times under 100,000 concurrent shopper traffic spikes.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Request WordPress Migration Tour',
        anchorText: 'Consult with SilarAI Headless WordPress Engineers',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Expert Support',
        description: 'Connect your existing WooCommerce catalog into SilarAI high-speed headless endpoints.',
        iconName: 'BarChart3'
      }
    ]
  },

  'ai-shopping-assistant': {
    pageKey: 'ai-shopping-assistant',
    pageTitle: 'AI Shopping Assistant & Conversational Agent Pillar',
    pagePath: '/ai-shopping-assistant',
    clusterTheme: 'Conversational Buying, Semantic Discovery & Checkout',
    description: 'Explore specialized modules, industry applications, and platform integrations connected to the AI Shopping Assistant.',
    links: [
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Connect AI Shopping Assistant to Core Commerce Engine',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Commerce Engine',
        description: 'The transactional backend providing live ATP stock, discount rules, and multi-warehouse routing.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Explore Marketing Automation & Buyer Segmentation',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Growth Engine',
        description: 'Unified customer intelligence feeding individualized affinities into the AI buying agent.',
        iconName: 'Workflow'
      },
      {
        title: 'Shopify Store Embed Guide',
        anchorText: 'Embed AI Shopping Assistant on High-Volume Shopify Stores',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Shopify Plugin',
        description: 'One-click script integration activating conversational commerce on any Shopify storefront.',
        iconName: 'Layers'
      },
      {
        title: 'WooCommerce Storefront Embed',
        anchorText: 'Integrate AI Shopping Agent into WooCommerce Sites',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WordPress Speed',
        description: 'Offload catalog search from MySQL to AI vector index for instant conversational recommendations.',
        iconName: 'Zap'
      },
      {
        title: 'Retail Omnichannel In-Store App',
        anchorText: 'Deploy AI Shopping Assistant for In-Store Retail Shoppers',
        path: '/industries/retailers',
        view: 'retail-commerce',
        category: 'Industry Vertical',
        badge: 'Omnichannel POS',
        description: 'Interactive kiosk and QR-code conversational assistant assisting retail shoppers on the sales floor.',
        iconName: 'ShoppingBag'
      },
      {
        title: 'D2C Conversion Acceleration',
        anchorText: 'Boost Direct-to-Consumer Conversion with AI Buying Agents',
        path: '/industries/d2c-brands',
        view: 'd2c-brands',
        category: 'Industry Vertical',
        badge: 'D2C Commerce',
        description: 'Guide hesitant shoppers, resolve sizing queries, and trigger personalized bundle recommendations.',
        iconName: 'Sparkles'
      },
      {
        title: 'Why Choose SilarAI AI Agents',
        anchorText: 'Review Natural Language Conversion Benchmark Proof',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Proven ROI',
        description: '+35% lift in checkout conversion and +28% higher average order value documented across live pilots.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Request AI Agent Demonstration',
        anchorText: 'Schedule a Live Interactive Demo on Your Store Catalog',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Live Demo',
        description: 'See our conversational buying agent run live against your real product inventory.',
        iconName: 'Building2'
      }
    ]
  },

  'ai-commerce-platform': {
    pageKey: 'ai-commerce-platform',
    pageTitle: 'Core AI Commerce Platform & Headless Architecture',
    pagePath: '/ai-commerce-platform',
    clusterTheme: 'Enterprise Commerce Kernel, Dynamic Pricing & B2B Portals',
    description: 'Discover connected systems, automated inventory modules, and specialized vertical portals built on SilarAI core.',
    links: [
      {
        title: '24/7 AI Shopping Assistant',
        anchorText: 'Pair Commerce Platform with AI Conversational Agent',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Conversational AI',
        description: 'Frontend conversational buying agent interfacing directly with our high-speed pricing engine.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Add Autonomous Multi-Channel Marketing Automation',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Marketing Cloud',
        description: 'Connect catalog pricing intelligence with automated email campaigns, social posts, and ad targeting.',
        iconName: 'Workflow'
      },
      {
        title: 'Manufacturing AI Commerce',
        anchorText: 'Implement Industrial Commerce & Automated RFQ Quoting',
        path: '/industries/manufacturing',
        view: 'manufacturing',
        category: 'Industry Vertical',
        badge: 'Industrial RFQ',
        description: 'Complex bill-of-materials pricing, dealer portal integration, and CAD specification searches.',
        iconName: 'Boxes'
      },
      {
        title: 'Wholesale Tier Pricing & Matrix',
        anchorText: 'Configure B2B Bulk Order Grids & Credit Terms',
        path: '/industries/wholesalers',
        view: 'wholesalers',
        category: 'Industry Vertical',
        badge: 'B2B Wholesale',
        description: 'Custom contract matrices, volume tiered discounts, and enterprise ERP integration.',
        iconName: 'Building2'
      },
      {
        title: 'Distributor Portal Software',
        anchorText: 'Launch Self-Service Authorized Distributor Ordering',
        path: '/industries/distributors',
        view: 'distributors',
        category: 'Industry Vertical',
        badge: 'Distributor Hub',
        description: 'Multi-warehouse available-to-promise inventory checks and automated dealer allocation.',
        iconName: 'BarChart3'
      },
      {
        title: 'Shopify Integration Architecture',
        anchorText: 'Connect SilarAI Engine to Existing Shopify Plus Stores',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Shopify Bridge',
        description: 'Sync high-frequency catalog updates and dynamic pricing without migrating away from Shopify.',
        iconName: 'Layers'
      },
      {
        title: 'WooCommerce Headless API Bridge',
        anchorText: 'Modernize WordPress Stores with SilarAI Headless API',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WordPress Speed',
        description: 'Offload transactions to SilarAI while preserving familiar WordPress editorial content.',
        iconName: 'Zap'
      },
      {
        title: 'Why Choose SilarAI Architecture',
        anchorText: 'Review Sub-50ms Latency & High-Throughput Proof',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Throughput Edge',
        description: 'Architectural evaluation showing zero degradation during peak flash sales and Black Friday volume.',
        iconName: 'ShieldCheck'
      }
    ]
  },

  'ai-commerce-marketing-platform': {
    pageKey: 'ai-commerce-marketing-platform',
    pageTitle: 'AI Commerce & Marketing Platform Umbrella',
    pagePath: '/ai-commerce-marketing-platform',
    clusterTheme: 'Unified Commerce Ecosystem, Marketing Cloud & SEO Taxonomy',
    description: 'Explore the 8 core platform pillars and vertical industry solutions governed under the unified marketing umbrella.',
    links: [
      {
        title: 'AI Shopping Assistant',
        anchorText: 'Activate 24/7 Conversational AI Buying Assistants',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Conversion Agent',
        description: 'Drive live conversational conversions from promotional campaigns created by the marketing cloud.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Connect Marketing Cloud to Real-Time Commerce Engine',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Dynamic Pricing',
        description: 'Ensure automated ad campaigns reflect live inventory ATP stock and dynamic price rules.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'D2C Growth & Retention Engine',
        anchorText: 'Scale Direct-to-Consumer Customer Lifetime Value',
        path: '/industries/d2c-brands',
        view: 'd2c-brands',
        category: 'Industry Vertical',
        badge: 'D2C Retention',
        description: 'Automated repeat purchase triggers, loyalty tiers, and WhatsApp commerce notifications.',
        iconName: 'Sparkles'
      },
      {
        title: 'FMCG High-Velocity Merchandising',
        anchorText: 'Deploy Fast-Moving Consumer Goods Campaign Automation',
        path: '/industries/fmcg',
        view: 'fmcg-commerce',
        category: 'Industry Vertical',
        badge: 'FMCG Velocity',
        description: 'Automated subscription replenishment and predictive grocery order refills.',
        iconName: 'Boxes'
      },
      {
        title: 'Retail Omnichannel Merchandising',
        anchorText: 'Unify Digital Marketing with Physical Retail Locations',
        path: '/industries/retailers',
        view: 'retail-commerce',
        category: 'Industry Vertical',
        badge: 'Omnichannel POS',
        description: 'Geo-targeted promotional campaigns driving store foot traffic and online orders simultaneously.',
        iconName: 'ShoppingBag'
      },
      {
        title: 'Shopify Marketing Synchronization',
        anchorText: 'Connect SilarAI Marketing Cloud into Shopify Stores',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Shopify Sync',
        description: 'Sync customer segments and automated promotional workflows with existing Shopify stores.',
        iconName: 'Layers'
      },
      {
        title: 'Why Choose SilarAI Platform',
        anchorText: 'Examine SilarAI Unified Stack vs Disconnected SaaS',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Stack Advantage',
        description: 'Replace 8 separate marketing apps with one integrated AI commerce and retention cloud.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'About SilarAI Engineering Lab',
        anchorText: 'Discover the AI Research & Platform Mission',
        path: '/about',
        view: 'about',
        category: 'Strategic Architecture',
        badge: 'Company Story',
        description: 'Our proprietary foundation models, patent-pending algorithms, and global enterprise vision.',
        iconName: 'Globe'
      }
    ]
  },

  'retail-commerce': {
    pageKey: 'retail-commerce',
    pageTitle: 'Retail Commerce AI Solutions & Omnichannel Hub',
    pagePath: '/industries/retailers',
    clusterTheme: 'Omnichannel In-Store, POS Integration & Unified Catalog',
    description: 'Connect store locations, point-of-sale inventory, and digital storefronts with SilarAI retail intelligence.',
    links: [
      {
        title: 'AI Shopping Assistant',
        anchorText: 'Deploy In-Store Digital Shopping Assistants',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'In-Store Assistant',
        description: 'Interactive retail store clienteling on mobile devices and digital showroom kiosks.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Synchronize Retail POS with Unified Commerce Engine',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Omnichannel Core',
        description: 'Sub-50ms stock synchronization across physical retail stores and digital channels.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Launch Geo-Targeted Retail Marketing Campaigns',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Retail Marketing',
        description: 'Drive physical foot traffic and online orders with automated localized promotional offers.',
        iconName: 'Workflow'
      },
      {
        title: 'D2C Brands Direct Selling',
        anchorText: 'Explore D2C Hybrid Brand Selling Strategies',
        path: '/industries/d2c-brands',
        view: 'd2c-brands',
        category: 'Industry Vertical',
        badge: 'D2C Expansion',
        description: 'How retail brands launch direct consumer channels without causing retail partner friction.',
        iconName: 'Sparkles'
      },
      {
        title: 'Wholesale Store Replenishment',
        anchorText: 'Automate Retail Store Replenishment from Wholesalers',
        path: '/industries/wholesalers',
        view: 'wholesalers',
        category: 'Industry Vertical',
        badge: 'Store Logistics',
        description: 'Predictive stock reordering matrices connecting store managers with central wholesale hubs.',
        iconName: 'Boxes'
      },
      {
        title: 'Shopify POS Synchronization',
        anchorText: 'Connect SilarAI AI Merchandising to Shopify POS',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'POS Sync',
        description: 'Enhance Shopify POS setups with intelligent cross-sell suggestions and customer purchase history.',
        iconName: 'Layers'
      },
      {
        title: 'Why Choose SilarAI for Retail',
        anchorText: 'Review Retail Footfall & Conversion Case Studies',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Proven Lift',
        description: '+28% basket size expansion and 40% faster checkout times across omnichannel retail partners.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Schedule a Retail Consultation',
        anchorText: 'Speak with an Omnichannel Retail Solutions Specialist',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Retail Tour',
        description: 'See a customized retail demonstration tailored to your store footprint and point-of-sale hardware.',
        iconName: 'Building2'
      }
    ]
  },

  'd2c-brands': {
    pageKey: 'd2c-brands',
    pageTitle: 'D2C Brands AI Commerce & Conversion Platform',
    pagePath: '/industries/d2c-brands',
    clusterTheme: 'Direct-to-Consumer Conversion, Retention & Headless Growth',
    description: 'Discover how fast-growing consumer brands drive higher repeat purchases and eliminate checkout friction.',
    links: [
      {
        title: 'AI Shopping Assistant',
        anchorText: 'Add 24/7 AI Buying Agent to Your D2C Storefront',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Conversion Lift',
        description: 'Converse with shoppers in natural language, answer sizing questions, and drive 1-click checkout.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Power Your D2C Store with High-Velocity Commerce Engine',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Headless Speed',
        description: 'Dynamic bundling, sub-50ms pricing calculation, and automated catalog replenishment.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Automate D2C Email, Social, and Ad Campaigns with AI',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Marketing Cloud',
        description: 'Autonomous customer cohort segmentation and personalized win-back promotional campaigns.',
        iconName: 'Workflow'
      },
      {
        title: 'Shopify Headless Stack Comparison',
        anchorText: 'Compare SilarAI Headless Architecture with Shopify',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Shopify vs SilarAI',
        description: 'Why leading D2C brands avoid Shopify App Store bloat by using SilarAI unified stack.',
        iconName: 'Layers'
      },
      {
        title: 'WooCommerce Migration Blueprint',
        anchorText: 'Migrate D2C Store from Slow WooCommerce to SilarAI',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WordPress Speed',
        description: 'Eliminate cart abandonment caused by slow PHP checkout pages with modern edge execution.',
        iconName: 'Zap'
      },
      {
        title: 'Retail Omnichannel Expansion',
        anchorText: 'Expand D2C Brands into Wholesale & Physical Retail',
        path: '/industries/retailers',
        view: 'retail-commerce',
        category: 'Industry Vertical',
        badge: 'Retail Expansion',
        description: 'Synchronize direct online brand sales with pop-up stores and wholesale department store accounts.',
        iconName: 'ShoppingBag'
      },
      {
        title: 'Why Choose SilarAI for D2C',
        anchorText: 'Review D2C Customer Acquisition Cost & LTV Benchmarks',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'ROI Metrics',
        description: 'Achieve +42% repeat customer order rates and 35% lower cart abandonment across brand storefronts.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Book a D2C Scaling Demo',
        anchorText: 'Request a Personalized D2C Store Growth Consultation',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Growth Session',
        description: 'Review your conversion funnel with our commerce architects and discover instant quick-win optimizations.',
        iconName: 'Building2'
      }
    ]
  },

  'distributors': {
    pageKey: 'distributors',
    pageTitle: 'Distributor Commerce Portal & Tier Pricing Architecture',
    pagePath: '/industries/distributors',
    clusterTheme: 'Dealer Enablement, Warehouse ATP Stock & Multi-Tier Pricing',
    description: 'Empower authorized dealer networks, commercial contractors, and enterprise distributors with real-time commerce.',
    links: [
      {
        title: 'Wholesale Ordering Matrix',
        anchorText: 'Explore High-Volume Wholesale Ordering Matrix Grids',
        path: '/industries/wholesalers',
        view: 'wholesalers',
        category: 'Industry Vertical',
        badge: 'Wholesale Matrix',
        description: 'Rapid SKU reordering, bulk carton entries, and customized corporate contract terms.',
        iconName: 'Boxes'
      },
      {
        title: 'Manufacturing ERP & RFQ Sync',
        anchorText: 'Connect Distribution Channels to Manufacturing Plants',
        path: '/industries/manufacturing',
        view: 'manufacturing',
        category: 'Industry Vertical',
        badge: 'Industrial Sync',
        description: 'Direct integration with production schedules, spare part lookups, and automated RFQ workflows.',
        iconName: 'Building2'
      },
      {
        title: 'Core B2B Commerce Platform',
        anchorText: 'Examine SilarAI B2B Commerce Kernel Architecture',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'B2B Core',
        description: 'Real-time available-to-promise inventory across multiple regional distribution centers.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Sales Assistant for Field Reps',
        anchorText: 'Empower Outside Sales Reps with Mobile AI Assistants',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Field Sales App',
        description: 'Equip dealer sales reps with instant stock checks, client purchase history, and quote generation.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'FMCG High-Velocity Distribution',
        anchorText: 'Discover Fast-Moving Consumer Goods Supply Solutions',
        path: '/industries/fmcg',
        view: 'fmcg-commerce',
        category: 'Industry Vertical',
        badge: 'FMCG Logistics',
        description: 'Automated repeat replenishment schedules and route-optimized distribution workflows.',
        iconName: 'BarChart3'
      },
      {
        title: 'Why Choose SilarAI B2B Architecture',
        anchorText: 'Review Enterprise ERP Integration & Scalability Proof',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'ERP Connector',
        description: 'Pre-built connectors for SAP S/4HANA, NetSuite, Dynamics 365, and custom enterprise databases.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'WooCommerce B2B Modernization',
        anchorText: 'Replace Fragile WooCommerce B2B Plugins with SilarAI',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WordPress Modernization',
        description: 'Escape the limitations of WordPress plugins that crash under multi-thousand line distributor orders.',
        iconName: 'Zap'
      },
      {
        title: 'Enterprise Integration Inquiry',
        anchorText: 'Schedule a Distribution Architecture Deep Dive',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Enterprise Demo',
        description: 'Consult with our B2B solutions team to map out ERP connectors and custom dealer portal designs.',
        iconName: 'Globe'
      }
    ]
  },

  'wholesalers': {
    pageKey: 'wholesalers',
    pageTitle: 'Wholesale Commerce & Tiered Contract Pricing Hub',
    pagePath: '/industries/wholesalers',
    clusterTheme: 'Corporate Accounts, Credit Lines & Matrix Reordering',
    description: 'Modern wholesale commerce solutions designed for bulk purchasing, corporate approvals, and flexible terms.',
    links: [
      {
        title: 'Distributor Portal Solutions',
        anchorText: 'Explore SilarAI Authorized Dealer & Distributor Portals',
        path: '/industries/distributors',
        view: 'distributors',
        category: 'Industry Vertical',
        badge: 'Dealer Hub',
        description: 'Self-service replenishment portals for regional dealer networks and wholesale clients.',
        iconName: 'Building2'
      },
      {
        title: 'Manufacturing Commerce Engine',
        anchorText: 'Connect Wholesale Channels with Manufacturing Quoting',
        path: '/industries/manufacturing',
        view: 'manufacturing',
        category: 'Industry Vertical',
        badge: 'Industrial RFQ',
        description: 'Coordinate wholesale supply with direct plant production schedules and custom product configurations.',
        iconName: 'Boxes'
      },
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Discover High-Speed Dynamic Pricing for B2B Wholesale',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'B2B Core',
        description: 'Handle thousands of unique contract price books and volume discounts at sub-50ms speeds.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Shopping & Sales Assistant',
        anchorText: 'Deploy Conversational Reordering for Wholesale Buyers',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Instant Reorder',
        description: 'Wholesale buyers can reorder previous POs or search technical catalogs simply by asking.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'FMCG Bulk Merchandising',
        anchorText: 'Explore FMCG High-Volume Wholesale Operations',
        path: '/industries/fmcg',
        view: 'fmcg-commerce',
        category: 'Industry Vertical',
        badge: 'Bulk FMCG',
        description: 'Pallet-level order matrixing, automated recurring subscriptions, and freight calculation.',
        iconName: 'BarChart3'
      },
      {
        title: 'Why Choose SilarAI Wholesale Tech',
        anchorText: 'Analyze Wholesale Cost Reduction & Automation Metrics',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Operational ROI',
        description: 'Cut order processing overhead by 70% while reducing manual billing and pricing discrepancies.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Shopify B2B Headless Integration',
        anchorText: 'Upgrade Shopify Stores to Enterprise Wholesale Commerce',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Shopify B2B',
        description: 'Bypass Shopify Plus B2B limitations with SilarAI dedicated wholesale contract matrices.',
        iconName: 'Layers'
      },
      {
        title: 'Schedule Wholesale Portal Tour',
        anchorText: 'Request Wholesale Platform Walkthrough & ERP Audit',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Schedule Tour',
        description: 'Learn how SilarAI can streamline your quote-to-cash workflow and dealer onboarding.',
        iconName: 'Globe'
      }
    ]
  },

  'manufacturing': {
    pageKey: 'manufacturing',
    pageTitle: 'Manufacturing AI Commerce, RFQ Quoting & CAD Lookup',
    pagePath: '/industries/manufacturing',
    clusterTheme: 'Industrial Machinery, Configurable BOMs & Dealer Networks',
    description: 'Digital commerce for industrial manufacturers, equipment suppliers, and precision engineered parts.',
    links: [
      {
        title: 'Distributor Portal Software',
        anchorText: 'Launch Industrial Dealer & Authorized Distributor Portals',
        path: '/industries/distributors',
        view: 'distributors',
        category: 'Industry Vertical',
        badge: 'Dealer Hub',
        description: 'Provide dealer networks with real-time stock allocation, warranty lookup, and parts ordering.',
        iconName: 'Building2'
      },
      {
        title: 'Wholesale Contract Pricing',
        anchorText: 'Manage Tiered Wholesale Contracts & Corporate Quotes',
        path: '/industries/wholesalers',
        view: 'wholesalers',
        category: 'Industry Vertical',
        badge: 'Wholesale B2B',
        description: 'Multi-year contract pricing, tiered volume brackets, and credit approval workflows.',
        iconName: 'Boxes'
      },
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Discover SilarAI Enterprise Manufacturing Commerce Engine',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Commerce Core',
        description: 'Complex bill-of-materials quoting, multi-facility warehouse stock, and ERP synchronization.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Shopping & RFQ Sales Assistant',
        anchorText: 'Deploy AI Assistants for Complex Technical Part Inquiries',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Technical Assistant',
        description: 'Guide engineers and plant managers through schematic diagrams and compatible spare parts.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'FMCG High-Volume Supply Solutions',
        anchorText: 'Examine High-Throughput Manufacturing Packaging & Supply',
        path: '/industries/fmcg',
        view: 'fmcg-commerce',
        category: 'Industry Vertical',
        badge: 'High-Volume Production',
        description: 'Coordinate raw materials and packaging supply chains with high-frequency commerce telemetry.',
        iconName: 'BarChart3'
      },
      {
        title: 'Why Choose SilarAI Industrial Commerce',
        anchorText: 'Review ERP Synchronization & Performance Case Studies',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Industrial Edge',
        description: 'Seamless two-way integration with SAP, Oracle, Siemens Teamcenter, and Microsoft Dynamics.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'WooCommerce Migration for Manufacturers',
        anchorText: 'Modernize Legacy Manufacturing WordPress Catalogs',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WordPress Modernization',
        description: 'Upgrade slow PDF-based catalogs into searchable vector AI technical databases.',
        iconName: 'Zap'
      },
      {
        title: 'Request Manufacturing Architecture Demo',
        anchorText: 'Consult with SilarAI Industrial Commerce Specialists',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Industrial Demo',
        description: 'Walk through live RFQ automation, custom BOM calculators, and dealer self-service portals.',
        iconName: 'Globe'
      }
    ]
  },

  'fmcg-commerce': {
    pageKey: 'fmcg-commerce',
    pageTitle: 'FMCG & Consumer Packaged Goods Commerce Platform',
    pagePath: '/industries/fmcg',
    clusterTheme: 'High-Velocity Ordering, Automated Replenishment & Supply Chains',
    description: 'Accelerate fast-moving consumer packaged goods across retail, direct brand channels, and distribution.',
    links: [
      {
        title: 'Retail Omnichannel Solutions',
        anchorText: 'Synchronize FMCG Goods Across Retail Stores & POS',
        path: '/industries/retailers',
        view: 'retail-commerce',
        category: 'Industry Vertical',
        badge: 'Retail POS',
        description: 'Unified inventory visibility, visual merchandising, and in-store stock replenishment.',
        iconName: 'ShoppingBag'
      },
      {
        title: 'D2C High-Velocity Brand Channels',
        anchorText: 'Launch Direct FMCG Brand Subscription Stores',
        path: '/industries/d2c-brands',
        view: 'd2c-brands',
        category: 'Industry Vertical',
        badge: 'D2C Subscriptions',
        description: 'Automated repeat grocery and household replenishment with 1-click WhatsApp checkout.',
        iconName: 'Sparkles'
      },
      {
        title: 'Distributor Logistics Automation',
        anchorText: 'Streamline Regional FMCG Wholesale Distributor Portals',
        path: '/industries/distributors',
        view: 'distributors',
        category: 'Industry Vertical',
        badge: 'Distribution Hub',
        description: 'Route-optimized bulk ordering and high-speed delivery schedule synchronization.',
        iconName: 'Building2'
      },
      {
        title: 'Wholesale Reordering Matrix',
        anchorText: 'Deploy High-Volume Wholesale Pallet Ordering Grids',
        path: '/industries/wholesalers',
        view: 'wholesalers',
        category: 'Industry Vertical',
        badge: 'Wholesale B2B',
        description: 'Pallet-level order matrixing, quantity tier discounts, and automated credit line management.',
        iconName: 'Boxes'
      },
      {
        title: 'AI Shopping Assistant Conversational Cart',
        anchorText: 'Deploy AI Conversational Assistants for Quick Reorders',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Quick Reorder',
        description: 'Shoppers can rebuild their frequent grocery carts in seconds via natural language chat.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Automate FMCG Marketing & Predictive Restock Triggers',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Marketing Cloud',
        description: 'Predict when buyers will run out of stock and trigger timely promotional notifications.',
        iconName: 'Workflow'
      },
      {
        title: 'Why Choose SilarAI High-Throughput Engine',
        anchorText: 'Review Sub-50ms Response Speed Under High FMCG Volume',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'Speed & Scale',
        description: 'Zero system throttling under millions of daily transactions across retail and digital.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'FMCG Enterprise Strategy Session',
        anchorText: 'Schedule a Consultation with FMCG Commerce Experts',
        path: '/contact-us',
        view: 'contact-us',
        category: 'Strategic Architecture',
        badge: 'Strategy Session',
        description: 'Explore high-velocity replenishment workflows and custom ERP connectivity with our engineering team.',
        iconName: 'Globe'
      }
    ]
  },

  'contact-us': {
    pageKey: 'contact-us',
    pageTitle: 'Contact SilarAI & Demonstration Request Portal',
    pagePath: '/contact-us',
    clusterTheme: 'Enterprise Consultation, Architecture Audits & Migration',
    description: 'Explore the key platform pillars and specialized industry verticals before scheduling your customized consultation.',
    links: [
      {
        title: 'AI Shopping Assistant',
        anchorText: 'Explore 24/7 AI Shopping Assistant Capabilities',
        path: '/ai-shopping-assistant',
        view: 'ai-shopping-assistant',
        category: 'Core Pillar',
        badge: 'Conversational AI',
        description: 'Test how our conversational buying agent increases conversion rates and average order value.',
        iconName: 'Bot',
        options: { pageId: 1 }
      },
      {
        title: 'Core AI Commerce Platform',
        anchorText: 'Review SilarAI Headless Commerce Platform Engine',
        path: '/ai-commerce-platform',
        view: 'ai-commerce-platform',
        category: 'Core Pillar',
        badge: 'Dynamic Pricing',
        description: 'High-throughput catalog management, sub-50ms pricing calculation, and ERP synchronization.',
        iconName: 'Cpu',
        options: { pageId: 1 }
      },
      {
        title: 'AI Commerce & Marketing Platform',
        anchorText: 'Explore SilarAI Unified Marketing Cloud & SEO Taxonomy',
        path: '/ai-commerce-marketing-platform',
        view: 'ai-commerce-marketing-platform',
        category: 'Core Pillar',
        badge: 'Marketing Cloud',
        description: 'Autonomous customer RFM segmentation, promotional campaign automation, and SEO clustering.',
        iconName: 'Workflow'
      },
      {
        title: 'Why Choose SilarAI',
        anchorText: 'Review Technical Benchmarks & Platform ROI Proof',
        path: '/why-choose-us',
        view: 'why-choose-us',
        category: 'Strategic Architecture',
        badge: 'ROI Proof',
        description: 'Compare SilarAI total cost of ownership and latency against legacy ecommerce platforms.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Shopify vs SilarAI Comparison',
        anchorText: 'Read Full Shopify Plus vs SilarAI Architectural Benchmark',
        path: '/shopify-vs-silarai',
        view: 'shopify-comparison',
        category: 'Platform Comparison',
        badge: 'Shopify Comparison',
        description: 'Discover how SilarAI provides a unified, app-free native AI architecture for modern merchants.',
        iconName: 'Layers'
      },
      {
        title: 'WooCommerce vs SilarAI Comparison',
        anchorText: 'Compare WooCommerce Scalability vs SilarAI Headless API',
        path: '/woocommerce-vs-silarai',
        view: 'woocommerce-comparison',
        category: 'Platform Comparison',
        badge: 'WordPress Modernization',
        description: 'Modern API-first solution replacing heavy PHP catalog plugins with instant vector-powered search.',
        iconName: 'Zap'
      },
      {
        title: 'D2C & Retail Industry Solutions',
        anchorText: 'Explore SilarAI Industry Vertical Implementations',
        path: '/industries/d2c-brands',
        view: 'd2c-brands',
        category: 'Industry Vertical',
        badge: 'Vertical Solutions',
        description: 'Tailored commerce workflows for direct consumer brands, omnichannel retailers, and wholesalers.',
        iconName: 'Sparkles'
      },
      {
        title: 'About SilarAI Leadership & Team',
        anchorText: 'Learn About the Team & Engineering Vision Behind SilarAI',
        path: '/about',
        view: 'about',
        category: 'Strategic Architecture',
        badge: 'Company Story',
        description: 'Our engineering philosophy, global infrastructure footprint, and AI research commitment.',
        iconName: 'Globe'
      }
    ]
  }
};

/**
 * Returns the curated 8 internal links for a given page identifier.
 * Falls back to the home cluster if not found.
 */
export function getInternalLinkingForPage(pageKey: string): PageInternalCluster {
  const normalizedKey = pageKey.replace(/^\//, '').replace(/\/$/, '') || 'home';

  // Every lookup falls back to the `home` cluster. A branch that returned an
  // absent key would hand the caller `undefined`, and the component reads
  // `cluster.links` unguarded — so a missing cluster would throw rather than
  // degrade. Keep this shape when adding aliases.
  const pick = (key: string): PageInternalCluster =>
    INTERNAL_LINKING_CLUSTERS[key] ?? INTERNAL_LINKING_CLUSTERS['home'];

  if (INTERNAL_LINKING_CLUSTERS[normalizedKey]) {
    return INTERNAL_LINKING_CLUSTERS[normalizedKey];
  }

  // Alias matches
  if (normalizedKey === 'fmcg') return pick('fmcg-commerce');
  if (normalizedKey.includes('d2c')) return pick('d2c-brands');
  if (normalizedKey.includes('retail')) return pick('retail-commerce');
  if (normalizedKey.includes('distributor')) return pick('distributors');
  if (normalizedKey.includes('wholesaler')) return pick('wholesalers');
  if (normalizedKey.includes('manufacturing')) return pick('manufacturing');
  if (normalizedKey.includes('shopify')) return pick('shopify-comparison');
  if (normalizedKey.includes('woocommerce')) return pick('woocommerce-comparison');
  if (normalizedKey.includes('shopping-assistant')) return pick('ai-shopping-assistant');
  if (normalizedKey.includes('marketing-platform')) return pick('ai-commerce-marketing-platform');
  if (normalizedKey.includes('commerce-platform')) return pick('ai-commerce-platform');
  if (normalizedKey.includes('why-choose')) return pick('why-choose-us');
  if (normalizedKey.includes('about')) return pick('about');
  if (normalizedKey.includes('contact')) return pick('contact-us');

  return INTERNAL_LINKING_CLUSTERS['home'];
}
