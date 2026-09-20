import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Bot,
  Megaphone,
  BarChart3,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Globe,
  Database,
  Search,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Users,
  ChevronRight,
  TrendingUp,
  Store,
  Building2,
  Workflow,
  ExternalLink,
  Code2,
  Terminal,
  Share2,
  MessageSquare,
  HelpCircle,
  FolderTree,
  Server,
  RefreshCw,
  Eye,
  Sliders
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface AiCommerceMarketingPlatformPageProps {
  onNavigateView: (view: any, options?: { pageId?: number; subPageId?: number }) => void;
  onBookDemo: (plan?: string) => void;
  onOpenAiDiscovery?: () => void;
}

export const AI_COMMERCE_MARKETING_PLATFORM_KEYWORDS_LIST = [
  'AI Commerce Platform',
  'AI Marketing Platform',
  'AI Commerce Platform for Ecommerce',
  'AI Commerce Software',
  'AI Commerce Solution',
  'AI-powered Commerce Platform',
  'AI-powered Marketing Platform',
  'AI Commerce and Marketing Software',
  'AI Marketing Automation',
  'AI Marketing Software',
  'AI Marketing Platform for Ecommerce',
  'AI Ecommerce Marketing',
  'AI Customer Engagement',
  'AI Personalization',
  'AI Customer Intelligence',
  'AI Customer Segmentation',
  'AI Marketing Analytics',
  'AI Sales Automation',
  'AI Campaign Automation',
  'AI Customer Engagement Platform',
  'Commerce Cloud',
  'Ecommerce Cloud Platform',
  'Cloud Commerce Platform',
  'B2B Commerce Cloud',
  'B2C Commerce Cloud',
  'Enterprise Commerce Cloud',
  'Headless Commerce Cloud',
  'Commerce Management Platform',
  'Ecommerce Commerce Platform',
  'Cloud Ecommerce Platform',
  'AI-powered ecommerce',
  'AI ecommerce software',
  'AI ecommerce solution',
  'AI commerce software',
  'AI commerce technology',
  'AI-native commerce',
  'intelligent commerce platform',
  'AI-driven commerce',
  'AI retail technology',
  'AI retail platform'
];

interface KeywordGroup {
  name: string;
  category: string;
  description: string;
  keywords: string[];
  anchorLink: string;
  highlightBenefit: string;
}

const KEYWORD_TAXONOMY_GROUPS: KeywordGroup[] = [
  {
    name: 'AI Commerce Platforms & Solutions',
    category: 'Core Commerce Engine',
    description: 'Enterprise-grade digital commerce foundations built natively with AI intelligence for B2B and B2C ecommerce.',
    keywords: [
      'AI Commerce Platform',
      'AI Commerce Platform for Ecommerce',
      'AI Commerce Software',
      'AI Commerce Solution',
      'AI-powered Commerce Platform',
      'AI commerce software',
      'AI commerce technology',
      'AI-native commerce'
    ],
    anchorLink: '/ai-commerce-platform',
    highlightBenefit: 'Sub-50ms dynamic pricing, automated catalog management, and unified multi-storefront control.'
  },
  {
    name: 'AI Marketing Platforms & Automation',
    category: 'Autonomous Marketing',
    description: 'Intelligent campaign generation, multi-channel promotional automation, and revenue-maximizing outreach.',
    keywords: [
      'AI Marketing Platform',
      'AI-powered Marketing Platform',
      'AI Commerce and Marketing Software',
      'AI Marketing Automation',
      'AI Marketing Software',
      'AI Marketing Platform for Ecommerce',
      'AI Ecommerce Marketing',
      'AI Campaign Automation'
    ],
    anchorLink: '/ai-marketing-platform',
    highlightBenefit: 'Generative product copywriting, automated social campaigns, and smart ad spend optimization.'
  },
  {
    name: 'Customer Engagement & Intelligence',
    category: 'Customer Intelligence & Personalization',
    description: 'Real-time customer journey analysis, predictive RFM segmentation, and 1:1 individualized buyer experiences.',
    keywords: [
      'AI Customer Engagement',
      'AI Personalization',
      'AI Customer Intelligence',
      'AI Customer Segmentation',
      'AI Customer Engagement Platform'
    ],
    anchorLink: '/ai-marketing-platform',
    highlightBenefit: 'Predictive buyer behavior scoring, dynamic cohort clustering, and hyper-personalized recommendations.'
  },
  {
    name: 'Enterprise Commerce Cloud & Headless',
    category: 'Cloud Infrastructure',
    description: 'High-availability, API-first scalable commerce architecture connecting disparate touchpoints without monolith lock-in.',
    keywords: [
      'Commerce Cloud',
      'Ecommerce Cloud Platform',
      'Cloud Commerce Platform',
      'B2B Commerce Cloud',
      'B2C Commerce Cloud',
      'Enterprise Commerce Cloud',
      'Headless Commerce Cloud',
      'Commerce Management Platform',
      'Ecommerce Commerce Platform',
      'Cloud Ecommerce Platform'
    ],
    anchorLink: '/b2b-commerce-platform',
    highlightBenefit: 'Decoupled headless GraphQL/REST APIs, global multi-region edge deployment, and ERP sync.'
  },
  {
    name: 'Intelligent & AI-Driven Commerce',
    category: 'Next-Gen Architecture',
    description: 'Self-learning algorithms optimizing inventory, storefront grids, search discovery, and conversational checkout.',
    keywords: [
      'AI-powered ecommerce',
      'AI ecommerce software',
      'AI ecommerce solution',
      'intelligent commerce platform',
      'AI-driven commerce'
    ],
    anchorLink: '/ai-product-discovery',
    highlightBenefit: 'Continuous model training on catalog telemetry, vector semantic discovery, and automated replenishment.'
  },
  {
    name: 'Retail & Sales Automation',
    category: 'Sales Acceleration',
    description: 'Conversational selling tools, WhatsApp commerce, cart recovery triggers, and field sales enablement.',
    keywords: [
      'AI Sales Automation',
      'AI Marketing Analytics',
      'AI retail technology',
      'AI retail platform'
    ],
    anchorLink: '/ai-sales-assistant',
    highlightBenefit: '+35% conversion lift, +28% average order value expansion, and 32% abandoned cart recovery.'
  }
];

const MAPPED_RELATED_PAGES = [
  {
    category: 'Core Product Pillars',
    items: [
      { name: 'AI Commerce Platform', path: '/ai-commerce-platform', view: 'ai-commerce-platform', pageId: 1, desc: 'Dynamic pricing, visual merchandising, and catalog automation.' },
      { name: 'AI Shopping Assistant', path: '/ai-shopping-assistant', view: 'ai-shopping-assistant', pageId: 1, desc: '24/7 conversational buying agent with 1-click checkout.' },
      { name: 'AI Marketing Platform', path: '/ai-marketing-platform', view: 'ai-commerce-platform', pageId: 3, desc: 'Automated campaigns, social copywriting, and segmentation.' },
      { name: 'B2B Commerce Platform', path: '/b2b-commerce-platform', view: 'ai-commerce-platform', pageId: 1, desc: 'Wholesale contract matrices, bulk reorders, and ERP sync.' },
      { name: 'B2B2C Commerce Platform', path: '/b2b2c-commerce-platform', view: 'ai-commerce-platform', pageId: 1, desc: 'Hybrid direct-to-consumer and dealer fulfillment model.' },
      { name: 'AI Product Discovery', path: '/ai-product-discovery', view: 'ai-shopping-assistant', pageId: 2, desc: 'Semantic vector search for specifications and applications.' },
      { name: 'Dealer Portal Software', path: '/dealer-portal', view: 'distributors', desc: 'Authorized dealer self-service ordering and spare parts lookup.' },
      { name: 'Customer Portal Software', path: '/customer-portal', view: 'wholesalers', desc: 'Buyer order histories, shipment tracking, and invoices.' },
      { name: 'AI Sales Assistant', path: '/ai-sales-assistant', view: 'ai-shopping-assistant', pageId: 1, desc: 'Field sales enablement mobile app with stock ATP checks.' }
    ]
  },
  {
    category: 'Industry Verticals',
    items: [
      { name: 'D2C Brands', path: '/industries/d2c-brands', view: 'd2c-brands', desc: 'High-conversion direct storefronts with WhatsApp commerce.' },
      { name: 'Retailers', path: '/industries/retailers', view: 'retail-commerce', desc: 'Omnichannel visual merchandising and unified POS inventory.' },
      { name: 'Manufacturing', path: '/industries/manufacturing', view: 'manufacturing', desc: 'Industrial machinery, RFQ automation, and CAD spec lookup.' },
      { name: 'Wholesale Distributors', path: '/industries/distributors', view: 'distributors', desc: 'Matrix ordering, warehouse ATP visibility, and contract pricing.' },
      { name: 'Wholesalers', path: '/industries/wholesalers', view: 'wholesalers', desc: 'Corporate accounts, credit approvals, and bulk pricing tiers.' },
      { name: 'FMCG & Consumer Goods', path: '/fmcg-commerce', view: 'fmcg-commerce', desc: 'Fast-moving consumer brands with automated repeat reordering.' }
    ]
  },
  {
    category: 'Native Integrations',
    items: [
      { name: 'Shopify & Shopify Plus', path: '/shopify-vs-silarai', view: 'shopify-comparison', desc: '1-click app integration for sub-50ms dynamic pricing and AI search.' },
      { name: 'WooCommerce / WordPress', path: '/woocommerce-vs-silarai', view: 'woocommerce-comparison', desc: 'Headless plugin replacing bloated PHP plugins with vector AI.' }
    ]
  }
];

const AEO_CLUSTER_FAQS = [
  {
    q: 'What is an AI Commerce & Marketing Platform?',
    a: 'An AI Commerce & Marketing Platform is a unified digital software ecosystem that combines core ecommerce storefront operations (catalog, pricing, checkout, order management) with autonomous marketing automation, AI customer intelligence, real-time personalization, and 24/7 conversational shopping assistants. Instead of relying on 5 to 10 disconnected SaaS apps, SilarAI unifies these workflows under one cloud-native headless platform.'
  },
  {
    q: 'How does an AI Commerce Platform differ from legacy ecommerce software?',
    a: 'Legacy ecommerce platforms (like monolithic Magento or legacy SAP Hybris) rely on static catalogs, rigid rules engines, and slow batch jobs. In contrast, an AI Commerce Platform leverages machine learning and vector embeddings to dynamically calculate prices in under 50ms, reorder visual product grids based on buyer intent, and converse with shoppers in natural language to guide purchases.'
  },
  {
    q: 'What is Commerce Cloud and Headless Commerce Cloud?',
    a: 'Commerce Cloud is a cloud-native, high-scalability digital commerce infrastructure. A Headless Commerce Cloud specifically separates the backend commerce logic (order workflows, inventory databases, ERP integrations) from frontend user touchpoints (web, mobile, social, WhatsApp, IoT) via high-speed REST and GraphQL APIs, allowing businesses to launch custom storefront experiences without backend constraints.'
  },
  {
    q: 'How does AI Marketing Automation and AI Sales Automation drive revenue?',
    a: 'AI Marketing Automation continuously analyzes customer purchase histories and catalog updates to craft targeted promotional emails, schedule social commerce posts, and trigger abandoned cart recovery sequences automatically. Simultaneously, AI Sales Automation acts as an intelligent buying assistant during live shopping sessions, recommending complementary cross-sells and premium upsells with clear justification, resulting in +35% higher conversions and +28% AOV lift.'
  },
  {
    q: 'What is AI Customer Intelligence and Segmentation?',
    a: 'AI Customer Intelligence tracks real-time customer behavior, session telemetry, repeat order velocity, and category affinity. It automatically segments customers into dynamic cohorts (such as High-Value VIPs, At-Risk Churners, Price-Sensitive Shoppers, and Wholesale Buyers) and triggers 1:1 personalized incentives and catalog recommendations tailored to each cohort.'
  },
  {
    q: 'Can SilarAI AI Commerce & Marketing Platform integrate with existing ERPs and CRMs?',
    a: 'Yes. SilarAI features native two-way synchronization connectors for leading enterprise ERPs including SAP S/4HANA, Oracle NetSuite, Microsoft Dynamics 365, Odoo, and ERPNext, as well as CRM platforms like Salesforce and HubSpot. It maintains sub-50ms inventory ATP checks and customer contract pricing without data silos.'
  }
];

export const AiCommerceMarketingPlatformPage: React.FC<AiCommerceMarketingPlatformPageProps> = ({
  onNavigateView,
  onBookDemo,
  onOpenAiDiscovery
}) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'marketing' | 'intelligence' | 'assistants' | 'architecture'>('cloud');
  const [selectedKeywordFilter, setSelectedKeywordFilter] = useState<string>('all');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedEndpoint(label);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const filteredGroups = selectedKeywordFilter === 'all'
    ? KEYWORD_TAXONOMY_GROUPS
    : KEYWORD_TAXONOMY_GROUPS.filter(g => g.name.toLowerCase().includes(selectedKeywordFilter.toLowerCase()) || g.category.toLowerCase().includes(selectedKeywordFilter.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/', onClick: () => onNavigateView('home') },
              { label: 'Products', href: '/products' },
              { label: 'AI Commerce & Marketing Platform', isCurrent: true }
            ]}
          />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SEO Cluster Central Page
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-medium text-emerald-400 mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pillar #1 Central SEO & AEO Knowledge Hub • 40 Core Keywords Indexed</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              AI Commerce & Marketing Platform
            </h1>

            <p className="mt-6 text-xl sm:text-2xl text-slate-300 font-normal leading-relaxed">
              The unified <strong className="text-emerald-400 font-semibold">Cloud Commerce Platform</strong> and{' '}
              <strong className="text-teal-300 font-semibold">AI Marketing Platform</strong> engineered to automate storefront selling, customer intelligence, marketing campaigns, and headless microservices.
            </p>

            <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Consolidate disparate ecommerce software, marketing automation tools, shopping assistants, and customer analytics into one intelligent cloud-native commerce engine built for B2B, B2C, and enterprise brands.
            </p>

            {/* Quick Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                id="hero-book-demo-btn"
                onClick={() => onBookDemo('Enterprise')}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] flex items-center gap-2"
              >
                <span>Book Live Architecture Tour</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-explore-taxonomy-btn"
                onClick={() => {
                  const el = document.getElementById('keyword-taxonomy-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-all flex items-center gap-2"
              >
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span>Explore 40-Keyword SEO Taxonomy</span>
              </button>

              {onOpenAiDiscovery && (
                <button
                  id="hero-api-discovery-btn"
                  onClick={onOpenAiDiscovery}
                  className="px-5 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-emerald-400 border border-emerald-500/30 font-medium text-sm transition-all flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>AI / RAG Discovery API</span>
                </button>
              )}
            </div>

            {/* Key Metrics Row */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">&lt;50ms</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">API Edge Response & Dynamic Pricing</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-2xl sm:text-3xl font-bold text-teal-300">+35%</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">Shopper Conversion Rate Lift</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">+28%</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">Average Order Value Expansion</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-2xl sm:text-3xl font-bold text-teal-300">40 Keywords</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">Cluster Authority & AEO Indexed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GEO & AEO Clear Definition Answer Box (Crucial for AI Crawlers & Search Engines) */}
      <section className="py-10 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Executive GEO/AEO Definition Block</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  What is the SilarAI AI Commerce & Marketing Platform?
                </h2>
                <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                  <strong>SilarAI</strong> is an enterprise <strong>AI Commerce & Marketing Platform</strong> that combines an API-first <strong>Commerce Cloud</strong> (B2B, B2C, and Headless), <strong>AI Marketing Automation</strong>, <strong>AI Customer Intelligence</strong>, and <strong>24/7 AI Shopping Assistants</strong> into a single headless cloud operating system. It empowers digital brands, manufacturers, distributors, and retailers to orchestrate real-time dynamic pricing, automated social and email marketing campaigns, behavioral customer segmentation, and conversational checkout without complex software fragmentation.
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Canonical Citation</span>
                <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between gap-3">
                  <span>https://silarai.com/ai-commerce-marketing-platform/</span>
                  <button
                    onClick={() => copyToClipboard('https://silarai.com/ai-commerce-marketing-platform/', 'citation')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    title="Copy canonical citation"
                  >
                    {copiedEndpoint === 'citation' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Related Pages Mapped to This Product (User Request Requirement) */}
      <section className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Unified Product Ecosystem</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Connected Platform Pages Mapped to This Product</h2>
            <p className="text-slate-400 text-base mt-3">
              The AI Commerce & Marketing Platform acts as the central umbrella unifying all specialized commerce pillars, industry verticals, and store integrations across the SilarAI network.
            </p>
          </div>

          <div className="space-y-8">
            {MAPPED_RELATED_PAGES.map((group, gIdx) => (
              <div key={gIdx} className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <Workflow className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">{group.category}</h3>
                  <span className="text-xs text-slate-500 font-mono">({group.items.length} mapped endpoints)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item, iIdx) => (
                    <button
                      key={iIdx}
                      onClick={() => onNavigateView(item.view, { pageId: item.pageId })}
                      className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/90 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white group-hover:text-emerald-300 transition-colors text-sm">
                            {item.name}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/80">
                        <span>{item.path}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 40-Keyword SEO Cluster Knowledge Matrix (User Request Requirement) */}
      <section id="keyword-taxonomy-section" className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
                <Database className="w-3.5 h-3.5" />
                <span>Authoritative Taxonomy Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                40-Keyword SEO & AEO Cluster Taxonomy
              </h2>
              <p className="text-slate-400 text-base mt-2 max-w-2xl">
                Comprehensive search and generative AI keyword clusters embedded into SilarAI backend metadata, sitemaps, OpenAPI specifications, and RAG knowledge vectors.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedKeywordFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedKeywordFilter === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All (40)
              </button>
              <button
                onClick={() => setSelectedKeywordFilter('Commerce')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedKeywordFilter === 'Commerce'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Commerce Platforms
              </button>
              <button
                onClick={() => setSelectedKeywordFilter('Marketing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedKeywordFilter === 'Marketing'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Marketing & Automation
              </button>
              <button
                onClick={() => setSelectedKeywordFilter('Cloud')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedKeywordFilter === 'Cloud'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Commerce Cloud
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-950/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      {group.category}
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                      {group.keywords.length} terms
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{group.name}</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">{group.description}</p>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 mb-4">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Embedded Target Keywords:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.keywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="px-2 py-1 rounded bg-slate-800/90 text-slate-200 text-xs font-medium border border-slate-700/80 hover:border-emerald-500/50 transition-colors"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs text-slate-400 flex items-start gap-1.5 mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{group.highlightBenefit}</span>
                  </div>
                  <button
                    onClick={() => onBookDemo('Enterprise')}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Request Demo for {group.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Full List of 40 Keywords Badge Drawer */}
          <div className="mt-12 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>All 40 Backend-Indexed Keywords (Ready for Crawlers & LLMs)</span>
              </h4>
              <button
                onClick={() => copyToClipboard(AI_COMMERCE_MARKETING_PLATFORM_KEYWORDS_LIST.join(', '), 'allKeywords')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copiedEndpoint === 'allKeywords' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied 40 Keywords</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy All 40 Keywords</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {AI_COMMERCE_MARKETING_PLATFORM_KEYWORDS_LIST.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900 text-emerald-300 border border-slate-800 hover:border-emerald-500/50 transition-colors"
                >
                  #{i + 1} {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Core Architectural Capabilities Tabs */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Deep System Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              How Unified AI Commerce & Marketing Operates
            </h2>
            <p className="text-slate-400 text-base mt-3">
              Explore the five foundational layers of the SilarAI platform driving automated sales, marketing intelligence, and customer engagement.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b border-slate-800 pb-4">
            <button
              onClick={() => setActiveTab('cloud')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'cloud'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Commerce Cloud & Headless</span>
            </button>
            <button
              onClick={() => setActiveTab('marketing')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'marketing'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>AI Marketing & Campaign Automation</span>
            </button>
            <button
              onClick={() => setActiveTab('intelligence')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'intelligence'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>AI Customer Intelligence & Segmentation</span>
            </button>
            <button
              onClick={() => setActiveTab('assistants')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'assistants'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Shopping & Sales Assistants</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'architecture'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Dynamic Pricing & Personalization</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-8 sm:p-10 shadow-xl">
            {activeTab === 'cloud' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    <Server className="w-3.5 h-3.5" />
                    <span>Commerce Cloud Infrastructure</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Headless Commerce Cloud for B2B, B2C, and Enterprises
                  </h3>
                  <p className="text-slate-300 text-base leading-relaxed">
                    SilarAI Commerce Cloud decouples frontend buyer interfaces from complex backend databases. Whether powering wholesale customer portals, D2C web apps, or mobile checkouts, the architecture delivers sub-50ms API queries and zero downtime scaling.
                  </p>
                  <ul className="space-y-2.5 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>Headless Commerce Cloud:</strong> API-first GraphQL & REST services connecting React, Vue, Next.js, and mobile apps.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>B2B Commerce Cloud:</strong> Tiered contract pricing, corporate account hierarchies, credit lines, and matrix reordering.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>B2C Commerce Cloud:</strong> Ultra-fast 1-click checkout, guest purchasing, and omnichannel POS inventory sync.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
                  <div className="text-slate-500">// Commerce Cloud API Endpoint Sample</div>
                  <div className="text-emerald-400">GET /api/commerce-cloud/storefront/v2/catalog</div>
                  <div className="text-slate-400">Response Header: <span className="text-teal-300">x-cache: HIT • latency: 28ms</span></div>
                  <pre className="bg-slate-900 p-3 rounded border border-slate-800 text-[11px] overflow-x-auto text-emerald-300">
{`{
  "platform": "SilarAI Commerce Cloud",
  "architecture": "Headless Microservices",
  "tenantType": "Hybrid B2B & B2C",
  "edgeLatencyMs": 28,
  "realtimeErpSync": true,
  "supportedChannels": ["Web", "iOS", "Android", "WhatsApp"]
}`}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'marketing' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>AI Marketing Automation</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Autonomous Campaign Generation & Multichannel Marketing
                  </h3>
                  <p className="text-slate-300 text-base leading-relaxed">
                    Eliminate repetitive marketing labor. SilarAI AI marketing software analyzes your catalog additions, trending products, and inventory gluts to automatically write SEO-rich product descriptions, generate promotional copy, and schedule social media campaigns.
                  </p>
                  <ul className="space-y-2.5 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>AI Campaign Automation:</strong> Automated creation of promotional discount banners, copy, and product bundles.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>AI Ecommerce Marketing:</strong> Multilingual social media posts crafted for Instagram, LinkedIn, Facebook, and WhatsApp.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>Cart Recovery Sequences:</strong> Dynamic email and WhatsApp recovery notifications yielding +32% recovered sales.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Automated Campaign Preview</div>
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Trigger: New Summer Collection Upload</span>
                      <span className="text-emerald-400 font-semibold">Status: Published</span>
                    </div>
                    <p className="text-slate-200 font-sans italic">
                      "Upgrade your warm-weather wardrobe with breathable organic linen shirts, engineered for effortless coastal style. Order today for complimentary next-day delivery."
                    </p>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Channels: Meta Ads • Email Blast • WhatsApp VIP Broadcast
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>AI Customer Intelligence</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Predictive RFM Segmentation & Customer Intelligence
                  </h3>
                  <p className="text-slate-300 text-base leading-relaxed">
                    Stop blasting identical messages to every customer. SilarAI monitors shopper clicks, session duration, reorder cadence, and cart abandonments to generate self-updating behavioral segments that maximize Customer Lifetime Value (CLV).
                  </p>
                  <ul className="space-y-2.5 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>AI Customer Segmentation:</strong> Automatic categorization into VIP Champions, Potential Churners, and Deal Seekers.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>AI Customer Engagement:</strong> Contextual product drops and loyalty rewards tailored to specific buyer segments.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>AI Marketing Analytics:</strong> Real-time cohort retention charts and multi-touch attribution reports.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                  <div className="text-xs font-bold text-teal-300 uppercase tracking-wider font-sans">Dynamic Customer Cohorts</div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded bg-slate-900 flex items-center justify-between border border-slate-800">
                      <span className="text-emerald-400 font-semibold">VIP High-Spend Repeaters</span>
                      <span className="text-slate-400">1,420 buyers • $480 AOV</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 flex items-center justify-between border border-slate-800">
                      <span className="text-amber-400 font-semibold">At-Risk Wholesale Accounts</span>
                      <span className="text-slate-400">84 buyers • 45 days silent</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 flex items-center justify-between border border-slate-800">
                      <span className="text-teal-400 font-semibold">High-Intent Window Shoppers</span>
                      <span className="text-slate-400">6,190 visitors • 3+ visits</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assistants' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Conversational Selling</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    24/7 AI Shopping Assistant & AI Sales Automation
                  </h3>
                  <p className="text-slate-300 text-base leading-relaxed">
                    Convert hesitating site visitors into confident buyers with autonomous shopping assistants. Shoppers can search naturally, upload product reference photos, ask complex technical compatibility questions, and complete purchases directly in chat.
                  </p>
                  <ul className="space-y-2.5 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>Natural-Language Product Search:</strong> Understands complex constraints like "energy-efficient refrigerator under 33 inches wide".</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>In-Chat Cross-Sell & Upsell:</strong> Recommends companion cables, warranties, and premium models with clear benefit comparison.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>WhatsApp Commerce:</strong> Complete conversational catalog browsing and order updates over Meta WhatsApp Cloud API.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live Conversational Experience</div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-left">
                      <strong>Customer:</strong> "I need a high-temperature industrial sealant that resists oil and cures in 2 hours."
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-left">
                      <strong>AI Assistant:</strong> "I recommend the UltraSeal 9000 Silicone RTV. It handles temperatures up to 350°C, fully sets in 120 minutes, and resists automotive synthetic oils. We have 42 cartridges in stock at $24.50 each."
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'architecture' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Real-Time Engine</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Sub-50ms Dynamic Pricing & Personalized Merchandising
                  </h3>
                  <p className="text-slate-300 text-base leading-relaxed">
                    SilarAI evaluates customer contract tiers, regional currencies, stock availability, and competitor pricing in under 50 milliseconds using globally distributed cloud edge functions.
                  </p>
                  <ul className="space-y-2.5 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>Sub-50ms Latency:</strong> Lightning-fast price lookups that never slow down storefront page speed or SEO scores.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>Automated Visual Merchandising:</strong> AI dynamically reorganizes product catalog grids based on trending demand.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                      <span><strong>B2B Contract Guardrails:</strong> Enforces minimum margin boundaries and customer-specific negotiated discount rules.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="text-xs font-bold text-emerald-400 uppercase font-sans">Edge Pricing Recalculation Benchmark</div>
                  <div className="space-y-1 text-slate-400">
                    <div>Catalog Size: <span className="text-white">180,000 SKUs</span></div>
                    <div>Pricing Rules: <span className="text-white">Customer Tier + Vol Discounts</span></div>
                    <div>Evaluation Duration: <span className="text-emerald-400 font-bold">34ms (Edge Cached)</span></div>
                    <div>ERP Stock ATP Sync: <span className="text-teal-300">Sub-second Webhook</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Answer Engine Optimization (AEO / AIO) FAQ Section */}
      <section className="py-20 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Answer Engine Optimization (AEO)</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Frequently Asked Questions (AEO Knowledge Repository)
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Direct, authoritative question-and-answer pairs curated for Google AI Overviews, Perplexity, and conversational search engines.
            </p>
          </div>

          <div className="space-y-4">
            {AEO_CLUSTER_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaqIndex(activeFaqIndex === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-white hover:text-emerald-300 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-emerald-400 transition-transform ${
                      activeFaqIndex === idx ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backend API Endpoints & Developer Access */}
      <section className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>Public Developer & AI Crawler Endpoints</span>
                </div>
                <h3 className="text-xl font-bold text-white">Direct Backend SEO & GEO APIs</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Access live JSON endpoints powering AI agent crawlers, RAG vectors, and structured schema verification.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="/ai/keywords.json"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <span>/ai/keywords.json</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="/ai/seo.json"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <span>/ai/seo.json</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <span>/llms.txt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <span>/sitemap.xml</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Conversion CTA */}
      <section className="py-20 bg-gradient-to-t from-slate-900 to-slate-950 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Unify Your Commerce and Marketing with AI?
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Experience how the SilarAI AI Commerce & Marketing Platform accelerates conversions, boosts order sizes, and eliminates software sprawl.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onBookDemo('Enterprise')}
              className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-emerald-500/20 hover:scale-105 flex items-center gap-2"
            >
              <span>Schedule Architecture Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateView('ai-shopping-assistant')}
              className="px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-colors"
            >
              <span>Test AI Shopping Assistant</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
