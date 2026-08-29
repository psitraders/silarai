import React, { useState } from 'react';
import {
  Package,
  Sparkles,
  Bot,
  Search,
  TrendingUp,
  Boxes,
  Layers,
  ShoppingBag,
  Zap,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  Users,
  Building2,
  BookOpen,
  ArrowUpRight,
  Utensils,
  Milk,
  Cookie,
  Apple,
  Sparkle,
  Home,
  Baby,
  Dog,
  HeartPulse,
  ShieldCheck,
  Check,
  XCircle,
  Store,
  Truck,
  BarChart3,
  Megaphone,
  Database,
  Tag,
  CreditCard,
  FileText
} from 'lucide-react';

interface FmcgIndustryPageProps {
  onBackToHome: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
}

// 10 Supporting Content Cluster Articles for FMCG AI Commerce
const FMCG_CLUSTER_ARTICLES = [
  {
    id: 'ai-shopping-assistant-fmcg',
    title: 'AI Shopping Assistants for FMCG Brands',
    readTime: '6 min read',
    excerpt: 'How 24/7 conversational digital advisors help retailers, distributors, and consumers discover FMCG products, compare variants, and place instant orders.',
    content: `
### Conversational Ordering & Discovery in FMCG
Fast-Moving Consumer Goods (FMCG) catalogs contain thousands of SKUs, packaging sizes, flavor variants, and promotional bundles. SilarAI Shopping Assistants enable retailers, distributors, and end consumers to query catalogs in plain language and complete purchases seamlessly.

### Core Capabilities for Consumer Goods
- **Natural Language Intent Matching**: Retailers can type "Show me sugar-free beverages in 250ml cans with trade discount" and instantly see matching SKUs.
- **Multilingual & Voice Ordering**: Supports voice inquiries and text messaging in 20+ languages for store owners and field sales reps.
- **In-Chat Quick Reordering**: Enables 1-click repeat orders based on previous order history and seasonal demand patterns.

### Verified Results
FMCG brands deploying SilarAI Shopping Assistants report **+320% increase in digital ordering frequency** and a **45% reduction in sales rep order-taking overhead**.
    `,
    keywords: ['AI Shopping Assistant for FMCG', 'FMCG Commerce Platform', 'Conversational Commerce'],
  },
  {
    id: 'b2b-distributor-retailer-ordering',
    title: 'Digitizing FMCG Distributor & Retailer Ordering',
    readTime: '8 min read',
    excerpt: 'Transforming manual telephone and field rep order-taking into high-speed digital B2B commerce with credit limits, custom pricing, and tier discounts.',
    content: `
### The Challenge of Traditional FMCG Distribution
FMCG manufacturers rely heavily on complex networks of distributors, wholesalers, supermarkets, and general trade retailers. Paper orders and manual entry cause delayed deliveries, stockouts, and order errors.

### SilarAI Digital B2B Commerce Architecture
- **Customer-Specific Pricing & Credit Rules**: Automatically applies negotiated pricing matrices, volume discounts, and credit limits per buyer.
- **Quick Matrix Bulk Ordering**: Allows retailers to order hundreds of SKUs simultaneously across variants and case quantities.
- **Automated Invoice & Delivery Tracking**: Provides real-time order status, invoice downloads, and shipment tracking integrated with ERPs.
    `,
    keywords: ['FMCG B2B Commerce', 'FMCG Distributor Portal', 'FMCG Retailer Portal'],
  },
  {
    id: 'b2b2c-commerce-strategy-cpg',
    title: 'B2B2C Commerce Strategy for Consumer Packaged Goods',
    readTime: '7 min read',
    excerpt: 'Unifying manufacturer product information, marketing promotions, distributor fulfillment, and consumer shopping touchpoints.',
    content: `
### Unifying the CPG Value Chain
B2B2C commerce bridges the gap between CPG manufacturers and end-consumers while empowering local distributor networks with order fulfillment.

### Key Capabilities
- **Brand-Controlled Product Data**: Guarantees consistent ingredient lists, nutritional badges, media assets, and promotional messaging.
- **Intelligent Order Routing**: Routes consumer or retailer orders directly to the nearest regional distributor or distribution center for fastest fulfillment.
- **Shared Trade Promotions**: Synchronizes manufacturer-sponsored discount campaigns across distributor and retailer channels in real time.
    `,
    keywords: ['B2B2C Commerce Platform', 'Consumer Goods AI', 'CPG Digital Commerce'],
  },
  {
    id: 'ai-marketing-automation-fmcg',
    title: 'AI Marketing Automation & Campaign Personalization in FMCG',
    readTime: '6 min read',
    excerpt: 'Creating targeted omnichannel promotional campaigns across WhatsApp, Email, SMS, and Web using AI buyer segmentation.',
    content: `
### Data-Driven FMCG Marketing
FMCG margins require high velocity and repeat purchase behavior. AI marketing analyzes buyer purchase intervals, category affinities, and seasonal spikes to deploy targeted promotions automatically.

### Automated Campaign Execution
- **Multi-Channel Engagement**: Sends personalized promotional offers directly on WhatsApp, SMS, Email, and mobile web apps.
- **Predictive Replenishment Alerts**: Reminds retailers and consumers to restock fast-moving items before running out of stock.
- **Automated Trade Campaign Tracking**: Measures trade promotion conversion rates and coupon redemption in real time.
    `,
    keywords: ['AI Marketing for FMCG', 'FMCG Promotion Management', 'FMCG Customer Engagement'],
  },
  {
    id: 'intelligent-product-discovery-skus',
    title: 'Intelligent Semantic Product Discovery for Thousands of SKUs',
    readTime: '5 min read',
    excerpt: 'Replacing rigid keyword search with vector semantic AI that understands health claims, flavor profiles, and packaging sizes.',
    content: `
### Moving Beyond Exact Word Matches
When a retailer searches for "Healthy breakfast cereals" or "Sugar-free beverages", traditional search fails if products are tagged with technical industry codes.

### Vector Retrieval Engine
- **Semantic Understanding**: Recognizes dietary, lifestyle, and category concepts (e.g. "organic baby food", "eco-friendly cleaning").
- **Synonym & Misspelling Tolerance**: Handles regional product names, brand abbreviations, and common typos effortlessly.
- **Zero-Result Elimination**: Always recommends top-matching alternatives with live inventory status.
    `,
    keywords: ['AI Product Discovery', 'Semantic FMCG Search', 'FMCG Product Search'],
  },
  {
    id: 'self-service-portals-fmcg',
    title: 'Self-Service Retailer & Distributor Portals for FMCG',
    readTime: '6 min read',
    excerpt: 'Empowering trade partners to check stock, view trade prices, place orders, and download invoices 24/7 without sales rep intervention.',
    content: `
### 24/7 Trade Partner Self-Service
Distributors and retail store owners need to place reorders outside standard business hours. SilarAI self-service portals provide instant 24/7 access.

### Key Portal Features
- **Interactive Digital Catalog**: Browse full product line with live stock status and batch expiration dates.
- **Account & Credit Management**: View credit balances, payment history, and pending invoices.
- **1-Click Repeat Orders**: Re-order recent baskets with adjusted case counts in seconds.
    `,
    keywords: ['FMCG Distributor Portal', 'FMCG Retailer Portal', 'FMCG Self-Service Commerce'],
  },
  {
    id: 'ai-recommendations-promotional-bundles',
    title: 'AI Product Recommendations & Dynamic Promotional Bundles',
    readTime: '5 min read',
    excerpt: 'Increasing basket size and clearing stock with intelligent cross-sell algorithms and dynamic trade promotion bundling.',
    content: `
### Maximizing Basket Size & Order Volume
SilarAI continuously evaluates purchasing habits across distributor tiers and consumer segments to generate high-converting product combinations.

### Recommendation Engines
- **Complementary Product Pairing**: Recommends snack items alongside beverage orders or personal care kits with cosmetics.
- **Automated Tier Discounts**: Calculates instant volume discounts (e.g., "Add 5 more cases to unlock 8% extra trade margin").
- **New Product Launch Boosters**: Promotes new SKU launches to relevant existing buyer accounts automatically.
    `,
    keywords: ['FMCG Product Recommendations', 'Dynamic Trade Promotions', 'Basket Building AI'],
  },
  {
    id: 'enterprise-erp-integration-fmcg',
    title: 'Enterprise ERP Integration (SAP, Oracle, Dynamics) for FMCG Commerce',
    readTime: '7 min read',
    excerpt: 'Synchronizing products, stock, pricing, order entries, and customer records between SilarAI and ERP backbones in real time.',
    content: `
### Real-Time ERP & Supply Chain Sync
FMCG businesses depend on accurate stock levels and automated order posting to ERP backbones like SAP S/4HANA, Oracle Cloud, Microsoft Dynamics 365, Salesforce, ERPNext, and Odoo.

### Integration Capabilities
- **Bi-Directional Order Posting**: Pushes confirmed digital orders instantly into ERP sales order modules.
- **Real-Time Stock Synchronization**: Updates inventory counts across warehouses and distribution hubs every second.
- **Customer Master Sync**: Maintains unified pricing tiers, credit limits, and tax IDs across platforms.
    `,
    keywords: ['FMCG ERP Integration', 'SAP FMCG Commerce', 'Oracle Dynamics FMCG'],
  },
  {
    id: 'omnichannel-fmcg-modern-general-trade',
    title: 'Omnichannel FMCG Commerce Across Modern & General Trade',
    readTime: '6 min read',
    excerpt: 'Serving supermarkets, hypermarkets, kirana/general stores, wholesalers, and direct-to-consumer online channels seamlessly.',
    content: `
### Bridging Modern Trade & General Trade
FMCG sales span distinct sales channels: large modern trade supermarket chains with EDI requirements, and thousands of independent general trade retailers needing WhatsApp ordering.

### Channel Customization
- **Modern Trade EDI & Portal Support**: Coordinates bulk purchase orders, delivery slots, and compliance documentation.
- **General Trade WhatsApp Assistant**: Enables mom-and-pop store owners to order via voice notes or text on WhatsApp.
- **Direct-to-Consumer (D2C) Storefront**: Enables manufacturers to test new brand concepts direct to shoppers online.
    `,
    keywords: ['Omnichannel FMCG Commerce', 'General Trade Retailer Ordering', 'Modern Trade Commerce'],
  },
  {
    id: 'realtime-analytics-demand-forecasting',
    title: 'Real-Time Customer Analytics & Demand Forecasting for CPG Brands',
    readTime: '7 min read',
    excerpt: 'Gaining actionable visibility into sales trends, product velocity, promotion performance, and regional demand spikes.',
    content: `
### Data-Driven FMCG Growth
Eliminate blind spots in distributor inventory and sales performance with real-time AI dashboards.

### Analytics Suite
- **Product Velocity Tracking**: Identifies fast-moving vs slow-moving SKUs by territory and channel.
- **Trade Promotion ROI**: Measures exact revenue lift generated by trade discounts and seasonal campaigns.
- **Predictive Demand Sensing**: Flags impending stockouts based on historical order velocity and localized weather/events.
    `,
    keywords: ['FMCG Customer Analytics', 'CPG Demand Sensing', 'FMCG Sales Visibility'],
  },
];

export const FmcgIndustryPage: React.FC<FmcgIndustryPageProps> = ({
  onBackToHome,
  onBookDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'comparison' | 'features' | 'sectors' | 'clusters' | 'faqs'>('overview');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('ai-shopping-assistant-fmcg');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [searchDemoQuery, setSearchDemoQuery] = useState<string>('Healthy breakfast cereals');
  const [demoQueryResult, setDemoQueryResult] = useState<string | null>('Retrieved 14 high-fiber organic cereal SKUs. Available in 250g & 500g boxes with instant distributor trade discount application.');

  const handleSearchDemo = (q: string) => {
    setSearchDemoQuery(q);
    const queryLower = q.toLowerCase();
    if (queryLower.includes('beverage') || queryLower.includes('drink') || queryLower.includes('sugar-free')) {
      setDemoQueryResult('Found 22 sugar-free sparkling & energy drinks in 250ml/330ml cans with 12% bulk tier trade discount.');
    } else if (queryLower.includes('baby') || queryLower.includes('organic')) {
      setDemoQueryResult('Found 18 certified organic baby food purees & formulas (In Stock at Regional Warehouse, 24-hr shipment).');
    } else if (queryLower.includes('personal') || queryLower.includes('care') || queryLower.includes('cleaning')) {
      setDemoQueryResult('Retrieved 30 premium eco-friendly household cleaning & personal care product SKUs with promotional bundle options.');
    } else if (queryLower.includes('dairy') || queryLower.includes('reorder') || queryLower.includes('bulk')) {
      setDemoQueryResult('Generated bulk order quote for 50 cases fresh dairy items. Total: $1,420 (Applied 8% Distributor Trade Margin & SAP ERP Sync Ready).');
    } else {
      setDemoQueryResult(`Semantic AI search results for "${q}": 16 matching FMCG SKUs retrieved with real-time stock, trade pricing, and ERP integration.`);
    }
  };

  const currentArticle = FMCG_CLUSTER_ARTICLES.find((a) => a.id === selectedClusterId) || FMCG_CLUSTER_ARTICLES[0];

  const FMCG_SECTORS = [
    { name: 'Food & Beverage', icon: Utensils, desc: 'Nutritional claims, dietary filters, batch expiration tracking, and temperature zone logistics.' },
    { name: 'Packaged Foods', icon: Package, desc: 'Multiple pack sizes, promotional bundles, barcode lookup, and shelf-life monitoring.' },
    { name: 'Dairy Products', icon: Milk, desc: 'Cold-chain stock visibility, daily replenishment cycles, and quick retailer reorders.' },
    { name: 'Snacks & Confectionery', icon: Cookie, desc: 'Impulse purchase recommendations, seasonal holiday packs, and high-velocity bulk packs.' },
    { name: 'Beverages & Soft Drinks', icon: Apple, desc: 'Crate and pallet volume pricing, bottle deposit calculations, and regional distributor routing.' },
    { name: 'Personal Care & Cosmetics', icon: Sparkle, desc: 'Shade guidance, ingredient transparency, routine bundles, and high-margin trade discounts.' },
    { name: 'Home & Cleaning Care', icon: Home, desc: 'Refill pouch subscriptions, bulk commercial sizing, and safety documentation downloads.' },
    { name: 'Baby Care', icon: Baby, desc: 'Age-stage product progression, subscription reorders, and certified organic safety badges.' },
    { name: 'Pet Care', icon: Dog, desc: 'Breed and weight nutrition calculators, auto-ship subscriptions, and treat bundles.' },
    { name: 'Health & Wellness', icon: HeartPulse, desc: 'Supplement facts, dosage guides, regulatory compliance badges, and recurring reorders.' },
    { name: 'Consumer Packaged Goods (CPG)', icon: Boxes, desc: 'Multi-brand portfolio management, unified distributor portals, and trade promotion analytics.' },
    { name: 'Wholesale & Supermarkets', icon: Store, desc: 'EDI integration, modern trade portal ordering, and delivery slot reservations.' },
  ];

  const FMCG_FAQS = [
    {
      q: 'What is AI Commerce for FMCG companies?',
      a: 'AI Commerce uses artificial intelligence to improve product discovery, customer engagement, distributor ordering, retailer commerce, marketing automation, and digital sales. It enables FMCG companies to deliver intelligent buying experiences across B2B, B2C, and B2B2C channels.',
    },
    {
      q: 'How does an AI Shopping Assistant help FMCG brands?',
      a: 'An AI Shopping Assistant helps retailers, distributors, and consumers discover products, compare alternatives, receive personalized recommendations, check inventory, and place orders through natural language conversations. This improves customer experience while increasing sales and reducing support costs.',
    },
    {
      q: 'Can SilarAI support distributor and retailer ordering?',
      a: 'Yes. SilarAI provides AI-powered B2B commerce, distributor portals, retailer portals, negotiated pricing, promotion management, bulk ordering, credit management, and ERP integration.',
    },
    {
      q: 'Can SilarAI integrate with ERP systems?',
      a: 'Yes. SilarAI integrates with SAP, Oracle, Microsoft Dynamics 365, Salesforce, ERPNext, Odoo, and other enterprise platforms to synchronize products, inventory, pricing, customers, and orders.',
    },
    {
      q: 'How does AI improve FMCG marketing?',
      a: 'AI analyzes customer behavior, purchase history, and shopping intent to deliver personalized campaigns, targeted promotions, product recommendations, and loyalty offers across digital channels.',
    },
    {
      q: 'Which FMCG businesses benefit from SilarAI?',
      a: 'SilarAI supports food manufacturers, beverage companies, personal care brands, household product manufacturers, consumer packaged goods companies, distributors, wholesalers, retailers, and D2C brands.',
    },
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans">
      {/* Structural Structured Data / JSON-LD for Search & AI Answer Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                '@id': 'https://silarai.com/?page=fmcg-commerce#webpage',
                url: 'https://silarai.com/?page=fmcg-commerce',
                name: 'AI Commerce Platform for FMCG Brands | AI Shopping Assistant | SilarAI',
                description:
                  'Transform FMCG sales with AI Shopping Assistants, B2B commerce, distributor portals, retailer ordering, AI marketing, ERP integration, and intelligent product discovery.',
              },
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI FMCG Commerce AI Platform',
                operatingSystem: 'Cloud Native / Web / Headless API',
                applicationCategory: 'BusinessApplication',
                description:
                  'Enterprise AI Commerce Platform for FMCG Companies featuring AI Shopping Assistants, B2B Commerce, Distributor Portals, Retailer Ordering, and ERP Integration.',
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.9',
                  ratingCount: '215',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Commerce Platform for FMCG Companies',
                provider: {
                  '@type': 'Organization',
                  name: 'SilarAI Technologies',
                  url: 'https://silarai.com',
                },
                areaServed: 'Worldwide',
                serviceType: 'FMCG & CPG AI Commerce Solutions',
              },
              {
                '@type': 'FAQPage',
                mainEntity: FMCG_FAQS.map((faq) => ({
                  '@type': 'Question',
                  name: faq.q,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.a,
                  },
                })),
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://silarai.com' },
                  { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://silarai.com/#industries' },
                  { '@type': 'ListItem', position: 3, name: 'FMCG Commerce AI', item: 'https://silarai.com/?page=fmcg-commerce' },
                ],
              },
            ],
          }),
        }}
      />

      {/* Top Banner & Breadcrumb Navigation */}
      <div className="bg-slate-900 text-slate-300 py-3 px-4 sm:px-6 lg:px-8 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="hover:text-peach-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              ← Back to Home
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-medium">Industry Solutions</span>
            <span className="text-slate-600">/</span>
            <span className="text-peach-300 font-extrabold flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              FMCG &amp; CPG Commerce AI Platform
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-plum-800 text-peach-200 px-2.5 py-0.5 rounded-full font-bold border border-plum-700">
              Enterprise FMCG Specification v3.1
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section & Interactive FMCG Intent Simulator */}
      <section className="relative pt-12 pb-20 bg-gradient-to-b from-plum-950 via-plum-900 to-slate-900 text-white overflow-hidden">
        {/* Background Decorative Accent Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-peach-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-800/80 border border-peach-300/40 text-peach-300 text-xs font-black uppercase tracking-wider">
                <Package className="w-4 h-4 text-peach-300" />
                <span>FMCG &amp; CPG Industry Solution Pillar</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                AI Commerce Platform for FMCG Companies
              </h1>

              <h2 className="text-xl sm:text-2xl font-extrabold text-peach-300">
                Accelerate FMCG Growth with AI-Powered Commerce
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Fast-Moving Consumer Goods (FMCG) companies operate in one of the world's most competitive markets. Managing distributors, retailers, wholesalers, D2C channels, promotions, pricing, and product launches requires more than traditional commerce software.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                SilarAI Commerce AI helps FMCG manufacturers and brands transform customer engagement, distributor commerce, retailer ordering, AI marketing, and omnichannel sales through a single enterprise AI commerce platform.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                From product discovery to retailer ordering and AI-powered customer engagement, SilarAI enables FMCG businesses to sell smarter, respond faster, and grow revenue across every channel.
              </p>

              {/* Call to Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onBookDemo('FMCG AI Commerce')}
                  className="px-6 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-lg hover:shadow-peach-300/20 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Book a Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('fmcg-features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-plum-800/90 hover:bg-plum-800 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-peach-300" />
                  <span>See FMCG AI Commerce in Action</span>
                </button>
              </div>

              {/* Verified Metrics Badge Bar */}
              <div className="pt-6 border-t border-plum-800/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">+320%</div>
                  <div className="text-xs text-slate-400 font-medium">Distributor Order Velocity</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">-45%</div>
                  <div className="text-xs text-slate-400 font-medium">Sales Rep Order-Taking Workload</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">100%</div>
                  <div className="text-xs text-slate-400 font-medium">Real-Time ERP Stock Sync</div>
                </div>
              </div>

            </div>

            {/* Interactive FMCG Intent Search & Order Simulator Widget */}
            <div className="lg:col-span-5 bg-white/95 text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Live FMCG Product &amp; Order AI</h3>
                    <p className="text-[10px] text-slate-500">Test Semantic Search &amp; Distributor Ordering</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ERP Connected
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Type or select an FMCG discovery or bulk order query:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchDemoQuery}
                    onChange={(e) => setSearchDemoQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchDemo(searchDemoQuery)}
                    className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-plum-600 bg-slate-50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    onClick={() => handleSearchDemo(searchDemoQuery)}
                    className="absolute right-1.5 top-1.5 px-3 py-1 bg-plum-700 text-white rounded-lg text-xs font-bold hover:bg-plum-800 transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </div>

                {/* Preset Intent Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Healthy breakfast cereals',
                    'Sugar-free beverages',
                    'Organic baby products',
                    'Premium personal care products',
                    'Household cleaning products',
                    'Bulk retailer reorder 50 cases dairy',
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSearchDemo(preset)}
                      className="text-[11px] bg-slate-100 hover:bg-peach-100 text-slate-700 hover:text-plum-950 px-2.5 py-1 rounded-lg border border-slate-200 transition-all text-left cursor-pointer"
                    >
                      "{preset}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Demo Output Card */}
              {demoQueryResult && (
                <div className="p-3.5 rounded-xl bg-plum-50 border border-plum-200 text-slate-800 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-plum-900 font-extrabold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-plum-700" />
                    <span>FMCG Semantic AI Engine (<span className="text-emerald-600 font-bold">38ms response</span>)</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    {demoQueryResult}
                  </p>
                  <div className="pt-2 border-t border-plum-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Distributor Portal Status: <strong className="text-slate-800 font-bold">Live Inventory</strong></span>
                    <span className="text-plum-700 font-bold">SAP &amp; Oracle Sync Ready</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Integrated with SAP, Oracle, Dynamics 365, Salesforce &amp; WhatsApp</span>
                <a href="#fmcg-features" className="text-plum-700 font-bold hover:underline">View Features ↓</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Navigation Sticky Bar for FMCG Page Sections */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-3">
          {[
            { id: 'overview', label: 'Why FMCG Needs AI' },
            { id: 'challenges', label: 'FMCG Challenges & Solutions' },
            { id: 'comparison', label: 'Traditional vs SilarAI AI' },
            { id: 'features', label: 'Platform Features (10)' },
            { id: 'sectors', label: 'FMCG Sectors (14)' },
            { id: 'clusters', label: 'Content Hub & Articles (10)' },
            { id: 'faqs', label: 'FMCG FAQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                const el = document.getElementById(`fmcg-${tab.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-plum-950 text-peach-300 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Why FMCG Companies Need AI Commerce */}
      <section id="fmcg-overview" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              The FMCG Digital Transformation
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Why FMCG Companies Need AI Commerce
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Today's distributors, retailers, and consumers expect instant product information, personalized recommendations, self-service ordering, and real-time inventory visibility. Traditional ERP and ordering systems manage transactions but often fail to deliver intelligent buying experiences.
            </p>
            <p className="text-base text-slate-600 leading-relaxed font-medium">
              SilarAI Commerce AI combines AI Shopping Assistants, AI Marketing, B2B commerce, retailer portals, distributor management, and enterprise integrations into one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Digitized Retailer &amp; Trade Ordering</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Replaces manual phone calls and sales rep order-taking with 24/7 self-service digital portals and WhatsApp order bots.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Dynamic Pricing &amp; Promotions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Applies channel-specific trade margins, promotional bundles, and volume tier discounts automatically per buyer tier.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Enterprise ERP Synchronization</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connects directly to SAP, Oracle, Dynamics 365, Salesforce, and ERPNext to synchronize stock, orders, and customer balances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Challenges Faced by FMCG Companies & How SilarAI Solves Them */}
      <section id="fmcg-challenges" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Solving Industry Pain Points
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Challenges Faced by FMCG Companies &amp; SilarAI Solutions
            </h2>
            <p className="text-base text-slate-600">
              How SilarAI Commerce AI transforms traditional FMCG bottlenecks into high-margin automated channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Challenge 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #1
                </span>
                <span className="text-xs font-bold text-slate-400">Portfolios</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Large Product Portfolios</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                FMCG companies manage thousands of SKUs, variants, pack sizes, and promotional bundles. Finding the right product quickly is difficult for distributors, retailers, and consumers.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Semantic AI Product Discovery that finds products by intent, health claims, or pack size instead of exact SKU codes.
                </p>
              </div>
            </div>

            {/* Challenge 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #2
                </span>
                <span className="text-xs font-bold text-slate-400">Distribution</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Complex Distribution Networks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Selling across supermarkets, retail chains, wholesalers, distributors, general trade, modern trade, ecommerce, and D2C channels manually creates massive inefficiencies.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Unified B2B &amp; B2B2C Commerce platform coordinating orders, inventory, and promotions across all trade channels.
                </p>
              </div>
            </div>

            {/* Challenge 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #3
                </span>
                <span className="text-xs font-bold text-slate-400">Pricing</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Promotion &amp; Pricing Complexity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Different trade partners require customized pricing, tier promotions, and discount structures across channels that are prone to manual calculation errors.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Automated Promotion Management engine enforcing customer-specific trade pricing, volume breaks, and rebate tracking.
                </p>
              </div>
            </div>

            {/* Challenge 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #4
                </span>
                <span className="text-xs font-bold text-slate-400">Ordering</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Slow Retailer Ordering</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retailers need a faster way to discover products, reorder inventory, and access trade promotions without waiting for weekly sales representative visits.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Self-service Retailer &amp; Distributor Portals with 1-click reordering and instant WhatsApp chat ordering.
                </p>
              </div>
            </div>

            {/* Challenge 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #5
                </span>
                <span className="text-xs font-bold text-slate-400">Engagement</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Customer Engagement Challenges</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consumers expect personalized shopping experiences, instant support, and intelligent product recommendations across websites, mobile apps, and messaging apps.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  24/7 AI Shopping Assistant &amp; AI Marketing Platform delivering personalized campaigns on WhatsApp, Email &amp; Web.
                </p>
              </div>
            </div>

            {/* Challenge 6 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #6
                </span>
                <span className="text-xs font-bold text-slate-400">Visibility</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Limited Sales Visibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sales teams lack real-time insights into orders, promotions, warehouse inventory levels, and shifting regional customer demand.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Real-time Customer &amp; Sales Analytics with ERP integration and predictive demand sensing dashboards.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Comparison Section: Traditional FMCG Sales vs SilarAI Powered FMCG Commerce */}
      <section id="fmcg-comparison" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full border border-peach-400">
              Value Proposition &amp; ROI Transformation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Traditional FMCG Sales vs. SilarAI Powered FMCG Commerce
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Compare legacy order-taking and manual trade management against SilarAI's AI Commerce Platform. Discover how automating trade distribution, semantic SKU search, and WhatsApp ordering unlocks massive margin growth.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-2 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-peach-300/10 rounded-full blur-xl pointer-events-none" />
              <div className="text-3xl sm:text-4xl font-black text-peach-300">+320%</div>
              <div className="text-sm font-extrabold text-slate-200">Distributor Digital Order Velocity</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accelerates reorders across retailers and general trade partners via self-service portals and 24/7 WhatsApp AI bots.
              </p>
            </div>

            <div className="bg-plum-950 text-white p-6 rounded-2xl border border-plum-900 shadow-lg space-y-2 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-plum-700/20 rounded-full blur-xl pointer-events-none" />
              <div className="text-3xl sm:text-4xl font-black text-peach-200">-45%</div>
              <div className="text-sm font-extrabold text-plum-100">Order Taking &amp; Support Overhead</div>
              <p className="text-xs text-plum-300/80 leading-relaxed">
                Automates SKU search, catalog inquiries, trade pricing checks, and invoice requests with zero manual rep intervention.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-2 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">100%</div>
              <div className="text-sm font-extrabold text-slate-200">Real-Time ERP Sync Accuracy</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bi-directional live integration with SAP, Oracle, Microsoft Dynamics 365, Salesforce, and ERPNext eliminates phantom inventory.
              </p>
            </div>
          </div>

          {/* Detailed Comparison Table Container */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            
            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-5 px-6 bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider w-1/4">
                      Capability / Dimension
                    </th>
                    <th className="py-5 px-6 bg-red-50/70 text-red-950 font-black text-xs uppercase tracking-wider w-3/8 border-l border-red-100">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Traditional FMCG Sales</span>
                      </div>
                    </th>
                    <th className="py-5 px-6 bg-plum-950 text-peach-300 font-black text-xs uppercase tracking-wider w-3/8 border-l border-plum-900 shadow-md">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-peach-300 shrink-0" />
                        <span>SilarAI Powered FMCG Commerce</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700 font-medium">
                  {[
                    {
                      dimension: 'Product Search & Discovery',
                      icon: Search,
                      traditional: 'Rigid keyword search or static paper catalogs. Struggles with complex health claims, packaging variants, or misspelled queries across 1,000s of SKUs.',
                      silarAi: 'Conversational Semantic AI Search that understands plain language intent (e.g. "sugar-free beverages in 250ml cans") with instant stock status & dietary filters.',
                      impact: '10x Faster Discovery',
                    },
                    {
                      dimension: 'Retailer & Distributor Ordering',
                      icon: Store,
                      traditional: 'Manual phone calls, paper order forms, or waiting for weekly sales rep visits. High order entry error rates and delayed processing.',
                      silarAi: '24/7 Self-Service Trade Portals & WhatsApp Conversational Order Assistant with 1-click repeat reordering for general and modern trade.',
                      impact: '+320% Order Velocity',
                    },
                    {
                      dimension: 'Trade Pricing & Promotions',
                      icon: Tag,
                      traditional: 'Static price sheets, manual trade rebate spreadsheets, and delayed volume discount calculations prone to billing disputes.',
                      silarAi: 'Automated Trade Rules Engine applying customer-specific pricing matrices, volume tier breaks, and promotional bundles automatically per account.',
                      impact: '100% Pricing Accuracy',
                    },
                    {
                      dimension: 'Customer & Trade Engagement',
                      icon: Megaphone,
                      traditional: 'Generic email blasts or printed promotional flyers with sub-2% open rates and zero channel-specific personalization.',
                      silarAi: 'Proactive AI Marketing across WhatsApp, Email, SMS & Web with AI customer segmentation and predictive restocking reminders.',
                      impact: '4.8x Campaign Open Rates',
                    },
                    {
                      dimension: 'ERP & Inventory Synchronization',
                      icon: Database,
                      traditional: 'Batch overnight updates or manual spreadsheet uploads leading to phantom inventory, stockouts, and order cancellations.',
                      silarAi: 'Bi-directional real-time sync with SAP, Oracle, Microsoft Dynamics 365, Salesforce & ERPNext for live stock, credit & order posting.',
                      impact: 'Zero Phantom Inventory',
                    },
                    {
                      dimension: 'Order Fulfillment & Tracking',
                      icon: Truck,
                      traditional: 'Phone calls to customer service for order status updates, manual shipment tracking, and delayed paper invoice mailings.',
                      silarAi: 'End-to-end digital shipment tracking, automated WhatsApp order status notifications, instant digital invoices & credit limit checks.',
                      impact: '-45% Support Workload',
                    },
                    {
                      dimension: 'Analytics & Demand Visibility',
                      icon: BarChart3,
                      traditional: 'Backward-looking monthly sales reports with major blind spots in regional general trade inventory velocity and rep activity.',
                      silarAi: 'Real-time AI dashboards tracking SKU velocity, trade promotion ROI, territory performance, and predictive demand sensing.',
                      impact: 'Predictive Demand Sensing',
                    },
                    {
                      dimension: 'Order Cycle Time & Cost',
                      icon: Zap,
                      traditional: '24–48 hours order processing cycle time with high sales representative cost per order taken manually.',
                      silarAi: 'Instant (<1 minute) automated order entry with zero manual keying and dramatically reduced order intake operational expenses.',
                      impact: '90% Cycle Time Reduction',
                    },
                  ].map((item, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80 hover:bg-slate-100/60 transition-colors'}
                    >
                      {/* Dimension */}
                      <td className="py-4 px-6 font-extrabold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-plum-100 text-plum-900 shrink-0">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span>{item.dimension}</span>
                        </div>
                      </td>

                      {/* Traditional */}
                      <td className="py-4 px-6 text-slate-600 bg-red-50/30 border-r border-red-100 leading-relaxed align-top">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{item.traditional}</span>
                        </div>
                      </td>

                      {/* SilarAI */}
                      <td className="py-4 px-6 text-slate-800 bg-peach-50/20 leading-relaxed align-top">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-semibold text-slate-900">{item.silarAi}</span>
                          </div>
                          <div className="pl-6">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black bg-plum-950 text-peach-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                              <Zap className="w-3 h-3 text-peach-300" />
                              {item.impact}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Stack View */}
            <div className="block md:hidden p-4 space-y-6">
              {[
                {
                  dimension: 'Product Search & Discovery',
                  icon: Search,
                  traditional: 'Rigid keyword search or static paper catalogs. Struggles with health claims & pack sizes across 1,000s of SKUs.',
                  silarAi: 'Conversational Semantic AI Search understanding natural intent (e.g. "sugar-free drinks 250ml") with instant stock status.',
                  impact: '10x Faster Discovery',
                },
                {
                  dimension: 'Retailer & Distributor Ordering',
                  icon: Store,
                  traditional: 'Manual phone calls or waiting for weekly sales rep visits. High order error rates.',
                  silarAi: '24/7 Self-Service Trade Portals & WhatsApp AI Order Assistant with 1-click repeat reordering.',
                  impact: '+320% Order Velocity',
                },
                {
                  dimension: 'Trade Pricing & Promotions',
                  icon: Tag,
                  traditional: 'Static price sheets and manual trade rebate spreadsheets prone to disputes.',
                  silarAi: 'Automated Trade Rules Engine applying buyer-specific pricing matrices & volume breaks.',
                  impact: '100% Pricing Accuracy',
                },
                {
                  dimension: 'Customer & Trade Engagement',
                  icon: Megaphone,
                  traditional: 'Generic email blasts or printed promotional flyers with sub-2% open rates.',
                  silarAi: 'Proactive AI Marketing across WhatsApp, Email, SMS & Web with predictive restocking alerts.',
                  impact: '4.8x Open Rates',
                },
                {
                  dimension: 'ERP & Inventory Sync',
                  icon: Database,
                  traditional: 'Batch overnight updates causing phantom inventory, stockouts, and order drops.',
                  silarAi: 'Bi-directional real-time sync with SAP, Oracle, Dynamics 365, Salesforce & ERPNext.',
                  impact: 'Zero Phantom Inventory',
                },
                {
                  dimension: 'Order Fulfillment & Tracking',
                  icon: Truck,
                  traditional: 'Phone calls to support for order status updates & delayed paper invoices.',
                  silarAi: 'End-to-end digital tracking, automated WhatsApp order updates, instant digital invoices.',
                  impact: '-45% Support Workload',
                },
                {
                  dimension: 'Analytics & Demand Visibility',
                  icon: BarChart3,
                  traditional: 'Backward-looking monthly reports with blind spots in regional trade velocity.',
                  silarAi: 'Real-time AI dashboards tracking SKU velocity, trade promotion ROI & demand sensing.',
                  impact: 'Predictive Demand Sensing',
                },
                {
                  dimension: 'Order Cycle Time & Cost',
                  icon: Zap,
                  traditional: '24–48 hours order processing cycle time with high manual sales rep costs.',
                  silarAi: 'Instant (<1 minute) automated order entry with zero manual keying overhead.',
                  impact: '90% Cycle Time Reduction',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="p-1.5 rounded-lg bg-plum-100 text-plum-900 shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900">{item.dimension}</h3>
                  </div>

                  {/* Traditional Mobile */}
                  <div className="bg-red-50/60 p-3 rounded-lg border border-red-200/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-red-800">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Traditional FMCG Sales</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{item.traditional}</p>
                  </div>

                  {/* SilarAI Mobile */}
                  <div className="bg-plum-950 text-white p-3 rounded-lg border border-plum-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-peach-300">
                        <Sparkles className="w-3.5 h-3.5 text-peach-300" />
                        <span>SilarAI Powered Commerce</span>
                      </div>
                      <span className="text-[10px] font-black bg-peach-300 text-plum-950 px-2 py-0.5 rounded-full">
                        {item.impact}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{item.silarAi}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Banner Callout */}
            <div className="p-6 bg-gradient-to-r from-plum-950 via-plum-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-base font-black text-white flex items-center justify-center sm:justify-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-peach-300" />
                  <span>Ready to Transform Your FMCG Sales Network?</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Deploy SilarAI Commerce AI across your distributors, retailers, and direct channels in under 30 days with full SAP &amp; Oracle ERP integration.
                </p>
              </div>
              <button
                onClick={() => onBookDemo('FMCG Commerce Platform')}
                className="px-6 py-3 bg-peach-300 text-plum-950 hover:bg-peach-200 text-xs font-black rounded-xl shadow-lg hover:shadow-peach-300/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>Request FMCG AI Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Platform Features */}
      <section id="fmcg-features" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Comprehensive Feature Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Features of SilarAI Commerce AI for FMCG
            </h2>
            <p className="text-base text-slate-600">
              10 core capabilities engineered for fast-moving consumer goods manufacturers, distributors, and brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                title: 'AI Shopping Assistant',
                desc: 'Provide instant shopping assistance for distributors, retailers, and end consumers in natural language.',
                icon: Bot,
              },
              {
                title: 'AI Product Search',
                desc: 'Enable semantic search that understands shopping intent, health claims, and usage instead of exact keywords.',
                icon: Search,
              },
              {
                title: 'B2B Commerce',
                desc: 'Simplify distributor and retailer ordering with customer-specific pricing, bulk matrices, and credit limits.',
                icon: Store,
              },
              {
                title: 'B2B2C Commerce',
                desc: 'Deliver consistent brand experiences across distributors, retailers, and end consumers seamlessly.',
                icon: Layers,
              },
              {
                title: 'AI Marketing Platform',
                desc: 'Automate customer engagement, personalized campaigns, promotions, and loyalty initiatives.',
                icon: Megaphone,
              },
              {
                title: 'Retailer Portal',
                desc: 'Enable retailers to place orders, access trade promotions, track deliveries, and manage accounts independently.',
                icon: CreditCard,
              },
              {
                title: 'Distributor Portal',
                desc: 'Support distributors with trade pricing, inventory visibility, order management, and engagement tools.',
                icon: Truck,
              },
              {
                title: 'Promotion Management',
                desc: 'Manage trade offers, discounts, bundles, rebates, and campaign pricing across all channels.',
                icon: Tag,
              },
              {
                title: 'Customer Analytics',
                desc: 'Understand buying behavior, campaign performance, conversion rates, and regional product demand.',
                icon: BarChart3,
              },
              {
                title: 'Order Management',
                desc: 'Track orders from distributor purchase to final delivery with real-time ERP visibility.',
                icon: FileText,
              },
            ].map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 hover:border-plum-400 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-plum-950 text-peach-300 flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>

          {/* ERP Integration Callout Bar */}
          <div className="bg-plum-950 text-white rounded-3xl p-8 border border-plum-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-peach-300 text-xs font-black uppercase tracking-wider">
                  <Database className="w-4 h-4" />
                  <span>ERP &amp; CRM Integration Hub</span>
                </div>
                <h3 className="text-2xl font-black text-white">Seamless Integration with Enterprise FMCG Backbones</h3>
                <p className="text-sm text-slate-300 max-w-2xl">
                  Connect SilarAI Commerce AI to your existing supply chain without disrupting operations. Real-time bi-directional sync for SKUs, inventory counts, customer price tiers, and orders.
                </p>
              </div>
              <button
                onClick={() => onBookDemo('FMCG ERP Integrations')}
                className="px-6 py-3.5 bg-peach-300 text-plum-950 font-black text-xs rounded-xl hover:bg-peach-200 transition-all shrink-0 cursor-pointer"
              >
                Request ERP Integration Specs
              </button>
            </div>

            <div className="pt-6 border-t border-plum-800/80 flex flex-wrap items-center justify-around gap-4 text-xs font-black text-slate-300">
              <span className="bg-plum-900 px-3.5 py-1.5 rounded-lg border border-plum-700">SAP S/4HANA</span>
              <span className="bg-plum-900 px-3.5 py-1.5 rounded-lg border border-plum-700">Oracle Cloud ERP</span>
              <span className="bg-plum-900 px-3.5 py-1.5 rounded-lg border border-plum-700">Microsoft Dynamics 365</span>
              <span className="bg-plum-900 px-3.5 py-1.5 rounded-lg border border-plum-700">Salesforce Commerce</span>
              <span className="bg-plum-900 px-3.5 py-1.5 rounded-lg border border-plum-700">ERPNext</span>
              <span className="bg-plum-900 px-3.5 py-1.5 rounded-lg border border-plum-700">Odoo</span>
              <span className="bg-plum-900 px-3.5 py-1.5 rounded-lg border border-plum-700">Shopify Plus</span>
              <span className="bg-plum-900 px-3.5 py-1.5 rounded-lg border border-plum-700">WooCommerce</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Industries Within FMCG (14 Sectors) */}
      <section id="fmcg-sectors" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Sectors Supported
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Industries Within FMCG Supported by SilarAI
            </h2>
            <p className="text-base text-slate-600">
              Tailored catalog models, trade rules, and AI configurations for every consumer goods sector.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {FMCG_SECTORS.map((sec, sIdx) => {
              const IconComponent = sec.icon;
              return (
                <div key={sIdx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{sec.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{sec.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Benefits Summary Grid */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Key Business Benefits for FMCG Brands</h3>
              <p className="text-xs text-slate-600">Measurable return on investment across sales, operations, and marketing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                'Increase distributor productivity',
                'Improve retailer engagement',
                'Accelerate digital ordering',
                'Increase average order value',
                'Improve product discovery',
                'Personalize customer experiences',
                'Reduce support workload',
                'Improve campaign effectiveness',
                'Increase digital revenue',
                'Enable omnichannel commerce',
              ].map((ben, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{ben}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Content Cluster Hub & Articles */}
      <section id="fmcg-clusters" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Knowledge Hub &amp; Deep-Dives
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              FMCG AI Commerce Content Cluster
            </h2>
            <p className="text-base text-slate-600">
              Explore 10 supporting articles detailing digital transformation, B2B ordering, and AI marketing for consumer packaged goods.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Article Selector List */}
            <div className="lg:col-span-4 space-y-2.5 max-h-[600px] overflow-y-auto pr-2">
              {FMCG_CLUSTER_ARTICLES.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedClusterId(article.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all border cursor-pointer ${
                    selectedClusterId === article.id
                      ? 'bg-plum-950 text-white border-plum-950 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={selectedClusterId === article.id ? 'text-peach-300 font-bold' : 'text-plum-800 font-bold'}>
                      FMCG Guide
                    </span>
                    <span className={selectedClusterId === article.id ? 'text-slate-400' : 'text-slate-500'}>
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-xs font-black leading-snug">{article.title}</h3>
                  <p className={`text-[11px] line-clamp-2 mt-1 ${selectedClusterId === article.id ? 'text-slate-300' : 'text-slate-600'}`}>
                    {article.excerpt}
                  </p>
                </button>
              ))}
            </div>

            {/* Right Column: Article Reader Pane */}
            <div className="lg:col-span-8 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wider bg-peach-200 px-2.5 py-1 rounded-md">
                    Featured Article
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{currentArticle.title}</h2>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                  {currentArticle.readTime}
                </span>
              </div>

              <p className="text-sm text-slate-600 font-medium italic border-l-4 border-plum-700 pl-4 py-1 bg-white/60 rounded-r-lg">
                "{currentArticle.excerpt}"
              </p>

              <div className="prose prose-slate prose-sm max-w-none text-slate-800 space-y-4 whitespace-pre-line leading-relaxed font-normal">
                {currentArticle.content}
              </div>

              {/* Discussion Action */}

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => onBookDemo(`FMCG Article - ${currentArticle.title}`)}
                  className="px-5 py-2.5 bg-plum-950 hover:bg-plum-900 text-peach-300 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Discuss Strategy for {currentArticle.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 6: Frequently Asked Questions */}
      <section id="fmcg-faqs" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Frequently Asked Questions (FMCG AI Commerce)
            </h2>
            <p className="text-base text-slate-600">
              Direct, authoritative answers structured for Google Search, ChatGPT, Perplexity, and Gemini response engines.
            </p>
          </div>

          <div className="space-y-4">
            {FMCG_FAQS.map((faq, fIdx) => {
              const isOpen = activeFaqIndex === fIdx;
              return (
                <div
                  key={fIdx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setActiveFaqIndex(isOpen ? null : fIdx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-black text-slate-900 text-base cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-plum-800 font-extrabold text-sm">Q{fIdx + 1}.</span>
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-plum-900 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 text-sm text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call To Action Banner */}
      <section className="py-20 bg-gradient-to-br from-plum-950 via-plum-900 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <span className="px-4 py-1.5 rounded-full bg-peach-300 text-plum-950 text-xs font-black uppercase tracking-widest inline-block shadow-md">
            Ready to Transform Your FMCG Commerce?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            See SilarAI FMCG Commerce AI in Action
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Schedule a personalized enterprise demo to learn how SilarAI can digitize your distributor ordering, empower retailers, and increase FMCG sales across every channel.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onBookDemo('FMCG Enterprise Final Banner')}
              className="px-8 py-4 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-xl hover:shadow-peach-300/20 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Schedule FMCG Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onBackToHome}
              className="px-8 py-4 bg-plum-800/80 hover:bg-plum-800 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all cursor-pointer"
            >
              Explore SilarAI Platform Overview
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
