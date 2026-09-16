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

/**
 * Curated topical internal-link clusters, consumed by InternalLinkingSection.
 *
 * `path` values MUST match a route the router in App.tsx actually resolves.
 * Because staticwebapp.config.json falls back to index.html with a 200, an
 * unrecognised path silently renders the homepage — a soft 404 that search
 * engines treat as duplicate content, which defeats the purpose of this file.
 * Industry pages therefore use their real /industries/* paths.
 */
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
        title: 'Retail Commerce Solutions',
        anchorText: 'Explore Omnichannel Retail AI Implementations',
        path: '/industries/retailers',
        view: 'retail-commerce',
        category: 'Industry Vertical',
        badge: 'Omnichannel POS',
        description: 'Unified inventory visibility and in-store conversational sales enablement for modern retailers.',
        iconName: 'ShoppingBag'
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
        title: 'Wholesalers B2B Platform',
        anchorText: 'Review Wholesale RFQ Automation & Matrix Ordering',
        path: '/industries/wholesalers',
        view: 'wholesalers',
        category: 'Industry Vertical',
        badge: 'Wholesale B2B',
        description: 'Automated RFQ workflows, multi-tier dealer pricing, and SAP/Oracle ERP integration.',
        iconName: 'Boxes'
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
  }
};

/** Cluster keys that are aliased onto a canonical cluster. */
const CLUSTER_ALIASES: Array<[test: (key: string) => boolean, target: string]> = [
  [(k) => k === 'fmcg', 'fmcg-commerce'],
  [(k) => k.includes('d2c'), 'd2c-brands'],
  [(k) => k.includes('retail'), 'retail-commerce'],
  [(k) => k.includes('distributor'), 'distributors'],
  [(k) => k.includes('wholesaler'), 'wholesalers'],
  [(k) => k.includes('manufacturing'), 'manufacturing'],
  [(k) => k.includes('shopify'), 'shopify-comparison'],
  [(k) => k.includes('woocommerce'), 'woocommerce-comparison'],
  [(k) => k.includes('shopping-assistant'), 'ai-shopping-assistant'],
  [(k) => k.includes('commerce-platform'), 'ai-commerce-platform'],
  [(k) => k.includes('why-choose'), 'why-choose-us'],
  [(k) => k.includes('about'), 'about'],
  [(k) => k.includes('contact'), 'contact-us'],
];

/**
 * Returns the curated internal links for a given page identifier.
 *
 * Every lookup falls back to the home cluster, so a page key with no cluster of
 * its own still renders a valid link block rather than throwing. That matters:
 * not every key in CLUSTER_ALIASES has a dedicated cluster defined yet.
 */
export function getInternalLinkingForPage(pageKey: string): PageInternalCluster {
  const normalizedKey = pageKey.replace(/^\//, '').replace(/\/$/, '') || 'home';
  const home = INTERNAL_LINKING_CLUSTERS['home'];

  const direct = INTERNAL_LINKING_CLUSTERS[normalizedKey];
  if (direct) return direct;

  for (const [test, target] of CLUSTER_ALIASES) {
    if (test(normalizedKey)) {
      return INTERNAL_LINKING_CLUSTERS[target] ?? home;
    }
  }

  return home;
}
