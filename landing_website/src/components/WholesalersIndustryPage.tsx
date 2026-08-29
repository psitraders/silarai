import React, { useState } from 'react';
import {
  Boxes,
  Sparkles,
  Bot,
  Search,
  TrendingUp,
  Layers,
  Zap,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BookOpen,
  Wrench,
  FlaskConical,
  Pill,
  Zap as ZapIcon,
  Cpu,
  Car,
  HardHat,
  Box,
  UtensilsCrossed,
  Stethoscope,
  ShieldCheck,
  Building2,
  FileText,
  DollarSign,
  Package,
  Warehouse,
  Clock,
  Database,
  Users,
  MessageSquare,
  RefreshCw,
  Target,
  ShoppingCart,
  Percent,
  Sprout,
  BarChart3,
  Truck
} from 'lucide-react';

interface WholesalersIndustryPageProps {
  onBackToHome: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
}

// 10 Supporting Content Cluster Articles for Wholesalers AI Commerce
const WHOLESALERS_CLUSTER_ARTICLES = [
  {
    id: 'ai-shopping-assistants-wholesale',
    title: 'AI Shopping Assistants for Wholesale Businesses',
    readTime: '7 min read',
    excerpt: 'How autonomous virtual sales reps streamline product search, technical inquiries, contract pricing lookups, and order entry for B2B buyers.',
    content: `
### Transforming B2B Wholesale Ordering
Wholesale buyers need fast answers without waiting for business hours or sales rep callbacks. SilarAI Shopping Assistants serve as 24/7 autonomous virtual sales agents that answer complex catalog queries, check contract-specific prices, and process bulk orders instantly.

### Key Capabilities for Wholesalers
- **Natural Language Product Search**: Finds exact products from technical descriptions, size specifications, or general business requirements.
- **Customer-Specific Contract Pricing**: Instantly displays tier discounts, volume breaks, and customer account limits.
- **Multi-SKU Order Entry**: Accepts pasted BOM lists, PO numbers, and repeat order requests directly in chat.

### Operational Benefits
Wholesalers using SilarAI experience up to **70% reduction in routine customer support tickets** and **2.5x faster reorder placement** for repeat commercial accounts.
    `,
    keywords: ['AI Commerce Platform for Wholesalers', 'AI Shopping Assistant for Wholesale', 'B2B Commerce Platform'],
  },
  {
    id: 'rfq-automation-software-wholesalers',
    title: 'Automating the B2B RFQ & Quotation Workflow',
    readTime: '6 min read',
    excerpt: 'Accelerating request-for-quote (RFQ) processing times from days to seconds with automated parsing, pricing rules, and instant quote generation.',
    content: `
### Eliminating Quotation Delays
Manual quotation preparation is one of the biggest bottlenecks in wholesale operations. SilarAI collects customer requirements, evaluates pricing rules, and generates structured PDF quotations automatically.

### Automated RFQ Workflow Steps
- **Smart Document Parsing**: Extracts part numbers and line quantities from uploaded buyer RFQ spreadsheets or PDF lists.
- **Margin Protection Rules**: Ensures custom discount requests meet target gross margin thresholds before sales rep sign-off.
- **Instant Buyer Conversion**: Enables buyers to review, accept, and turn formal quotes into active purchase orders with 1-click.
    `,
    keywords: ['RFQ Automation', 'RFQ Automation Software for Wholesalers', 'Wholesale Commerce Platform'],
  },
  {
    id: 'customer-specific-pricing-wholesalers',
    title: 'Customer-Specific Pricing & Account Contract Management',
    readTime: '6 min read',
    excerpt: 'Managing negotiated prices, multi-tiered volume discounts, promotional rebates, and credit limits seamlessly in real time.',
    content: `
### Managing Complex Wholesale Pricing Matrices
In wholesale B2B, static prices do not exist. Each buyer group or dealer account operates under negotiated contract rates and custom discount tiers.

### SilarAI Pricing Engine Features
- **Sub-30ms Contract Resolution**: Connects to your ERP/PIM to surface authenticated pricing immediately upon user login.
- **Volume Break Prompts**: Automatically notifies buyers when adding extra units qualifies them for a lower tier price.
- **Credit Limit & Terms Checking**: Validates customer payment terms (e.g., Net 30, Net 60) and current credit availability before order submission.
    `,
    keywords: ['Customer-Specific Pricing', 'Customer-Specific Pricing Software for Wholesale', 'B2B Ordering Software'],
  },
  {
    id: 'erp-integrated-wholesale-commerce-platform',
    title: 'ERP Integration: Connecting SAP, Oracle & Microsoft Dynamics',
    readTime: '8 min read',
    excerpt: 'Unifying backend ERP inventory, order ledgers, and customer accounts with high-performance modern web storefronts.',
    content: `
### Modernizing Legacy Wholesale Systems
Wholesalers rely heavily on ERP systems like SAP, Oracle NetSuite, Microsoft Dynamics 365, Odoo, and ERPNext for inventory and financial ledgers, but those systems lack intuitive customer purchasing interfaces.

### Integration Highlights
- **Bi-Directional Order Sync**: Pushes approved web orders directly into your ERP for immediate warehouse fulfillment.
- **Real-Time Stock Checks**: Queries warehouse stock levels live during customer browsing and cart creation.
- **Customer Account Ledger**: Enables buyers to view outstanding invoices, payment status, and order history directly on the web portal.
    `,
    keywords: ['Wholesale ERP Integration', 'ERP-Integrated Wholesale Commerce Platform', 'SAP Oracle Dynamics Integration'],
  },
  {
    id: 'wholesale-customer-dealer-portal-software',
    title: 'Dealer & Wholesale Customer Self-Service Portals',
    readTime: '7 min read',
    excerpt: 'Empowering wholesale buyers with 24/7 self-service ordering, invoice downloads, shipment tracking, and reorder matrices.',
    content: `
### Streamlining Account Management
Wholesale customers want self-service tools that save time and eliminate phone calls for basic administrative tasks.

### Portal Functional Modules
- **Quick Order Grid**: High-speed line item entry by SKU code, catalog code, or CSV batch upload.
- **Document Hub**: Download tax invoices, certificates of analysis, warranty docs, and product spec sheets on demand.
- **Multi-User Account Access**: Set custom permissions for purchasing managers, field technicians, and accounting staff within a buyer company.
    `,
    keywords: ['Wholesale Customer Portal', 'Dealer Ordering Software', 'Wholesale Customer Portal with AI'],
  },
  {
    id: 'ai-product-search-for-wholesale-catalogs',
    title: 'AI Semantic Product Search for Large Wholesale Catalogs',
    readTime: '6 min read',
    excerpt: 'Replacing outdated keyword searches with vector AI that understands industry terminology, technical specs, and business intent.',
    content: `
### Solving Heavy Catalog Navigation Challenges
When managing 50,000+ SKUs, traditional keyword search often returns zero results or irrelevantly long lists.

### AI Search Innovations
- **Application-Based Discovery**: Allows buyers to search by problem statement (e.g., "chemical-resistant high-pressure hoses for food processing").
- **Synonym & Industry Jargon Recognition**: Maps contractor slang, regional terms, and abbreviations to the correct catalog items.
- **Cross-Brand Alternatives**: Suggests in-stock alternative brands when a requested item is out of stock.
    `,
    keywords: ['AI Product Search', 'AI Product Search for Wholesale Catalogs', 'Intelligent Product Discovery'],
  },
  {
    id: 'reducing-wholesale-customer-support-costs',
    title: 'Reducing Wholesale Customer Support Costs with AI',
    readTime: '6 min read',
    excerpt: 'Automating repetitive support inquiries about order status, delivery schedules, and product availability.',
    content: `
### Freeing Up Wholesale Sales Teams
Sales representatives in wholesale spend hours every day answering routine questions that can be handled instantly by AI.

### Operational Impact
- **Automated Order Tracking**: Provides real-time tracking links, estimated delivery dates, and carrier details automatically.
- **Instant Stock Verification**: Confirms item availability across regional distribution centers instantly.
- **Smart Support Escalation**: Routes complex custom requests or dispute tickets to dedicated account reps with full conversation history.
    `,
    keywords: ['AI Sales Assistant', 'Wholesale Customer Support', 'Reduce Support Workload'],
  },
  {
    id: 'b2b-product-recommendations-and-upselling-wholesale',
    title: 'AI Product Recommendations & Cross-Selling for Wholesalers',
    readTime: '7 min read',
    excerpt: 'Increasing average order value (AOV) by intelligently recommending complementary supplies, spare parts, and bulk bundles.',
    content: `
### Maximizing B2B Basket Sizes
Unlike B2C cross-selling, wholesale recommendations must be technically accurate and logically aligned with commercial projects.

### Recommendation Strategies
- **Complementary Install Kits**: Automatically prompts buyers to add necessary fittings, sealants, or cables for the main equipment selected.
- **frequently Purchased Together**: Uses historical order data across similar accounts to suggest missing project supplies.
- **Bulk Tier Upselling**: Highlights savings when rounding up order quantities to full pallets or master cases.
    `,
    keywords: ['AI Product Recommendations', 'Wholesale Upsell AI', 'Increase Average Order Value'],
  },
  {
    id: 'wholesale-analytics-and-predictive-reordering',
    title: 'Predictive Reordering & Wholesale Customer Analytics',
    readTime: '7 min read',
    excerpt: 'Utilizing AI analytics to anticipate stock replenishment needs, prevent churn, and personalize wholesale outreach.',
    content: `
### Proactive Wholesale Commerce
SilarAI analyzes buyer purchase cadence to predict when accounts are running low on critical consumable inventory.

### Analytics Capabilities
- **Automated Reorder Reminders**: Notifies buyers when historical usage patterns indicate consumable supplies are low.
- **Account Churn Risk Alerts**: Flags accounts whose ordering frequency drops below normal baselines for sales rep follow-up.
- **Demand Forecasting Insights**: Provides inventory managers with real-time visibility into popular search queries and backordered items.
    `,
    keywords: ['Wholesale Analytics', 'Predictive Reordering', 'Wholesale AI Platform'],
  },
  {
    id: 'scaling-wholesale-digital-revenue-playbook',
    title: 'Scaling Wholesale Digital Revenue: The Enterprise Playbook',
    readTime: '8 min read',
    excerpt: 'A step-by-step roadmap for wholesale leaders to transition from traditional manual selling to high-margin digital commerce.',
    content: `
### Future-Proofing Wholesale Businesses
Wholesalers that embrace AI commerce gain a decisive competitive advantage over slow, phone-and-fax-based competitors.

### SilarAI Digital Transformation Playbook
- **24/7 Ordering Capabilities**: Captures orders outside normal business hours without increasing headcount.
- **Seamless Multichannel Sync**: Unifies website ordering, mobile sales rep tablets, and EDI feeds under one central AI engine.
- **Rapid Time-to-Value**: Deploys on top of existing ERP and commerce infrastructure in weeks rather than years.
    `,
    keywords: ['Best AI Commerce Platform for Wholesalers', 'Scale Wholesale Revenue', 'Enterprise Wholesale AI'],
  },
];

export const WholesalersIndustryPage: React.FC<WholesalersIndustryPageProps> = ({
  onBackToHome,
  onBookDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'features' | 'sectors' | 'clusters' | 'faqs'>('overview');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('ai-shopping-assistants-wholesale');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [searchDemoQuery, setSearchDemoQuery] = useState<string>('Heavy-duty stainless steel fasteners 3/8 inch');
  const [demoQueryResult, setDemoQueryResult] = useState<string | null>('Found 12 Grade 316 stainless steel fastener SKUs. Applied Contract Tier 2 Pricing ($18.40/box) with 450 boxes available across Central & West Warehouses.');

  const handleSearchDemo = (q: string) => {
    setSearchDemoQuery(q);
    if (q.toLowerCase().includes('chemical') || q.toLowerCase().includes('solvent')) {
      setDemoQueryResult('Found Chemical-Resistant Hoses & Drums. Tier 3 Wholesale Price applied ($142.00/drum). SDS compliance sheet ready for download.');
    } else if (q.toLowerCase().includes('electrical') || q.toLowerCase().includes('conduit')) {
      setDemoQueryResult('Retrieved 3/4" Rigid Metallic Conduit (100 ft bundles). Contract price $84.50/bundle with same-day pallet pickup at Regional Hub.');
    } else if (q.toLowerCase().includes('auto') || q.toLowerCase().includes('filter')) {
      setDemoQueryResult('Cross-referenced Fram OEM #PH8A to Baldwin Heavy Duty Filter equivalent in stock (1,200 units available).');
    } else {
      setDemoQueryResult(`Semantic AI search results for "${q}": 8 contract-eligible SKUs retrieved with real-time ERP inventory & credit line verification.`);
    }
  };

  const currentArticle = WHOLESALERS_CLUSTER_ARTICLES.find((a) => a.id === selectedClusterId) || WHOLESALERS_CLUSTER_ARTICLES[0];

  const WHOLESALE_SECTORS = [
    { name: 'Industrial Supplies', icon: Wrench, desc: 'Heavy machinery parts, hydraulic components, bearings, power tools, and MRO supplies.' },
    { name: 'Electrical Products', icon: ZapIcon, desc: 'Conduit, transformers, switchgear, wiring, lighting fixtures, and circuit breakers.' },
    { name: 'Automotive Parts', icon: Car, desc: 'Aftermarket spares, fleet maintenance components, lubricants, OEM cross-references, and tires.' },
    { name: 'Chemicals', icon: FlaskConical, desc: 'Specialty solvents, industrial compounds, raw materials, SDS documentation, and bulk containers.' },
    { name: 'Healthcare Supplies', icon: Stethoscope, desc: 'Medical consumables, PPE, surgical equipment, diagnostic supplies, and GPO contract pricing.' },
    { name: 'Building Materials', icon: HardHat, desc: 'Lumber, drywall, roofing, fasteners, insulation, jobsite delivery, and contractor accounts.' },
    { name: 'Packaging', icon: Box, desc: 'Corrugated boxes, strapping, stretch film, custom packaging supplies, and recurring reorders.' },
    { name: 'Consumer Goods', icon: ShoppingCart, desc: 'High-volume consumer electronics, appliances, home goods, and multi-channel merchant supply.' },
    { name: 'Food Distribution', icon: UtensilsCrossed, desc: 'Institutional food, cold storage perishables, beverage supplies, restaurant equipment, and bulk logistics.' },
    { name: 'Office Supplies', icon: Building2, desc: 'Paper goods, janitorial supplies, corporate furniture, ink toner, and recurring account replenishment.' },
    { name: 'Safety Equipment', icon: ShieldCheck, desc: 'Personal protective equipment (PPE), fall arrest gear, hazard monitoring, and OSHA compliance.' },
    { name: 'Agricultural Products', icon: Sprout, desc: 'Bulk fertilizer, seed stock, irrigation components, animal feed, and farm equipment spares.' },
  ];

  const WHOLESALE_FAQS = [
    {
      q: 'What is AI Commerce for wholesalers?',
      a: 'AI Commerce helps wholesalers improve B2B buying experiences using artificial intelligence. It enables intelligent product discovery, AI Shopping Assistants, self-service ordering, quotation automation, customer-specific pricing, and ERP-integrated commerce.',
    },
    {
      q: 'How does an AI Shopping Assistant help wholesalers?',
      a: 'An AI Shopping Assistant enables customers to search products, compare alternatives, check pricing, request quotations, and place orders through natural language conversations. This reduces support workload while improving customer experience.',
    },
    {
      q: 'Can SilarAI support customer-specific pricing?',
      a: 'Yes. SilarAI Commerce AI supports negotiated pricing, contract pricing, volume discounts, customer-specific catalogs, credit limits, and account-based purchasing integrated directly with your backend ERP systems.',
    },
    {
      q: 'Can SilarAI integrate with ERP systems?',
      a: 'Yes. SilarAI integrates seamlessly with SAP, Oracle, Microsoft Dynamics 365, ERPNext, Odoo, Salesforce, warehouse management platforms, and inventory systems to provide real-time business information.',
    },
    {
      q: 'Is SilarAI suitable for wholesale distributors?',
      a: 'Yes. SilarAI is designed specifically for wholesalers, distributors, and B2B suppliers managing large product catalogs, dealer networks, complex pricing matrices, and high-volume ordering processes.',
    },
    {
      q: 'Which wholesale industries benefit from SilarAI?',
      a: 'SilarAI supports industrial supply wholesalers, automotive distributors, electrical wholesalers, chemical suppliers, healthcare distributors, packaging suppliers, building material wholesalers, food distributors, agricultural suppliers, and office supply businesses.',
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
                '@id': 'https://silarai.com/?page=wholesalers#webpage',
                url: 'https://silarai.com/?page=wholesalers',
                name: 'AI Commerce Platform for Wholesalers | B2B AI Shopping Assistant | SilarAI',
                description:
                  'Modernize wholesale commerce with AI Shopping Assistants, B2B ordering, dealer portals, RFQ automation, ERP integration, and AI-powered product discovery.',
              },
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI Wholesale Commerce AI Platform',
                operatingSystem: 'Cloud Native / Web / Headless API',
                applicationCategory: 'BusinessApplication, ECommerceApplication',
                description:
                  'Enterprise AI Commerce Platform for Wholesalers featuring AI Shopping Assistants, B2B Customer Portals, Customer-Specific Pricing, RFQ Automation, and Real-Time ERP Integration.',
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.98',
                  ratingCount: '210',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Commerce Platform for Wholesalers',
                provider: {
                  '@type': 'Organization',
                  name: 'SilarAI Technologies',
                  url: 'https://silarai.com',
                },
                areaServed: 'Worldwide',
                serviceType: 'Wholesale B2B AI Commerce Solutions',
              },
              {
                '@type': 'FAQPage',
                mainEntity: WHOLESALE_FAQS.map((faq) => ({
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
                  { '@type': 'ListItem', position: 3, name: 'AI Commerce Platform for Wholesalers', item: 'https://silarai.com/?page=wholesalers' },
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
              <Boxes className="w-3.5 h-3.5" />
              AI Commerce Platform for Wholesalers
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-plum-800 text-peach-200 px-2.5 py-0.5 rounded-full font-bold border border-plum-700">
              Wholesale B2B Specification v2.4
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 bg-gradient-to-b from-plum-950 via-plum-900 to-slate-900 text-white overflow-hidden">
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-peach-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-800/80 border border-peach-300/40 text-peach-300 text-xs font-black uppercase tracking-wider">
                <Boxes className="w-4 h-4 text-peach-300" />
                <span>Wholesale Commerce AI Engine</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                AI Commerce Platform for Wholesalers
              </h1>

              <h2 className="text-xl sm:text-2xl font-extrabold text-peach-300">
                Modernize Wholesale Commerce with AI
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Wholesale businesses manage thousands of products, multiple pricing agreements, dealer relationships, and complex ordering processes. Customers expect faster quotations, personalized pricing, self-service ordering, and real-time inventory visibility.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                SilarAI Commerce AI helps wholesalers transform traditional B2B sales into intelligent digital commerce by combining AI Shopping Assistants, B2B commerce, customer portals, RFQ automation, AI-powered product discovery, and ERP integration. Whether you supply industrial products, building materials, FMCG, electrical goods, chemicals, automotive parts, healthcare supplies, or consumer products, SilarAI enables faster buying experiences while reducing manual operations.
              </p>

              {/* Call to Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onBookDemo('Wholesalers AI Commerce')}
                  className="px-6 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-lg hover:shadow-peach-300/20 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Schedule a Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('wholesale-cluster-hub');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-plum-800/90 hover:bg-plum-800 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-peach-300" />
                  <span>Transform Wholesale Commerce</span>
                </button>
              </div>

              {/* Verified Metrics Badge Bar */}
              <div className="pt-6 border-t border-plum-800/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">-70%</div>
                  <div className="text-xs text-slate-400 font-medium">Routine Support Costs</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">2.5x</div>
                  <div className="text-xs text-slate-400 font-medium">Faster Reorders</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">&lt;1 min</div>
                  <div className="text-xs text-slate-400 font-medium">RFQ Turnaround Time</div>
                </div>
              </div>

            </div>

            {/* Interactive Intent Search & Wholesale Assistant Demo Widget */}
            <div className="lg:col-span-5 bg-white/95 text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Live Wholesale Assistant Simulator</h3>
                    <p className="text-[10px] text-slate-500">Test Product Discovery &amp; RFQ Automation</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live ERP Engine
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Type or click a wholesale B2B query:</label>
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
                    className="absolute right-1.5 top-1.5 px-3 py-1 bg-plum-700 text-white rounded-lg text-xs font-bold hover:bg-plum-800 transition-colors"
                  >
                    Search
                  </button>
                </div>

                {/* Preset Intent Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Heavy-duty stainless steel fasteners 3/8 inch',
                    'Chemical-resistant hoses & drums',
                    '3/4 Rigid Metallic Conduit 100ft',
                    'Fram OEM PH8A Baldwin equivalent filter',
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSearchDemo(preset)}
                      className="text-[11px] bg-slate-100 hover:bg-peach-100 text-slate-700 hover:text-plum-950 px-2.5 py-1 rounded-lg border border-slate-200 transition-all text-left"
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
                    <span>ERP Wholesale Pricing Engine (<span className="text-emerald-600 font-bold">25ms latency</span>)</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    {demoQueryResult}
                  </p>
                  <div className="pt-2 border-t border-plum-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>ERP System: <strong className="text-slate-800 font-bold">SAP / NetSuite / Dynamics 365</strong></span>
                    <span className="text-plum-700 font-bold">Generate RFQ Quote</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Supports SAP, NetSuite, Dynamics 365, Odoo &amp; PIM</span>
                <a href="#wholesale-features" className="text-plum-700 font-bold hover:underline">View Features ↓</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Navigation Sticky Bar for Wholesalers Page Sections */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-3">
          {[
            { id: 'overview', label: 'Why Wholesalers AI' },
            { id: 'challenges', label: 'Challenges & Solutions' },
            { id: 'features', label: 'Platform Features' },
            { id: 'erps', label: 'ERP & System Integrations' },
            { id: 'sectors', label: 'Wholesale Sectors (12)' },
            { id: 'clusters', label: 'Content Hub & Articles (10)' },
            { id: 'faqs', label: 'Wholesale FAQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                const el = document.getElementById(`wholesale-${tab.id}`);
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

      {/* Section 1: Why Wholesalers Need AI Commerce */}
      <section id="wholesale-overview" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              The Digital Wholesale Evolution
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Why Wholesalers Need AI Commerce
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Wholesale buyers expect the same convenience they experience in consumer ecommerce while still requiring business-specific capabilities such as negotiated pricing, bulk ordering, credit terms, quotation requests, and account-based purchasing. Traditional wholesale portals often rely on outdated interfaces, manual processes, and disconnected ERP systems. SilarAI Commerce AI delivers intelligent B2B commerce experiences that simplify ordering while increasing sales efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">AI-Powered Buying Experience</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Replaces static forms and complex search filters with 24/7 AI assistants that understand technical terms, bulk pricing, and custom accounts.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">RFQ & Quote Automation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automates quote requests by gathering buyer requirements, checking inventory rules, and preparing formal quotes for sales approval.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Seamless ERP Integration</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connects live with SAP, Oracle, Dynamics 365, Odoo, and NetSuite to display account pricing, stock levels, and order history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Challenges Faced by Wholesalers & How SilarAI Solves Them */}
      <section id="wholesale-challenges" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Overcoming Wholesale Bottlenecks
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Challenges Faced by Wholesalers &amp; SilarAI Solutions
            </h2>
            <p className="text-base text-slate-600">
              Transforming manual wholesale workflows into automated digital growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Challenge 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #1
                </span>
                <span className="text-xs font-bold text-slate-400">Catalogs</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Large Product Catalogs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Wholesale businesses manage tens of thousands of SKUs across multiple brands, categories, and variations. Customers struggle to locate correct products quickly.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  AI Product Discovery enabling semantic search by technical application requirements instead of exact SKU codes.
                </p>
              </div>
            </div>

            {/* Challenge 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #2
                </span>
                <span className="text-xs font-bold text-slate-400">Quotations</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Manual RFQ Process</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sales representatives spend significant time preparing quotations for repeat customers and complex orders, slowing response times.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  RFQ Automation that gathers requirements, checks pricing rules, and generates structured PDF quotes automatically.
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
              <h3 className="text-base font-black text-slate-900">Customer-Specific Pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Different customers receive different prices, discounts, payment terms, and contract agreements. Managing these manually creates errors.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Real-time ERP contract pricing engine applying volume breaks and customer discount tiers sub-30ms upon login.
                </p>
              </div>
            </div>

            {/* Challenge 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #4
                </span>
                <span className="text-xs font-bold text-slate-400">Self-Service</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Dealer &amp; Customer Self-Service</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers expect to place orders, check invoices, download documents, and track shipments without contacting sales representatives.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Dealer &amp; Customer Portal providing 24/7 self-service order placement, quick matrix reordering, and document access.
                </p>
              </div>
            </div>

            {/* Challenge 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #5
                </span>
                <span className="text-xs font-bold text-slate-400">ERP Sync</span>
              </div>
              <h3 className="text-base font-black text-slate-900">ERP Dependency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Most wholesale businesses depend on ERP systems for inventory and orders but lack modern, intuitive digital buying interfaces.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Headless API layer connecting SAP, NetSuite, Dynamics 365, and Odoo to high-speed digital purchasing portals.
                </p>
              </div>
            </div>

            {/* Challenge 6 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #6
                </span>
                <span className="text-xs font-bold text-slate-400">Support Load</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Customer Support Overload</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sales teams repeatedly answer routine questions about stock, pricing, alternative SKUs, delivery dates, and bulk discounts.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  AI Shopping Assistants resolving routine support queries 24/7 with zero human rep intervention required.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Platform Features & Wholesale Capabilities */}
      <section id="wholesale-features" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Enterprise Wholesale Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              SilarAI Wholesale Platform Features
            </h2>
            <p className="text-base text-slate-600">
              Comprehensive capabilities designed specifically for high-volume B2B wholesale suppliers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Shopping Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deliver conversational buying experiences for wholesale customers, dealers, and commercial accounts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Product Search</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Replace traditional keyword search with AI-powered semantic product discovery based on technical specifications.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">B2B Commerce</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Support negotiated pricing, account-based ordering, credit limits, volume discounts, and bulk purchasing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Customer Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide customers with a centralized digital portal for quick ordering, invoice access, and account management.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">RFQ Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accelerate quotation workflows, collect buyer requirements, and improve sales responsiveness dramatically.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Sales Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Support internal sales teams with instant product specification search, inventory checks, and account insights.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Order Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allow customers to monitor real-time order status, carrier shipment progress, and estimated delivery dates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Pricing Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Support customer-specific contract pricing, volume discounts, promotional pricing, and tier matrices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Analytics &amp; Insights</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track customer purchasing behavior, product search demand, conversion rates, and sales rep performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: ERP & Ecosystem Integrations */}
      <section id="wholesale-erps" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-peach-300 bg-plum-800 px-3.5 py-1.5 rounded-full border border-plum-700">
              Enterprise Ecosystem Connectivity
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              ERP, PIM &amp; Warehouse System Integrations
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Connect SilarAI Commerce AI to your existing enterprise technology stack seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {['SAP S/4HANA', 'Oracle NetSuite', 'MS Dynamics 365', 'Odoo ERP', 'ERPNext', 'Salesforce B2B'].map((erp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-plum-950/80 border border-plum-800 text-white space-y-2">
                <Database className="w-6 h-6 text-peach-300 mx-auto" />
                <div className="text-xs font-black">{erp}</div>
                <div className="text-[10px] text-emerald-400 font-bold">Native API Sync</div>
              </div>
            ))}
          </div>

          <div className="bg-plum-950/90 border border-plum-800 p-6 rounded-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-black text-peach-300">Need Custom Legacy ERP Integration?</h3>
              <p className="text-xs text-slate-300">
                SilarAI provides headless GraphQL and REST connectors for custom legacy mainframes and proprietary warehouse management systems.
              </p>
            </div>
            <button
              onClick={() => onBookDemo('Custom Wholesale ERP Setup')}
              className="px-5 py-2.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl shrink-0 cursor-pointer transition-all"
            >
              Consult Integration Team
            </button>
          </div>
        </div>
      </section>

      {/* Section 5: Wholesale Sectors Served (12 Industries) */}
      <section id="wholesale-sectors" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Sectors Served
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Wholesale Industries Powered by SilarAI
            </h2>
            <p className="text-base text-slate-600">
              Dedicated AI models and catalog workflows configured for 12 major wholesale sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHOLESALE_SECTORS.map((sec, idx) => {
              const IconComp = sec.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-plum-300 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">{sec.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{sec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: Comprehensive Benefits */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Key Business Benefits for Wholesalers
            </h2>
            <p className="text-base text-slate-600">
              Measurable commercial results achieved by wholesale businesses using SilarAI Commerce AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: 'Increase Digital Sales', desc: 'Capture 24/7 self-service B2B orders without relying solely on office hours sales staff.' },
              { title: 'Accelerate RFQ Turnaround', desc: 'Reduce quotation response times from days to under 1 minute with automated margin checks.' },
              { title: 'Reduce Support Workload', desc: 'Automate repetitive stock check and delivery inquiries, saving 70% of support hours.' },
              { title: 'Improve Product Discovery', desc: 'Help commercial buyers find technical items easily using natural language application queries.' },
              { title: 'Boost Average Order Value', desc: 'Increase order sizes through intelligent recommendations for complementary items and bulk tiers.' },
            ].map((ben, bIdx) => (
              <div key={bIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">{ben.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ben.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Content Cluster Knowledge Hub (10 In-Depth Guides) */}
      <section id="wholesale-clusters" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Wholesale AI Knowledge Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Supporting Content Cluster Articles
            </h2>
            <p className="text-base text-slate-600">
              In-depth technical guides and strategic insights for modern wholesale leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Article Selector List */}
            <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {WHOLESALERS_CLUSTER_ARTICLES.map((art, idx) => {
                const isSelected = art.id === selectedClusterId;
                return (
                  <button
                    key={art.id}
                    onClick={() => setSelectedClusterId(art.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-plum-950 text-white border-plum-900 shadow-md'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1 opacity-80">
                      <span>Article #{idx + 1}</span>
                      <span>{art.readTime}</span>
                    </div>
                    <h3 className="text-sm font-black leading-snug">{art.title}</h3>
                    <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {art.excerpt}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Active Article View */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-black text-plum-900 uppercase bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
                  {currentArticle.readTime}
                </span>
                <span className="text-xs font-bold text-slate-400">Wholesale AI Knowledge Base</span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {currentArticle.title}
              </h3>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line">
                {currentArticle.content}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 8: Frequently Asked Questions */}
      <section id="wholesale-faqs" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600">
              Clear answers for AI search engines and wholesale enterprise buyers.
            </p>
          </div>

          <div className="space-y-4">
            {WHOLESALE_FAQS.map((faq, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white"
                >
                  <button
                    onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 font-black text-slate-900 text-base flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-plum-700 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 9: Final CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-plum-950 via-plum-900 to-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-peach-300 text-plum-950 flex items-center justify-center font-black mx-auto shadow-xl">
            <Boxes className="w-8 h-8" />
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Modernize Your Wholesale Business?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Empower your wholesale buyers with 24/7 AI Shopping Assistants, automated RFQ quotes, customer-specific pricing, and real-time ERP inventory visibility.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onBookDemo('Wholesalers AI Commerce Bottom CTA')}
              className="px-8 py-4 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-base rounded-xl shadow-xl hover:shadow-peach-300/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Schedule a Demo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onBackToHome}
              className="px-8 py-4 bg-plum-800 hover:bg-plum-700 text-white font-extrabold text-base rounded-xl border border-plum-600 transition-all cursor-pointer"
            >
              Explore All Platforms
            </button>
          </div>

          <p className="text-xs text-slate-400">
            No long-term contracts • Direct SAP, NetSuite &amp; Dynamics 365 connectors • Deploys in weeks
          </p>
        </div>
      </section>
    </div>
  );
};
