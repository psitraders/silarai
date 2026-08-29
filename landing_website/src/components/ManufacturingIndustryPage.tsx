import React, { useState } from 'react';
import {
  Factory,
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
  Truck,
  Plane,
  Paintbrush
} from 'lucide-react';

interface ManufacturingIndustryPageProps {
  onBackToHome: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
  activeSubPage?: number;
  onSelectSubPage?: (page: number) => void;
}

// 10 Supporting Content Cluster Articles for Manufacturing AI Commerce
const MANUFACTURING_CLUSTER_ARTICLES = [
  {
    id: 'ai-shopping-assistants-manufacturing',
    title: 'AI Shopping Assistants for Industrial & Product Manufacturers',
    readTime: '7 min read',
    excerpt: 'How virtual sales agents assist engineers, distributors, procurement managers, and field teams with complex technical product selection and ordering.',
    content: `
### Transforming Industrial Product Discovery
Industrial procurement requires technical accuracy, compatibility checks, and compliance validation. SilarAI Shopping Assistants serve as 24/7 autonomous experts that interpret CAD parameters, application specifications, and custom engineering requests instantly.

### Core Capabilities for Manufacturers
- **Natural Language & Technical Query Handling**: Converts problem descriptions (e.g. "corrosion-resistant high-temperature valve for chemical processing") into exact product SKUs.
- **Documentation Retrieval**: Automatically attaches Safety Data Sheets (SDS), CAD files, installation manuals, and ISO certifications to conversation threads.
- **Multi-Channel Integration**: Works embedded on manufacturer portals, distributor dealer sites, or mobile field sales applications.

### Business Impact
Manufacturing companies deploying SilarAI achieve up to **75% reduction in technical sales rep inquiries** and **3.2x faster quote conversions**.
    `,
    keywords: ['AI Commerce Platform for Manufacturers', 'AI Shopping Assistant for Manufacturers', 'B2B Commerce Platform'],
  },
  {
    id: 'manufacturing-rfq-and-quote-automation',
    title: 'Automating Industrial RFQs & Complex Quotation Workflows',
    readTime: '6 min read',
    excerpt: 'Accelerating custom request-for-quote (RFQ) timelines from weeks to minutes using AI rule engines and ERP price verification.',
    content: `
### Overcoming Manual Quote Bottlenecks
Preparing quotes for manufactured goods often involves cross-referencing raw material surcharges, custom configurations, volume tiers, and freight logistics. SilarAI automates quote generation while protecting gross margins.

### Automated RFQ Workflow Features
- **Smart Spec Sheet Parsing**: Reads customer RFQ documents and Bill of Materials (BOM) files automatically.
- **Configurable Margin Rules**: Evaluates minimum order quantities (MOQ) and custom engineering fees before routing to sales managers.
- **Instant Digital Proposal Delivery**: Generates professional, branded PDF proposals complete with line-item pricing and estimated delivery schedules.
    `,
    keywords: ['RFQ Automation', 'AI Quotation Software for Manufacturers', 'Manufacturing Sales Automation'],
  },
  {
    id: 'dealer-portal-software-for-manufacturers',
    title: 'Empowering Dealer & Distributor Networks with AI Portals',
    readTime: '7 min read',
    excerpt: 'Digitizing dealer ordering, territory pricing, co-op marketing claims, and stock visibility through secure self-service portals.',
    content: `
### Modernizing Dealer Relationships
Dealers and independent distributors expect frictionless ordering, transparent lead times, and instant access to marketing collateral.

### Dealer Portal Module Features
- **Territory-Specific Contract Pricing**: Automatically applies regional distributor discounts, tier rebates, and volume incentives.
- **Matrix & Batch Ordering**: Enables high-speed bulk reordering via SKU list entry or CSV upload.
- **Warranty & Spare Parts Finder**: Interactive exploded assembly diagrams that guide technicians to exact replacement parts.
    `,
    keywords: ['Dealer Portal Software', 'Dealer Portal Software for Manufacturing Companies', 'Manufacturing Dealer Portal'],
  },
  {
    id: 'erp-integrated-manufacturing-commerce',
    title: 'Connecting ERP Systems: SAP, Oracle & Microsoft Dynamics',
    readTime: '8 min read',
    excerpt: 'Bridging backend manufacturing ERP production schedules with high-speed web and mobile customer ordering interfaces.',
    content: `
### Unifying Operations & Digital Sales
ERP platforms like SAP S/4HANA, Oracle Cloud ERP, Microsoft Dynamics 365, ERPNext, and Odoo manage manufacturing resource planning but lack modern customer purchasing experiences.

### Integration Highlights
- **Real-Time Factory Inventory & ATP**: Queries Available-to-Promise (ATP) stock across global factory warehouses.
- **Live Order & Production Status**: Gives buyers live visibility into manufacturing stages, QA sign-offs, and dispatch tracking.
- **Seamless Financial Sync**: Automatically creates sales orders, updates credit limits, and syncs invoice ledgers.
    `,
    keywords: ['ERP Integrated Commerce', 'Manufacturing B2B Commerce Platform with ERP Integration', 'Digital Manufacturing Commerce'],
  },
  {
    id: 'ai-product-search-for-industrial-catalogs',
    title: 'Semantic AI Product Discovery for Complex Industrial Catalogs',
    readTime: '6 min read',
    excerpt: 'Overcoming technical keyword search limitations with vector AI that understands engineering intent and application contexts.',
    content: `
### Solving Heavy Spec-Based Search Challenges
When an industrial catalog contains 100,000+ variants, traditional keyword search leads to frustration and abandoned queries.

### AI Search Innovations
- **Application & Industry Search**: Recognizes intent from functional descriptions like "heavy-duty conveyor motor for mining applications".
- **Cross-Reference & Compatibility**: Automatically suggests equivalent components when legacy parts are discontinued.
- **Attribute Filtering**: Dynamic parametric filters tailored to specific product categories (e.g., voltage, pressure rating, material grade).
    `,
    keywords: ['AI Product Search', 'AI-Powered Product Discovery for Industrial Catalogs', 'Industrial Commerce Platform'],
  },
  {
    id: 'b2b2c-commerce-models-for-manufacturers',
    title: 'Navigating B2B, Direct-to-Consumer & B2B2C Hybrid Models',
    readTime: '7 min read',
    excerpt: 'Enabling manufacturers to sell directly to end-users while simultaneously supporting regional dealer networks on one unified platform.',
    content: `
### Channel Conflict Prevention
Modern manufacturers want to capture direct enterprise relationships without alienating established distributor networks.

### SilarAI Multi-Channel Capabilities
- **Dealer-Fulfilled Direct Sales**: Routes web orders to the nearest certified local distributor for local delivery and installation.
- **Brand Experience Control**: Maintains strict global brand consistency, product data accuracy, and MAP pricing across all channels.
- **Customer Account Partitioning**: Custom views and permissions for B2B wholesale buyers, enterprise accounts, and retail shoppers.
    `,
    keywords: ['B2B2C Commerce', 'Enterprise Manufacturing Platform', 'B2B Commerce Platform'],
  },
  {
    id: 'knowledge-ai-technical-documentation-search',
    title: 'Knowledge AI: Instant Search Across Manuals, SDS & Certifications',
    readTime: '6 min read',
    excerpt: 'Empowering engineers and buyers to query thousands of PDFs, CAD drawings, compliance docs, and manuals in plain English.',
    content: `
### Eliminating Manual Information Retrieval
Field engineers and procurement agents spend hours hunting for technical compliance documents and installation guides.

### Knowledge AI Features
- **Deep Document Parsing**: Reads unformatted technical PDFs, engineering diagrams, and Safety Data Sheets (SDS).
- **Exact Citation & Excerpt Answers**: Answers queries with precise page references and downloadable document links.
- **Multilingual Engineering Support**: Translates technical documentation into 30+ global languages instantly.
    `,
    keywords: ['Knowledge AI', 'Technical Documentation Search', 'Manufacturing AI'],
  },
  {
    id: 'ai-product-recommendations-industrial-spare-parts',
    title: 'Cross-Selling & Spare Parts Recommendations for Manufacturers',
    readTime: '6 min read',
    excerpt: 'Maximizing lifetime value through intelligent recommendation of maintenance kits, consumables, and complementary accessories.',
    content: `
### Capturing High-Margin Aftermarket Sales
Aftermarket spare parts and service kits represent the highest-margin segment for industrial manufacturers.

### Smart Recommendation Rules
- **Maintenance Kit Bundling**: Automatically prompts buyers purchasing primary equipment to include required seals, lubricants, and wear parts.
- **Machine Serial Number Matching**: Filters replacement parts based on the customer’s exact installed machine base.
- **Consumable Reorder Cadence**: Predicts when operating supplies need replacement based on operating hours.
    `,
    keywords: ['AI Product Recommendations', 'Spare Parts Automation', 'Increase Average Order Value'],
  },
  {
    id: 'customer-specific-pricing-industrial-contracts',
    title: 'Managing Complex Industrial Contract Pricing & Volume Rebates',
    readTime: '7 min read',
    excerpt: 'Handling multi-tiered corporate contracts, volume rebates, freight terms, and currency conversions effortlessly.',
    content: `
### Precision Pricing in Global Manufacturing
Global manufacturers operate with complex price books containing custom customer discounts, spot pricing, and currency adjustments.

### SilarAI Pricing Engine
- **Sub-30ms Contract Lookups**: Fetches authenticated customer contract rates directly from ERP upon login.
- **Tiered Volume Prompts**: Encourages buyers to increase order quantities by showing real-time price threshold savings.
- **Currency & Tax Localization**: Supports multi-currency invoicing and international tax calculation engines.
    `,
    keywords: ['Customer-Specific Pricing', 'Contract Pricing Engine', 'Manufacturing Commerce Platform'],
  },
  {
    id: 'scaling-manufacturing-digital-revenue-playbook',
    title: 'Scaling Manufacturing Digital Revenue: The C-Suite Playbook',
    readTime: '8 min read',
    excerpt: 'Strategic roadmap for manufacturing leaders to transform legacy sales operations into high-growth digital commerce channels.',
    content: `
### Strategic Growth for Modern Manufacturers
Embracing AI commerce allows manufacturers to expand global reach, lower cost-to-serve, and capture new market share.

### Executive Transformation Roadmap
- **Phased Implementation**: Launch AI product discovery and RFQ automation alongside legacy systems in under 8 weeks.
- **Field Sales Enablement**: Equip sales reps with AI mobile apps that deliver instant stock checks and quote approvals on customer sites.
- **Measurable ROI**: Achieve 25%+ growth in digital order volume within 6 months of platform launch.
    `,
    keywords: ['Best AI Commerce Platform for Manufacturers', 'Digital Manufacturing Commerce', 'Enterprise AI Commerce Platform for Manufacturing Companies'],
  },
];

export const ManufacturingIndustryPage: React.FC<ManufacturingIndustryPageProps> = ({
  onBackToHome,
  onBookDemo,
  activeSubPage,
  onSelectSubPage,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'features' | 'sectors' | 'clusters' | 'faqs'>('overview');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('ai-shopping-assistants-manufacturing');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [searchDemoQuery, setSearchDemoQuery] = useState<string>('Corrosion-resistant coating for chemical processing valves');
  const [demoQueryResult, setDemoQueryResult] = useState<string | null>('Found 6 High-Grade PTFE Coated Ball Valve SKUs. Applied Contract Tier 1 Pricing ($245.00/unit). CAD drawing & SDS PDF ready for download.');

  const handleSearchDemo = (q: string) => {
    setSearchDemoQuery(q);
    if (q.toLowerCase().includes('motor') || q.toLowerCase().includes('conveyor')) {
      setDemoQueryResult('Retrieved 3-Phase 15HP Heavy Duty Explosion-Proof Conveyor Motor SKUs. Contract Pricing ($1,420.00/unit) with 14 units ATP across Regional Factories.');
    } else if (q.toLowerCase().includes('valve') || q.toLowerCase().includes('stainless')) {
      setDemoQueryResult('Found Grade 316 Stainless Steel Flanged Valves (2" & 3" sizes). Applied Volume Discount Tier ($185.00/unit). Compliance certs attached.');
    } else if (q.toLowerCase().includes('pharmaceutical') || q.toLowerCase().includes('packaging')) {
      setDemoQueryResult('Matched High-Speed Rotary Blister Packaging Equipment spares. OEM serial validation confirmed. Net 30 terms active.');
    } else {
      setDemoQueryResult(`Semantic AI search results for "${q}": 6 contract-eligible manufacturing SKUs retrieved with real-time ERP ATP stock & technical spec verification.`);
    }
  };

  const currentArticle = MANUFACTURING_CLUSTER_ARTICLES.find((a) => a.id === selectedClusterId) || MANUFACTURING_CLUSTER_ARTICLES[0];

  const MANUFACTURING_SECTORS = [
    { name: 'Industrial Equipment', icon: Wrench, desc: 'Heavy machinery, hydraulic systems, pumps, compressors, bearings, and factory automation.' },
    { name: 'Chemicals', icon: FlaskConical, desc: 'Specialty compounds, industrial polymers, solvents, SDS compliance, and bulk liquid container shipping.' },
    { name: 'Pharmaceuticals', icon: Pill, desc: 'Active ingredients, medical packaging equipment, cleanroom supplies, and FDA validation docs.' },
    { name: 'Paints & Coatings', icon: Paintbrush, desc: 'Industrial anti-corrosion coatings, architectural finishes, automotive lacquers, and custom tinting.' },
    { name: 'Automotive Components', icon: Car, desc: 'OEM powertrain spares, chassis parts, EV battery modules, aftermarket components, and assembly hardware.' },
    { name: 'Electronics Manufacturing', icon: Cpu, desc: 'Semiconductors, PCB assemblies, connectors, testing instruments, and SMT supplies.' },
    { name: 'Electrical Equipment', icon: ZapIcon, desc: 'Transformers, switchgear, distribution panels, industrial conduits, and power cabling.' },
    { name: 'Packaging', icon: Box, desc: 'Corrugated cartons, flexible films, bottling systems, industrial strapping, and eco-packaging.' },
    { name: 'Construction Materials', icon: HardHat, desc: 'Structural steel, concrete additives, roofing membranes, fasteners, and contractor bulk orders.' },
    { name: 'Medical Devices', icon: Stethoscope, desc: 'Diagnostic hardware, surgical tools, disposables, ISO 13485 compliance, and hospital GPO contracts.' },
    { name: 'Aerospace Components', icon: Plane, desc: 'Precision machined alloys, avionics hardware, turbine spares, and AS9100 certified parts.' },
    { name: 'Food Processing Equipment', icon: UtensilsCrossed, desc: 'Sanitary pumps, stainless steel conveyors, industrial ovens, and food-grade lubricants.' },
  ];

  const MANUFACTURING_FAQS = [
    {
      q: 'What is AI Commerce for manufacturers?',
      a: 'AI Commerce uses artificial intelligence to improve product discovery, quotations, dealer ordering, customer engagement, and digital sales. It enables manufacturers to deliver intelligent buying experiences while integrating with existing ERP and CRM systems.',
    },
    {
      q: 'How does an AI Shopping Assistant help manufacturing companies?',
      a: 'An AI Shopping Assistant helps customers, distributors, and procurement teams search technical product catalogs, compare specifications, request quotations, check inventory, and place orders using natural language, reducing reliance on manual sales support.',
    },
    {
      q: 'Can SilarAI integrate with SAP, Oracle, and Microsoft Dynamics?',
      a: 'Yes. SilarAI Commerce AI integrates with major ERP and CRM platforms including SAP, Oracle, Microsoft Dynamics 365, Salesforce, ERPNext, Odoo, Product Information Management (PIM) systems, and inventory management platforms.',
    },
    {
      q: 'How does AI improve product discovery for manufacturers?',
      a: 'AI understands customer intent instead of relying on exact keywords. Customers can search using product applications, technical specifications, engineering terminology, or business problems, making it easier to find the right products within large industrial catalogs.',
    },
    {
      q: 'Is SilarAI suitable for B2B manufacturing?',
      a: 'Yes. SilarAI is purpose-built for manufacturers selling through distributors, dealers, wholesalers, or directly to businesses. It supports B2B, B2C, and B2B2C commerce models with customer-specific pricing, dealer portals, quotation workflows, and enterprise integrations.',
    },
    {
      q: 'Which manufacturing industries benefit from SilarAI Commerce AI?',
      a: 'SilarAI supports manufacturers in industrial equipment, chemicals, pharmaceuticals, automotive, electronics, electrical products, packaging, construction materials, medical devices, aerospace, food processing, and consumer goods.',
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
                '@id': 'https://silarai.com/?page=manufacturing#webpage',
                url: 'https://silarai.com/?page=manufacturing',
                name: 'AI Commerce Platform for Manufacturers | B2B AI Shopping Assistant | SilarAI',
                description:
                  'Transform manufacturing sales with AI Shopping Assistants, B2B commerce, dealer portals, RFQ automation, ERP integration, AI product search, and intelligent customer experiences.',
              },
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI Manufacturing Commerce AI Platform',
                operatingSystem: 'Cloud Native / Web / Headless API',
                applicationCategory: 'BusinessApplication, ECommerceApplication',
                description:
                  'Enterprise AI Commerce Platform for Manufacturers featuring AI Shopping Assistants, Dealer Portals, Customer-Specific Pricing, RFQ Automation, Knowledge AI, and Real-Time ERP Integration.',
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.99',
                  ratingCount: '245',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Commerce Platform for Manufacturers',
                provider: {
                  '@type': 'Organization',
                  name: 'SilarAI Technologies',
                  url: 'https://silarai.com',
                },
                areaServed: 'Worldwide',
                serviceType: 'Industrial Manufacturing AI Commerce Solutions',
              },
              {
                '@type': 'FAQPage',
                mainEntity: MANUFACTURING_FAQS.map((faq) => ({
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
                  { '@type': 'ListItem', position: 3, name: 'AI Commerce Platform for Manufacturers', item: 'https://silarai.com/?page=manufacturing' },
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
              <Factory className="w-3.5 h-3.5" />
              AI Commerce Platform for Manufacturers
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-plum-800 text-peach-200 px-2.5 py-0.5 rounded-full font-bold border border-plum-700">
              Manufacturing Specification v3.1
            </span>
          </div>
        </div>
      </div>

      {/* Interconnected Manufacturing 3-Page Tab Switcher */}
      <div className="bg-plum-950 border-b border-plum-900/80 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-plum-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-peach-300" />
            <span>Manufacturing AI Suite:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectSubPage && onSelectSubPage(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                (activeSubPage || 1) === 1
                  ? 'bg-peach-300 text-plum-950 shadow-sm'
                  : 'bg-plum-900 text-plum-200 hover:bg-plum-800'
              }`}
            >
              1. AI Commerce Platform
            </button>
            <button
              onClick={() => onSelectSubPage && onSelectSubPage(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubPage === 2
                  ? 'bg-peach-300 text-plum-950 shadow-sm'
                  : 'bg-plum-900 text-plum-200 hover:bg-plum-800'
              }`}
            >
              2. AI Shopping &amp; Sales Assistant
            </button>
            <button
              onClick={() => onSelectSubPage && onSelectSubPage(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubPage === 3
                  ? 'bg-peach-300 text-plum-950 shadow-sm'
                  : 'bg-plum-900 text-plum-200 hover:bg-plum-800'
              }`}
            >
              3. AI Dealer &amp; Distributor Commerce
            </button>
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
                <Factory className="w-4 h-4 text-peach-300" />
                <span>Manufacturing AI Commerce Engine</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                AI Commerce Platform for Manufacturers
              </h1>

              <h2 className="text-xl sm:text-2xl font-extrabold text-peach-300">
                Modernize Manufacturing Sales with AI-Powered Commerce
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Manufacturing companies are evolving from traditional sales models to intelligent digital commerce. Customers, distributors, dealers, procurement teams, and field sales teams expect fast product discovery, instant quotations, personalized pricing, and real-time order visibility.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Traditional ERP systems manage business transactions, but they were never designed to deliver modern buying experiences. SilarAI Commerce AI combines AI Shopping Assistants, B2B Commerce, Dealer Portals, B2B2C Commerce, AI Product Discovery, ERP Integration, and Enterprise AI into a single platform that helps manufacturers increase revenue while reducing operational complexity. Whether you manufacture industrial machinery, chemicals, pharmaceuticals, automotive components, electrical products, packaging, medical devices, or consumer goods, SilarAI enables customers to discover products faster and buy with confidence.
              </p>

              {/* Call to Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onBookDemo('Manufacturing AI Commerce')}
                  className="px-6 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-lg hover:shadow-peach-300/20 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Book a Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onBookDemo('Schedule Manufacturing AI Consultation')}
                  className="px-6 py-3.5 bg-plum-800/90 hover:bg-plum-800 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-peach-300" />
                  <span>Schedule a Manufacturing AI Consultation</span>
                </button>
              </div>

              {/* Verified Metrics Badge Bar */}
              <div className="pt-6 border-t border-plum-800/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">-75%</div>
                  <div className="text-xs text-slate-400 font-medium">Technical Support Load</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">3.2x</div>
                  <div className="text-xs text-slate-400 font-medium">Quote Conversion Rate</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">&lt;2 min</div>
                  <div className="text-xs text-slate-400 font-medium">Automated RFQ Generation</div>
                </div>
              </div>

            </div>

            {/* Interactive Manufacturing Assistant Demo Widget */}
            <div className="lg:col-span-5 bg-white/95 text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Manufacturing AI Assistant</h3>
                    <p className="text-[10px] text-slate-500">Test Technical Product Discovery &amp; RFQ Engine</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SAP / Oracle ATP Live
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Type or select a manufacturing technical query:</label>
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

                {/* Preset Technical Search Examples */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Corrosion-resistant coating for chemical valves',
                    'Industrial conveyor motor 15HP',
                    'Stainless steel flanged valves 3 inch',
                    'Pharmaceutical packaging blister machine',
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
                    <span>Manufacturing Knowledge &amp; Pricing Engine (<span className="text-emerald-600 font-bold">20ms</span>)</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    {demoQueryResult}
                  </p>
                  <div className="pt-2 border-t border-plum-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>ERP Link: <strong className="text-slate-800 font-bold">SAP S/4HANA / Dynamics 365</strong></span>
                    <span className="text-plum-700 font-bold">Download Tech Docs</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Supports SAP, Oracle, Dynamics, ERPNext, Odoo &amp; PIM</span>
                <a href="#manufacturing-features" className="text-plum-700 font-bold hover:underline">View Features ↓</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Navigation Sticky Bar for Manufacturing Sections */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-3">
          {[
            { id: 'overview', label: 'Why Manufacturers Need AI' },
            { id: 'challenges', label: 'Challenges & Solutions' },
            { id: 'features', label: 'Platform Features' },
            { id: 'sectors', label: 'Manufacturing Sectors (12)' },
            { id: 'clusters', label: 'Content Hub & Articles (10)' },
            { id: 'faqs', label: 'Manufacturing FAQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                const el = document.getElementById(`manufacturing-${tab.id}`);
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

      {/* Section 1: Why Manufacturers Need AI Commerce */}
      <section id="manufacturing-overview" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              The Digital Manufacturing Shift
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Why Manufacturers Need AI Commerce
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Manufacturing sales have become increasingly complex. Customers no longer want to wait for sales representatives to answer simple questions or provide quotations. Dealers expect self-service ordering, procurement teams require real-time inventory visibility, and engineers want access to technical documentation instantly. Manufacturers need a commerce platform that combines AI, automation, and enterprise integrations to simplify every stage of the buying journey. SilarAI Commerce AI transforms traditional manufacturing sales into intelligent digital commerce experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">AI Technical Assistants</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provide instant answers to engineering, compatibility, and sizing questions, reducing sales team support inquiries.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Automated RFQs &amp; Proposals</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Collect requirements, parse BOM lists, evaluate pricing matrices, and generate formal digital quotes in minutes.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Enterprise ERP &amp; PIM Sync</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sync live factory inventory, ATP production schedules, customer contract rates, and technical docs directly from ERP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Challenges Faced by Manufacturers & How SilarAI Solves Them */}
      <section id="manufacturing-challenges" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Solving Industrial Friction
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Manufacturing Challenges &amp; SilarAI AI Solutions
            </h2>
            <p className="text-base text-slate-600">
              Turn complex engineering and supply chain bottlenecks into automated revenue streams.
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
              <h3 className="text-base font-black text-slate-900">Large &amp; Complex Catalogs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manufacturers manage thousands of SKUs with variants, certifications, technical specs, accessories, and spare parts. Keyword search fails.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Semantic AI Product Discovery parsing technical intent, operating parameters, and compatibility requirements.
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
              <h3 className="text-base font-black text-slate-900">Slow RFQ &amp; Quotations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Relying on email, spreadsheets, and manual engineering reviews delays response times and causes lost sales opportunities.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  AI Quote Automation gathering spec requirements, evaluating pricing rules, and generating instant digital proposals.
                </p>
              </div>
            </div>

            {/* Challenge 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #3
                </span>
                <span className="text-xs font-bold text-slate-400">Dealers</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Dealer &amp; Distributor Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Managing multiple dealer networks, territory boundaries, custom pricing, and product catalogs increases operational friction.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Dedicated Dealer Portals with territory-aware pricing, matrix reorders, co-op management, and self-service account history.
                </p>
              </div>
            </div>

            {/* Challenge 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #4
                </span>
                <span className="text-xs font-bold text-slate-400">ERP Sync</span>
              </div>
              <h3 className="text-base font-black text-slate-900">ERP Legacy Dependency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                SAP, Oracle, and Dynamics manage production ledgers but offer clunky, outdated customer-facing interfaces.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Headless API layer connecting backend ERP ledgers to high-speed digital purchasing portals seamlessly.
                </p>
              </div>
            </div>

            {/* Challenge 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #5
                </span>
                <span className="text-xs font-bold text-slate-400">Application Search</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Technical Application Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buyers search by problems or engineering goals (e.g., "corrosion-resistant coating") rather than exact part numbers.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  AI Product Search mapping industry terms, operating conditions, and engineering specs to exact catalog items.
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
              <h3 className="text-base font-black text-slate-900">Support &amp; Technical Workload</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sales reps spend hours answering repetitive queries regarding compatibility, lead times, certifications, and spare parts.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  24/7 Knowledge AI parsing manuals, SDS files, CAD drawings, and ISO certs instantly in natural language.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Platform Features & Manufacturing Capabilities */}
      <section id="manufacturing-features" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Enterprise Manufacturing Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Key Features for Manufacturers
            </h2>
            <p className="text-base text-slate-600">
              Built specifically for industrial B2B, dealer network, and direct digital commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Shopping Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide instant conversational assistance for technical product selection, ordering, and application inquiries.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Intelligent Product Search</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Help customers find products using applications, engineering specs, or operational requirements.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Dealer Portal Software</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digitize dealer ordering, territory pricing, co-op claims, quote approvals, and account management.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">B2B Commerce</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Modernize procurement and distributor purchasing with AI-assisted quick ordering and credit limits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">B2B2C Commerce</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Support direct manufacturer sales alongside distributor and dealer channels from a unified platform.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Customer-Specific Pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deliver negotiated contract rates, volume discount matrices, and promotional pricing securely.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Sales Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Equip field sales reps with instant mobile access to product knowledge, stock checks, and quote tools.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Order &amp; Shipment Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allow customers to place orders, track freight shipments, and review purchase history self-service.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Warehouse className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Inventory Visibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide real-time Available-to-Promise (ATP) stock across factories, warehouses, and regional hubs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Manufacturing Sectors Served (12) */}
      <section id="manufacturing-sectors" className="py-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-peach-300 bg-plum-800 px-3.5 py-1.5 rounded-full border border-plum-700">
              Target Manufacturing Verticals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Manufacturing Industries Served
            </h2>
            <p className="text-base text-slate-300">
              SilarAI Commerce AI empowers manufacturers across global industrial sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {MANUFACTURING_SECTORS.map((sector, idx) => {
              const IconComp = sector.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 hover:border-peach-300/50 transition-all space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-plum-800 text-peach-300 flex items-center justify-center font-bold">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-white">{sector.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{sector.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-plum-950 p-6 rounded-2xl border border-plum-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white">Need a specialized manufacturing solution?</h3>
              <p className="text-xs text-slate-300">Custom AI taxonomy, CAD viewer integrations, and complex pricing rules available.</p>
            </div>
            <button
              onClick={() => onBookDemo('Custom Manufacturing AI Architecture')}
              className="px-5 py-2.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Consult Manufacturing Architect
            </button>
          </div>
        </div>
      </section>

      {/* Section 5: Benefits for Manufacturers */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Measurable Business ROI
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Benefits of SilarAI for Manufacturers
            </h2>
            <p className="text-base text-slate-600">
              Proven results achieved by manufacturing companies deploying SilarAI Commerce AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: 'Accelerate Quote Response', desc: 'Reduce quotation turnaround from days to minutes with automated rules.' },
              { title: 'Improve Dealer Productivity', desc: 'Empower dealer networks with self-service ordering and territory tools.' },
              { title: 'Increase Digital Sales', desc: 'Capture 24/7 orders from global buyers and regional procurement accounts.' },
              { title: 'Enhance Self-Service', desc: 'Allow customers to access invoices, CAD files, and tracking links independently.' },
              { title: 'Reduce Support Costs', desc: 'Automate 75%+ of repetitive technical inquiries and stock status checks.' },
            ].map((benefit, bIdx) => (
              <div key={bIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <h3 className="text-sm font-black text-slate-900">{benefit.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Content Cluster Article Hub (10 In-Depth Guides) */}
      <section id="manufacturing-clusters" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Manufacturing Knowledge Center
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Manufacturing AI Commerce Content Hub
            </h2>
            <p className="text-base text-slate-600">
              In-depth technical guides, strategic playbooks, and architecture blueprints for manufacturing leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Article List */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider px-1">
                Select Guide ({MANUFACTURING_CLUSTER_ARTICLES.length} Articles)
              </h3>
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-2">
                {MANUFACTURING_CLUSTER_ARTICLES.map((article) => {
                  const isSelected = article.id === selectedClusterId;
                  return (
                    <button
                      key={article.id}
                      onClick={() => setSelectedClusterId(article.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-plum-950 text-white border-plum-900 shadow-md'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-plum-400 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className={`font-bold ${isSelected ? 'text-peach-300' : 'text-plum-700'}`}>
                          {article.readTime}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-peach-300' : 'text-slate-400'}`} />
                      </div>
                      <h4 className="text-xs font-black leading-snug">{article.title}</h4>
                      <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {article.excerpt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Article Detail Viewer */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-black text-plum-900 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
                  {currentArticle.readTime}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {currentArticle.title}
              </h3>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {currentArticle.content}
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Topic: <strong className="text-slate-800">{currentArticle.title}</strong>
                </div>
                <button
                  onClick={() => onBookDemo(`Manufacturing Guide: ${currentArticle.title}`)}
                  className="px-4 py-2 bg-plum-700 hover:bg-plum-800 text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Request Strategy Briefing →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 7: Frequently Asked Questions */}
      <section id="manufacturing-faqs" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600">
              Optimized for Google AI Overviews, Perplexity, ChatGPT, and voice search.
            </p>
          </div>

          <div className="space-y-4">
            {MANUFACTURING_FAQS.map((faq, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
                >
                  <button
                    onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-black text-sm text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-plum-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 bg-white font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Conversion Call to Action */}
      <section className="py-20 bg-gradient-to-br from-plum-950 via-plum-900 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-800 text-peach-300 text-xs font-black uppercase tracking-wider border border-plum-700">
            <Factory className="w-4 h-4" />
            <span>Ready to Modernize Manufacturing Sales?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Transform Industrial Commerce with SilarAI
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Schedule a personalized demonstration to see how SilarAI Shopping Assistants, Dealer Portals, and RFQ Automation connect with your ERP to accelerate revenue.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onBookDemo('Manufacturing Final CTA')}
              className="px-8 py-4 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-xl hover:shadow-peach-300/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Book a Manufacturing Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToHome}
              className="px-8 py-4 bg-plum-800/80 hover:bg-plum-800 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all cursor-pointer"
            >
              Explore All Platform Solutions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
