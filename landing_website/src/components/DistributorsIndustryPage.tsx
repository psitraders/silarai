import React, { useState } from 'react';
import {
  Truck,
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
  Check
} from 'lucide-react';

import { COMPLETE_AUTHORITATIVE_BACKLINKS } from '../data/authoritativeBacklinks';
import { DistributorsBacklinkHub } from './DistributorsBacklinkHub';

interface DistributorsIndustryPageProps {
  onBackToHome: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
  onNavigateToPage?: (url: string) => void;
  onSelectAiShoppingPage?: (pageId: 1 | 2 | 3) => void;
  onSelectAiCommercePage?: (pageId: 1 | 2 | 3) => void;
  onSelectManufacturingPage?: (pageId: 1 | 2 | 3) => void;
  onSelectD2cPage?: () => void;
}

// 10 Supporting Content Cluster Articles for Distributors AI Commerce
const DISTRIBUTORS_CLUSTER_ARTICLES = [
  {
    id: 'b2b-ai-shopping-assistants-distributors',
    title: 'AI Shopping Assistants for B2B Distributors',
    readTime: '7 min read',
    excerpt: 'How 24/7 autonomous virtual sales reps assist commercial buyers with SKU matching, bulk discount tiers, and instant order placement.',
    content: `
### Transforming Complex B2B Buying Inquiries
Distributors deal with complex part numbers, technical specifications, and custom client contracts. SilarAI Shopping Assistants function as 24/7 digital technical sales representatives that guide contractors, purchasing agents, and dealers to the precise SKUs they need.

### Key Capabilities for Wholesale Distributors
- **Customer-Specific Price Lookups**: Instantly applies tier discounts, volume breaks, and negotiated contract pricing upon user authentication.
- **Cross-Reference & Part Substitution**: Suggests in-stock alternative parts when primary OEM numbers are backordered.
- **Instant PunchOut & Order Submission**: Seamlessly adds items to procurement carts with automated ERP validation.

### Quantifiable Distribution Benefits
Distributors using SilarAI report a **65% reduction in sales support call volume** and an **80% faster reorder cycle** for commercial buyers.
    `,
    keywords: ['AI Commerce Platform for Distributors', 'AI Shopping Assistant for Distributors', 'B2B Commerce Platform'],
  },
  {
    id: 'customer-specific-contract-pricing-ai',
    title: 'Customer-Specific Pricing & Dealer Contract Engines',
    readTime: '6 min read',
    excerpt: 'Automating multi-tiered wholesale pricing, custom contract terms, and volume discount structures across enterprise buyer groups.',
    content: `
### Overcoming the Complexity of B2B Pricing Matrices
In B2B distribution, no two buyers pay the same price. SilarAI connects directly to your ERP or PIM system to display real-time contract prices to authenticated buyers.

### Dynamic Pricing & Quote Features
- **Tiered Matrix Resolution**: Resolves complex customer groups, volume tiers, and promotional rebates in under 30 milliseconds.
- **Automated Price Lock Warnings**: Alerts buyers when contract expiration dates approach or minimum order quantities (MOQs) are met.
- **Custom Quote Generation**: Converts custom chat inquiries into formal downloadable PDF quotations with automated sales rep sign-off workflows.
    `,
    keywords: ['Customer-Specific Pricing', 'Dealer Portal Software', 'Distribution Ordering Platform'],
  },
  {
    id: 'erp-integrated-b2b-commerce-portals',
    title: 'ERP-Integrated Commerce Portals: SAP, Oracle & Dynamics 365',
    readTime: '8 min read',
    excerpt: 'Bridging enterprise ERP backends with intuitive modern web and mobile ordering interfaces for dealers and buyers.',
    content: `
### Modernizing Legacy ERP Backends
ERP platforms excel at inventory management and financial ledger keeping, but offer poor customer-facing interfaces. SilarAI provides a modern headless API layer to unify ERP data into a frictionless ordering portal.

### Supported ERP & PIM Ecosystems
- **SAP S/4HANA & ECC**: Real-time bi-directional sync for orders, credit limits, and delivery tracking.
- **Oracle NetSuite & Cloud ERP**: Live inventory stock checks across multi-warehouse logistics networks.
- **Microsoft Dynamics 365 & Odoo**: Automated sync of product catalogs, SDS documents, and customer account ledgers.
    `,
    keywords: ['Distribution ERP Integration', 'ERP-Integrated Commerce Platform', 'SAP Oracle Dynamics Integration'],
  },
  {
    id: 'multi-warehouse-inventory-visibility-ai',
    title: 'Multi-Warehouse Real-Time Inventory Visibility',
    readTime: '5 min read',
    excerpt: 'Providing buyers with instant stock availability across regional distribution centers and automated split-shipment scheduling.',
    content: `
### Eliminating Order Delays and Backorder Frustration
B2B buyers cannot wait days to learn if a critical replacement part is in stock. SilarAI surfaces live inventory levels across primary and regional warehouses instantly.

### Multi-Location Inventory Features
- **Nearest Distribution Center Routing**: Automatically calculates lead times and shipping costs from the closest stocking facility.
- **Smart Split-Shipment Suggestions**: Offers buyers options to receive available items immediately while backordering remaining units.
- **Real-Time Freight & LTL Quotes**: Integrates with major carrier APIs to calculate instant freight rates for pallet and full-truckload shipments.
    `,
    keywords: ['Inventory Visibility', 'AI Inventory Search for Distributors', 'Multi-Warehouse Stock Checks'],
  },
  {
    id: 'ai-rfq-and-quotation-workflow-automation',
    title: 'AI-Powered RFQ & Quotation Workflow Automation',
    readTime: '6 min read',
    excerpt: 'Accelerating quote turnaround time from days to minutes with automated bill-of-materials (BOM) parsing and approval routing.',
    content: `
### Turning Quote Requests into Won Orders Faster
Manual quotation processing creates bottlenecks that lead to lost sales opportunities. SilarAI automates quote creation from uploaded spreadsheets, PDFs, or conversational requests.

### Automated RFQ Workflow Steps
- **BOM & Document Parsing**: Extracts part numbers, quantities, and specifications directly from uploaded customer PDFs or CSV lists.
- **Margin Protection Guardrails**: Automatically flags custom discount requests below target gross margin thresholds for human approval.
- **One-Click Quote Acceptance**: Allows buyers to review, accept, and convert approved quotes directly into binding purchase orders.
    `,
    keywords: ['AI Quotation Software for Distributors', 'RFQ Automation', 'B2B Sales Automation'],
  },
  {
    id: 'dealer-and-contractor-self-service-portals',
    title: 'Dealer & Contractor Self-Service Ordering Portals',
    readTime: '7 min read',
    excerpt: 'Empowering commercial buyers and dealer networks with self-service ordering, invoice downloads, and credit limit tracking.',
    content: `
### Streamlining Day-to-Day Dealer Operations
Dealers and trade contractors require fast self-service capabilities to order products early in the morning or late at night.

### Portal Functional Modules
- **Quick Order & Matrix Grid**: Enables rapid bulk entry by SKU number or CSV upload for hundreds of line items in seconds.
- **Account Ledger & Invoice Access**: Allows buyers to view outstanding balances, pay open invoices, and download tax documentation.
- **Custom Authorized Buyer Roles**: Supports multi-user purchasing accounts with custom spending limits and manager approval rules.
    `,
    keywords: ['Dealer Portal Software', 'Dealer Ordering Software', 'Contractor Self-Service Portal'],
  },
  {
    id: 'knowledge-ai-for-technical-documentation-and-sds',
    title: 'Knowledge AI: Searching SDS, Manuals & Certifications',
    readTime: '6 min read',
    excerpt: 'Using Retrieval-Augmented Generation (RAG) to instantly query safety data sheets, technical spec sheets, and installation guides.',
    content: `
### Instant Access to Critical Technical Data
Industrial and chemical distributors manage thousands of compliance documents, safety data sheets (SDS), and technical manuals.

### SilarAI Knowledge Engine
- **RAG Technical Document Search**: Indexes PDFs, CAD drawings, and spec sheets so buyers can ask technical questions in plain text.
- **Compliance & Certification Verification**: Instantly surfaces ISO certifications, UL listings, and environmental compliance documents.
- **Interactive Troubleshooting**: Assists field technicians with step-by-step diagnostic and maintenance instructions.
    `,
    keywords: ['Knowledge AI', 'Technical Document Search', 'SDS Search Engine'],
  },
  {
    id: 'intelligent-b2b-product-discovery-and-cross-reference',
    title: 'Intelligent B2B Product Discovery & OEM Cross-Referencing',
    readTime: '6 min read',
    excerpt: 'Helping buyers find exact matches, compatible accessories, and cross-referenced alternatives across massive catalogs.',
    content: `
### Solving the OEM Part Number Puzzle
Contractors often search using competitor or old OEM part numbers. SilarAI uses semantic cross-referencing to find exact or superior alternatives.

### Cross-Referencing Capabilities
- **Competitor Part Number Mapping**: Automatically translates competitor part numbers into your equivalent catalog SKUs.
- **Required Accessories Prompts**: Prompts buyers to include essential mounting kits, sealants, or cables required for complete installation.
- **Obsolete SKU Upgrades**: Identifies discontinued items and redirects buyers to the latest upgraded replacement model.
    `,
    keywords: ['Intelligent Product Discovery', 'OEM Cross-Reference AI', 'B2B Product Search'],
  },
  {
    id: 'reducing-distribution-sales-support-workload',
    title: 'Reducing Distributor Sales Support Workload with AI',
    readTime: '7 min read',
    excerpt: 'Reallocating sales team focus from routine order checking to high-value relationship building and strategic accounts.',
    content: `
### Freeing Up Inside Sales Teams
Inside sales reps spend over 50% of their workday answering basic questions: "Is it in stock?", "What is my price?", and "Where is my shipment?".

### Operational Efficiency Impact
- **85%+ Routine Query Handling**: AI resolves routine availability, tracking, and pricing questions instantly.
- **Smart Escalation to Inside Sales**: Routes high-value or complex custom engineering requests directly to dedicated account managers.
- **Actionable Buyer Intent Analytics**: Provides sales reps with real-time insight into what their assigned accounts are browsing and searching.
    `,
    keywords: ['AI Sales Assistant', 'Reduce Sales Support Workload', 'Wholesale Commerce Automation'],
  },
  {
    id: 'scaling-wholesale-distribution-revenue-with-ai',
    title: 'Scaling Wholesale Distribution Revenue with AI Commerce',
    readTime: '8 min read',
    excerpt: 'A comprehensive playbook for enterprise distributors to drive digital revenue growth and defend market share.',
    content: `
### Future-Proofing Distribution Businesses
As digital-first B2B marketplaces enter the market, traditional distributors must digitize their customer touchpoints to protect margins.

### SilarAI Distribution Playbook
- **24/7 Digital Ordering Availability**: Captures orders outside normal business hours without adding night-shift staff.
- **Predictive Replenishment Alerts**: Notifies commercial buyers before critical inventory consumable supplies run out based on historical usage velocity.
- **Unified Omnichannel Experience**: Synchronizes pricing, stock, and order history across online web portals, mobile apps, and sales rep tablets.
    `,
    keywords: ['Best AI Commerce Platform for Distributors', 'Scale Distribution Revenue', 'Enterprise Distribution AI'],
  },
];

export const DistributorsIndustryPage: React.FC<DistributorsIndustryPageProps> = ({
  onBackToHome,
  onBookDemo,
  onNavigateToPage,
  onSelectAiShoppingPage,
  onSelectAiCommercePage,
  onSelectManufacturingPage,
  onSelectD2cPage,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'features' | 'sectors' | 'clusters' | 'faqs'>('overview');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('b2b-ai-shopping-assistants-distributors');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [searchDemoQuery, setSearchDemoQuery] = useState<string>('Explosion-proof 3-phase electric motor 5HP');
  const [demoQueryResult, setDemoQueryResult] = useState<string | null>('Found 4 Class I Div 1 certified motors with customer contract tier price ($482.00) and 12 units available in Regional Warehouse B.');

  const handleSearchDemo = (q: string) => {
    setSearchDemoQuery(q);
    if (q.toLowerCase().includes('chemical') || q.toLowerCase().includes('sds')) {
      setDemoQueryResult('Retrieved SDS Safety Sheet for Industrial Solvent #402 with 24-drum bulk pallet availability in Chicago Distribution Center.');
    } else if (q.toLowerCase().includes('medical') || q.toLowerCase().includes('gloves')) {
      setDemoQueryResult('Found Class 2 nitrile medical gloves (Case of 1000) with Tier 3 Contract Pricing ($64.50/case) and same-day shipping eligibility.');
    } else if (q.toLowerCase().includes('electrical') || q.toLowerCase().includes('breaker')) {
      setDemoQueryResult('Cross-referenced OEM Part #GE-204A to equivalent Eaton 20A Circuit Breaker in stock across 3 regional facilities.');
    } else {
      setDemoQueryResult(`Semantic AI search results for "${q}": 6 contract-eligible SKUs retrieved with real-time ERP inventory validation.`);
    }
  };

  const currentArticle = DISTRIBUTORS_CLUSTER_ARTICLES.find((a) => a.id === selectedClusterId) || DISTRIBUTORS_CLUSTER_ARTICLES[0];

  const DISTRIBUTOR_SECTORS = [
    { name: 'Industrial Equipment', icon: Wrench, desc: 'Heavy machinery parts, hydraulic systems, pneumatic controls, and maintenance supplies.' },
    { name: 'Chemicals', icon: FlaskConical, desc: 'Specialty solvents, raw materials, SDS document compliance, and drum/bulk logistics.' },
    { name: 'Pharmaceuticals', icon: Pill, desc: 'Rx wholesale, cold-chain tracking, FDA regulatory compliance, and hospital supply chains.' },
    { name: 'Electrical Supplies', icon: ZapIcon, desc: 'Conduit, transformers, switchgear, circuit breakers, and commercial lighting systems.' },
    { name: 'Electronics Components', icon: Cpu, desc: 'Semiconductors, connectors, passive components, reel quantities, and spec sheets.' },
    { name: 'Automotive Parts', icon: Car, desc: 'OEM cross-referencing, fleet maintenance spares, aftermarket parts, and tire distribution.' },
    { name: 'Construction Materials', icon: HardHat, desc: 'Lumber, fasteners, roofing, HVAC ductwork, and contractor jobsite delivery scheduling.' },
    { name: 'Packaging', icon: Box, desc: 'Corrugated boxes, stretch wrap, custom printed materials, and automated reorders.' },
    { name: 'Food & Beverage Distribution', icon: UtensilsCrossed, desc: 'Restaurant supply, cold storage logistics, perishable tracking, and institutional sales.' },
    { name: 'Medical Supplies', icon: Stethoscope, desc: 'Surgical supplies, PPE, diagnostic equipment, and GPO contract pricing matrices.' },
    { name: 'Safety Equipment', icon: ShieldCheck, desc: 'PPE, fall protection, hazard monitoring, OSHA compliance docs, and facility safety.' },
    { name: 'Office Products', icon: Building2, desc: 'Corporate supply replenishment, janitorial paper goods, and recurring office orders.' },
  ];

  const DISTRIBUTOR_FAQS = [
    {
      q: 'What is AI Commerce for distributors?',
      a: 'AI Commerce enables distributors to improve B2B ordering, product discovery, dealer management, customer-specific pricing, quotation management, and customer support using artificial intelligence. It simplifies complex buying journeys while integrating directly with existing ERP systems.',
    },
    {
      q: 'How does an AI Shopping Assistant help distributors?',
      a: 'An AI Shopping Assistant helps commercial buyers and dealers search large product catalogs, compare technical specifications, check multi-warehouse inventory, view negotiated contract pricing, request formal quotations, and place bulk orders using natural language conversations.',
    },
    {
      q: 'Can SilarAI integrate with SAP, Oracle, or Microsoft Dynamics?',
      a: 'Yes. SilarAI Commerce AI integrates with leading enterprise ERP and CRM platforms including SAP (S/4HANA & ECC), Oracle (NetSuite & Cloud ERP), Microsoft Dynamics 365, ERPNext, Odoo, Salesforce, inventory management systems, and Product Information Management (PIM) solutions.',
    },
    {
      q: 'How does AI improve product discovery for distributors?',
      a: 'AI understands customer intent and technical requirements rather than relying only on exact product codes or keywords. Buyers can search using technical specifications, industry terminology, product applications, or competitor OEM part numbers to find the exact or equivalent items.',
    },
    {
      q: 'Is SilarAI suitable for wholesale and distribution businesses?',
      a: 'Yes. SilarAI is designed specifically for wholesale distributors, industrial suppliers, manufacturers, and dealer networks requiring enterprise AI-powered B2B commerce, intelligent product discovery, dealer self-service portals, RFQ automation, and real-time ERP integration.',
    },
    {
      q: 'What industries benefit from SilarAI Commerce AI for Distributors?',
      a: 'SilarAI supports distributors in industrial equipment, chemicals, pharmaceuticals, automotive parts, electronics components, electrical supplies, packaging, construction materials, medical supplies, safety equipment, food & beverage distribution, and office products.',
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
                '@id': 'https://silarai.com/?page=distributors#webpage',
                url: 'https://silarai.com/?page=distributors',
                name: 'AI Commerce Platform for Distributors | AI Shopping Assistant | SilarAI',
                description:
                  'SilarAI Commerce AI enables distributors to deliver intelligent B2B commerce through AI Shopping Assistants, dealer portals, AI-powered product discovery, customer-specific pricing, quotation automation, and ERP-integrated ordering across SAP, Oracle, and Dynamics 365.',
              },
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI Distribution Commerce AI Platform',
                operatingSystem: 'Cloud Native / Web / Headless API',
                applicationCategory: 'BusinessApplication, ECommerceApplication',
                description:
                  'Enterprise AI Commerce Platform for Wholesale Distributors featuring AI Shopping Assistants, B2B Dealer Portals, Customer-Specific Pricing, RFQ Automation, and Multi-Warehouse Inventory Visibility.',
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.97',
                  ratingCount: '192',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Commerce Platform for Distributors',
                provider: {
                  '@type': 'Organization',
                  name: 'SilarAI Technologies',
                  url: 'https://silarai.com',
                },
                areaServed: 'Worldwide',
                serviceType: 'B2B Wholesale Distribution AI Solutions',
              },
              {
                '@type': 'FAQPage',
                mainEntity: DISTRIBUTOR_FAQS.map((faq) => ({
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
                  { '@type': 'ListItem', position: 3, name: 'AI Commerce Platform for Distributors', item: 'https://silarai.com/?page=distributors' },
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
              <Truck className="w-3.5 h-3.5" />
              AI Commerce Platform for Distributors
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-plum-800 text-peach-200 px-2.5 py-0.5 rounded-full font-bold border border-plum-700">
              B2B Enterprise Specification v2.4
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 bg-gradient-to-b from-plum-950 via-plum-900 to-slate-900 text-white overflow-hidden">
        {/* Background Decorative Accent Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-peach-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-800/80 border border-peach-300/40 text-peach-300 text-xs font-black uppercase tracking-wider">
                <Truck className="w-4 h-4 text-peach-300" />
                <span>Distributor B2B Commerce Solution</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                AI Commerce Platform for Distributors
              </h1>

              <h2 className="text-xl sm:text-2xl font-extrabold text-peach-300">
                Modernize Distribution with AI-Powered Commerce
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Distributors manage thousands of products, complex pricing agreements, dealer networks, inventory across multiple warehouses, and demanding B2B customers. Traditional ordering processes often rely on manual sales support, phone calls, emails, and ERP systems that are not designed for modern buying experiences.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                SilarAI Commerce AI enables distributors to deliver intelligent B2B commerce through AI Shopping Assistants, dealer portals, AI-powered product discovery, customer-specific pricing, quotation automation, and ERP-integrated ordering. Whether you distribute industrial equipment, chemicals, pharmaceuticals, automotive parts, electrical supplies, packaging, or consumer goods, SilarAI helps customers find products faster and place orders efficiently without depending on sales reps.
              </p>

              {/* Call to Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onBookDemo('Distributors AI Commerce')}
                  className="px-6 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-lg hover:shadow-peach-300/20 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Book a Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('distributor-cluster-hub');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-plum-800/90 hover:bg-plum-800 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-peach-300" />
                  <span>Transform Your Distribution Business</span>
                </button>
              </div>

              {/* Verified Metrics Badge Bar */}
              <div className="pt-6 border-t border-plum-800/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">-65%</div>
                  <div className="text-xs text-slate-400 font-medium">Sales Support Calls</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">80%</div>
                  <div className="text-xs text-slate-400 font-medium">Faster Reorders</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">&lt;30ms</div>
                  <div className="text-xs text-slate-400 font-medium">Contract Price Sync</div>
                </div>
              </div>

            </div>

            {/* Interactive Intent Search & Assistant Interactive Demo Widget */}
            <div className="lg:col-span-5 bg-white/95 text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Live Distributor B2B Simulator</h3>
                    <p className="text-[10px] text-slate-500">Test Technical Discovery &amp; Stock Checks</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live ERP Engine
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Type or click a commercial B2B query:</label>
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
                    'Explosion-proof 3-phase electric motor 5HP',
                    'Industrial Solvent #402 SDS sheet',
                    'Class 2 medical gloves bulk pricing',
                    'Eaton 20A Circuit Breaker cross reference',
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
                    <span>ERP Matrix Resolution (<span className="text-emerald-600 font-bold">28ms latency</span>)</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    {demoQueryResult}
                  </p>
                  <div className="pt-2 border-t border-plum-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>ERP System: <strong className="text-slate-800 font-bold">SAP / NetSuite / Dynamics 365</strong></span>
                    <span className="text-plum-700 font-bold">Instant PunchOut PO</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Supports SAP, NetSuite, Dynamics 365, Odoo &amp; PIM</span>
                <a href="#distributor-features" className="text-plum-700 font-bold hover:underline">View Features ↓</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Navigation Sticky Bar for Distributors Page Sections */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-3">
          {[
            { id: 'overview', label: 'Why Distributors AI' },
            { id: 'challenges', label: 'Challenges & Solutions' },
            { id: 'features', label: 'Platform Features' },
            { id: 'erps', label: 'ERP & System Integrations' },
            { id: 'sectors', label: 'Distributor Sectors (12)' },
            { id: 'clusters', label: 'Content Hub & Articles (10)' },
            { id: 'faqs', label: 'Distributor FAQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                const el = document.getElementById(`distributor-${tab.id}`);
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

      {/* Section 1: Why Distributors Need AI Commerce */}
      <section id="distributor-overview" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              The Digital Distribution Evolution
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Why Distributors Need AI Commerce
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Modern B2B buyers expect the same digital experience they receive in consumer ecommerce. They want instant product search, personalized pricing, real-time inventory visibility, fast quotations, and self-service ordering. Traditional distributor portals often depend on manual support and ERP interfaces that create delays and increase operational costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Autonomous B2B Sales Assistants</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Replaces static forms with 24/7 AI assistants that resolve complex part specs, negotiated pricing, and bulk quotes instantly.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">OEM Cross-Reference &amp; RAG</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Queries SDS sheets, technical manuals, and competitor OEM part numbers using natural language vector search.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Real-Time ERP Inventory</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Surfaces live warehouse stock, freight lead times, and account credit lines directly into buyer and dealer portals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Challenges Faced by Distributors & How SilarAI Solves Them */}
      <section id="distributor-challenges" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Overcoming Distribution Bottlenecks
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Challenges Faced by Distributors &amp; SilarAI Solutions
            </h2>
            <p className="text-base text-slate-600">
              Transforming heavy catalog friction and manual ERP backorders into automated digital revenue.
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
                Distributors often manage tens of thousands of products across multiple manufacturers. Customers struggle to locate the right product quickly.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Semantic AI search and OEM cross-referencing that understands technical application specs and industry terminology.
                </p>
              </div>
            </div>

            {/* Challenge 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #2
                </span>
                <span className="text-xs font-bold text-slate-400">Pricing</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Customer-Specific Pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Different customers receive different pricing, negotiated contracts, and discount structures. Managing these manually slows down sales.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Real-time ERP contract pricing engine resolving sub-30ms customer-specific matrices upon login.
                </p>
              </div>
            </div>

            {/* Challenge 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #3
                </span>
                <span className="text-xs font-bold text-slate-400">Dealer Ordering</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Dealer &amp; Customer Ordering</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sales teams spend significant time processing repeat orders, checking availability, and responding to routine product inquiries.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Self-service dealer portals with 1-click matrix reordering, invoice access, and credit line checks.
                </p>
              </div>
            </div>

            {/* Challenge 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #4
                </span>
                <span className="text-xs font-bold text-slate-400">Multi-Warehouse</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Inventory Across Warehouses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers need instant answers: Is it available? Which warehouse has stock? What's the delivery date? Without real-time answers, sales are lost.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Multi-warehouse inventory visibility showing regional stock levels, lead times, and split-shipment options.
                </p>
              </div>
            </div>

            {/* Challenge 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #5
                </span>
                <span className="text-xs font-bold text-slate-400">Quotations</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Manual RFQ &amp; Quotation Process</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Processing quotation requests through emails and spreadsheets creates delays, lowers win rates, and frustrates buyers.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  AI Quote Automation parsing BOM PDFs/spreadsheets and generating downloadable formal quotes in minutes.
                </p>
              </div>
            </div>

            {/* Challenge 6 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #6
                </span>
                <span className="text-xs font-bold text-slate-400">ERP Sync</span>
              </div>
              <h3 className="text-base font-black text-slate-900">ERP Interface Friction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ERP systems manage backend inventory and finance but rarely provide intuitive customer-facing buying experiences.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Headless API layer connecting SAP, NetSuite, Dynamics 365, and Odoo to modern, fast storefront interfaces.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Platform Features & Distributor Tools */}
      <section id="distributor-features" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Enterprise Feature Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              SilarAI Distribution Platform Features
            </h2>
            <p className="text-base text-slate-600">
              Purpose-built capabilities for high-volume wholesale distributors and dealer networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Shopping Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deliver intelligent conversational buying experiences for contractors, dealers, and corporate buyers 24/7.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Product Search</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enable semantic vector search based on technical specifications, OEM part numbers, and business application needs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Customer-Specific Pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Display negotiated contract pricing, volume breaks, and customer-specific catalogs securely upon login.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Dealer Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide distributors and dealers with a centralized portal for quick ordering, quotes, invoices, and account tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">B2B Commerce Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Support bulk matrix ordering, repeat purchases, RFQ approvals, and corporate procurement PunchOut workflows.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Warehouse className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Inventory Visibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide real-time stock availability across primary and regional warehouses with freight lead times.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Sales Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empower inside sales teams to answer buyer technical questions instantly using enterprise product knowledge.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Order Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allow customers to place purchase orders, track LTL shipments, and download tax documentation seamlessly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Knowledge AI (RAG)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enable natural language vector search across technical manuals, SDS safety sheets, ISO specs, and installation guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: ERP & System Integrations Grid */}
      <section id="distributor-erps" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-peach-300 bg-plum-800 px-3.5 py-1.5 rounded-full border border-plum-700">
              Native Enterprise Connections
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Seamless ERP, PIM &amp; CRM Integration
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              SilarAI connects with your existing tech stack without forcing expensive legacy system replacements.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'SAP S/4HANA & ECC', desc: 'Real-time order & credit limit sync' },
              { name: 'Oracle NetSuite', desc: 'Multi-warehouse stock visibility' },
              { name: 'Microsoft Dynamics 365', desc: 'Contract pricing & catalog sync' },
              { name: 'ERPNext & Odoo', desc: 'Open API headless integration' },
              { name: 'Salesforce Commerce', desc: 'B2B CRM and pipeline sync' },
              { name: 'Infor CloudSuite', desc: 'Industrial supply chain sync' },
              { name: 'PIMcore & Akeneo', desc: 'Technical spec & SDS indexing' },
              { name: 'Epicor Prophet 21', desc: 'Wholesale distribution native sync' },
            ].map((erp, eIdx) => (
              <div key={eIdx} className="p-4 rounded-xl bg-plum-900/80 border border-plum-800 space-y-2 hover:border-peach-300/40 transition-colors">
                <div className="text-sm font-black text-peach-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{erp.name}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">{erp.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-plum-950 border border-plum-800 text-center max-w-2xl mx-auto text-xs text-slate-300">
            <span className="text-peach-300 font-bold">Custom ERP or Legacy AS400 System?</span> SilarAI provides REST, GraphQL, and Webhook APIs for bi-directional synchronization with any proprietary backend.
          </div>
        </div>
      </section>

      {/* Section 5: Industries Served (12 Distributor Sectors) */}
      <section id="distributor-sectors" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Industry Verticals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Distributor Sectors Supported
            </h2>
            <p className="text-base text-slate-600">
              Tailored B2B commerce workflows for specialized wholesale distribution verticals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DISTRIBUTOR_SECTORS.map((sector, idx) => {
              const IconComp = sector.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">{sector.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {sector.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: Content Hub - 10 Supporting Articles & Topic Clusters */}
      <section id="distributor-clusters" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Distribution Knowledge Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              AI Distribution Commerce Guides &amp; Insights
            </h2>
            <p className="text-base text-slate-600">
              Explore deep-dive technical articles on B2B commerce, ERP integration, and RFQ automation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Article Selector List */}
            <div className="lg:col-span-5 space-y-2">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                Select Content Topic (10 Articles)
              </h3>
              {DISTRIBUTORS_CLUSTER_ARTICLES.map((art) => (
                <button
                  key={art.id}
                  onClick={() => setSelectedClusterId(art.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    selectedClusterId === art.id
                      ? 'bg-plum-950 text-white border-plum-900 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className={`text-xs font-extrabold ${selectedClusterId === art.id ? 'text-peach-300' : 'text-slate-900'}`}>
                      {art.title}
                    </h4>
                    <p className={`text-[11px] line-clamp-1 ${selectedClusterId === art.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      {art.excerpt}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-md ${selectedClusterId === art.id ? 'bg-plum-800 text-peach-200' : 'bg-slate-200 text-slate-700'}`}>
                    {art.readTime}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Article Viewer Card */}
            <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-extrabold text-plum-900 bg-peach-300 px-3 py-1 rounded-full">
                  Topic Deep Dive
                </span>
                <span className="text-xs text-slate-500 font-bold">{currentArticle.readTime}</span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 leading-snug">
                {currentArticle.title}
              </h3>

              <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {currentArticle.content}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => onBookDemo('Distributor Technical Deep Dive')}
                  className="px-5 py-2.5 bg-plum-900 hover:bg-plum-950 text-peach-300 rounded-xl text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Request Custom ERP Strategy Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 6.5: SEO, AEO, AIO & GEO Semantic Backlink Matrix & Knowledge Graph */}
      <section id="distributor-backlinks-matrix" className="py-16 bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-plum-900/80 px-3.5 py-1.5 rounded-full border border-peach-400/30">
              Authority Backlinks &amp; Citation Network
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              SEO, AEO, AIO &amp; GEO Distributor Backlink Hub
            </h2>
            <p className="text-sm text-slate-300">
              Explore 100+ machine-indexed semantic backlinks, verified schemas, and authoritative entity citations across distributors, B2B wholesale, and enterprise commerce platforms.
            </p>
          </div>

          <DistributorsBacklinkHub
            defaultFilter="Distributors"
            onNavigateToPage={onNavigateToPage}
            onSelectAiShoppingPage={onSelectAiShoppingPage}
            onSelectAiCommercePage={onSelectAiCommercePage}
            onSelectManufacturingPage={onSelectManufacturingPage}
            onSelectD2cPage={onSelectD2cPage}
          />
        </div>
      </section>

      {/* Section 7: Frequently Asked Questions */}
      <section id="distributor-faqs" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Distributor AI Commerce FAQs
            </h2>
            <p className="text-sm text-slate-600">
              Direct answers to common enterprise distribution AI questions for buyers and AI engines.
            </p>
          </div>

          <div className="space-y-4">
            {DISTRIBUTOR_FAQS.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setActiveFaqIndex(activeFaqIndex === fIdx ? null : fIdx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="text-plum-700 font-extrabold text-sm">Q{fIdx + 1}.</span>
                    {faq.q}
                  </span>
                  {activeFaqIndex === fIdx ? (
                    <ChevronUp className="w-5 h-5 text-plum-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {activeFaqIndex === fIdx && (
                  <div className="px-5 pb-5 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Bottom Call-To-Action Footer Section */}
      <section className="py-16 bg-gradient-to-br from-plum-950 via-plum-900 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-800 text-peach-300 text-xs font-black uppercase tracking-wider border border-plum-700">
            <Truck className="w-4 h-4 text-peach-300" />
            <span>Ready for Enterprise AI Distribution Commerce?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Transform Your Distribution Business Today
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join leading industrial, electrical, chemical, and medical distributors using SilarAI to automate ordering, streamline RFQs, and increase B2B customer satisfaction.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onBookDemo('Distributor Footer CTA')}
              className="px-8 py-4 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-base rounded-xl shadow-xl hover:shadow-peach-300/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onBackToHome}
              className="px-8 py-4 bg-plum-800 hover:bg-plum-700 text-white font-extrabold text-base rounded-xl border border-plum-600 transition-all cursor-pointer"
            >
              Explore All Solutions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
