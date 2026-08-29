import React, { useState } from 'react';
import {
  Store,
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
  Sliders,
  Users,
  MessageSquare,
  PackageCheck,
  Building2,
  BookOpen,
  ArrowUpRight,
  Shirt,
  Tv,
  Utensils,
  Armchair,
  Sparkle,
  Dumbbell,
  Gem,
  Car,
  Book,
  Dog,
  Gamepad2,
  Building,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface RetailIndustryPageProps {
  onBackToHome: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
}

// 10 Content Cluster Articles for Retail AI Commerce
const RETAIL_CLUSTER_ARTICLES = [
  {
    id: 'ai-shopping-assistants',
    title: 'AI Shopping Assistants for Retail',
    readTime: '6 min read',
    excerpt: 'How enterprise digital assistants guide shoppers, answer product queries, and automate checkout in natural language.',
    content: `
### Overview: The Rise of Conversational Retail
Modern retail shoppers no longer rely on rigid search filters or static category trees. Digital AI Shopping Assistants act as expert 24/7 store associates who understand intent, taste, budget, and context.

### Key Capabilities in Modern Retail
- **Natural Language Intent Reasoning**: Shoppers can ask "I need a durable waterproof jacket for hiking in 40-degree weather" and receive tailored, highly accurate recommendations.
- **Context-Aware Upselling**: Proactively suggests matching accessories, care kits, and warranty plans without feeling intrusive.
- **Multimodal Shopping**: Supports text, voice search in 20+ languages, and camera photo matching for instant item retrieval.

### Business Impact & Results
Retailers deploying SilarAI Shopping Assistants report up to **+380% conversion rate lift** and a **42% reduction in cart abandonment** by addressing buyer hesitation immediately during purchase evaluation.
    `,
    keywords: ['AI Shopping Assistant for Retail', 'Conversational Commerce', 'AI Retail Assistant'],
  },
  {
    id: 'omnichannel-commerce-strategy',
    title: 'Omnichannel Commerce Strategy',
    readTime: '8 min read',
    excerpt: 'Unifying online storefronts, physical POS, mobile apps, and WhatsApp into a single synchronized AI customer experience.',
    content: `
### The Challenge of Fragmented Channels
Shoppers frequently browse items on mobile apps, check stock at physical retail outlets, purchase via WhatsApp, or initiate returns in-store. When retail systems operate in silos, inventory errors and friction cripple customer trust.

### SilarAI Unified Omnichannel Solution
- **Unified Inventory Graph**: Syncs stock in real time across warehouse distribution centers and retail storefronts.
- **Cross-Channel Customer Context**: Preserves shopper preferences, cart items, and loyalty points across web, app, POS, and messaging apps.
- **Seamless Click & Collect**: Enables instant buy-online-pickup-in-store (BOPIS) reservations with automated WhatsApp notifications.

### Enterprise Strategic Recommendations
Retail chains should adopt headless, API-first commerce architectures to plug AI agents directly into existing POS and ERP backbones without disruptive tech stack overhauls.
    `,
    keywords: ['Omnichannel Commerce Platform', 'Retail Omnichannel Strategy', 'BOPIS AI'],
  },
  {
    id: 'ai-product-search-for-retailers',
    title: 'AI Product Search for Retailers',
    readTime: '5 min read',
    excerpt: 'Replacing legacy keyword search engines with semantic vector retrieval that understands shopper intent.',
    content: `
### Beyond Exact Keyword Matches
Legacy retail search engines fail whenever a customer uses synonyms, descriptive phrases, or minor typos (e.g., "breathable summer linen shirt" yielding zero results if tagged as "casual top").

### Semantic Vector Retrieval Engine
- **Intent Vectorization**: SilarAI indexes retail product catalogs into multi-dimensional vector embeddings to understand underlying semantic meaning.
- **Multi-Modal Visual Search**: Customers upload a photo of a dress or sneaker seen on social media to locate identical or similar items instantly in stock.
- **Sub-50ms Response Time**: Real-time catalog retrieval ensures lightning-fast page loading and zero zero-result pages.
    `,
    keywords: ['AI Product Search', 'Semantic Ecommerce Search', 'Visual Photo Search'],
  },
  {
    id: 'personalization-in-retail-with-ai',
    title: 'Personalization in Retail with AI',
    readTime: '7 min read',
    excerpt: 'Delivering hyper-individualized product recommendations, dynamic bundling, and tailored offers at scale.',
    content: `
### The Death of One-Size-Fits-All Retailing
Generic homepages showing static top-sellers to every visitor waste prime digital real estate. Modern shoppers demand experiences tailored to their style, past purchases, and real-time browsing behavior.

### SilarAI Personalization Engine
- **Real-Time Dynamic Merchandising**: Automatically re-orders grid collections based on click-through rates and individual buyer affinity.
- **Predictive Product Bundling**: Identifies complementary items (e.g., lens with camera body, belt with trousers) and displays discounted bundle offers dynamically.
- **Sub-50ms Margin-Guarded Pricing**: Adjusts promotional discounts based on buyer loyalty segment without compromising profit margins.
    `,
    keywords: ['Retail Personalization', 'AI Product Recommendations', 'Dynamic Merchandising'],
  },
  {
    id: 'reducing-cart-abandonment-with-ai',
    title: 'Reducing Cart Abandonment with AI',
    readTime: '6 min read',
    excerpt: 'Automating instant conversational support on WhatsApp and email to convert hesitating shoppers before they exit.',
    content: `
### Why Shoppers Abandon Carts (70% Global Average)
Common triggers include unexpected shipping costs, unanswered product questions, complicated checkouts, or lack of local payment options.

### Autonomous Recovery Workflows
- **Proactive AI Interventions**: Detects exit intent or high cart idle times to offer instant sizing assistance or localized shipping estimates.
- **Conversational WhatsApp Recovery**: Sends interactive 1-click buy messages on WhatsApp with personal discounts instead of generic marketing emails.
- **Instant Frictionless Checkout**: Provides 1-click payment links directly inside chat windows.
    `,
    keywords: ['Reduce Cart Abandonment', 'WhatsApp Commerce Recovery', 'Exit Intent AI'],
  },
  {
    id: 'ai-inventory-visibility-across-stores',
    title: 'AI Inventory Visibility Across Stores',
    readTime: '5 min read',
    excerpt: 'Empowering customers and store associates with accurate, real-time stock lookup across regional warehouses and physical outlets.',
    content: `
### Inventory Transparency as a Competitive Edge
When shoppers can verify that an item is in stock at their nearest store before making the drive, foot traffic and conversion rates increase dramatically.

### Key Capabilities
- **Geo-Located Store Lookup**: Displays exact aisle and store stock for shoppers based on current GPS location.
- **Predictive Reordering for Managers**: Alerts inventory managers to impending stockouts before items run dry during peak shopping seasons.
- **Fulfillment Optimization**: Route orders from the optimal store or distribution center to minimize shipping cost and delivery duration.
    `,
    keywords: ['Retail Inventory Visibility', 'Store Stock Search AI', 'Inventory Intelligence'],
  },
  {
    id: 'conversational-commerce-for-retail',
    title: 'Conversational Commerce for Retail',
    readTime: '6 min read',
    excerpt: 'Turning social channels and messaging apps like WhatsApp, Instagram, and iMessage into high-converting sales channels.',
    content: `
### Commerce Moves to Messaging
Over 2 billion consumers engage daily on WhatsApp and social platforms. Retailers offering direct purchase options within chat enjoy 4x higher open rates than traditional email campaigns.

### SilarAI Conversational Engine
- **Multi-Channel Chatbot Sync**: Deploys a unified AI agent across website chat widgets, WhatsApp Business, and Instagram Direct Messages.
- **Catalog In-Chat Browsing**: Allows customers to view swipeable catalog carousels, check product specs, and check out without leaving the messaging app.
- **Automated Order Tracking**: Answers "Where is my order?" inquiries instantly using real-time carrier API integrations.
    `,
    keywords: ['Conversational Commerce for Retail', 'WhatsApp Retail Bot', 'Instagram Shopping AI'],
  },
  {
    id: 'ai-loyalty-programs',
    title: 'AI Loyalty Programs for Retailers',
    readTime: '5 min read',
    excerpt: 'Creating intelligent reward structures that increase customer lifetime value (LTV) and drive repeat purchases.',
    content: `
### Beyond Flat Point Systems
Traditional loyalty programs often fail to re-engage casual buyers. AI-driven loyalty platforms personalize tier unlocks, reward offerings, and re-engagement timing.

### Personalized Retention Strategies
- **Predictive Replenishment Alerts**: Reminds customers to reorder consumable goods (skincare, coffee beans, vitamins) based on average consumption cycles.
- **Dynamic Reward Redemption**: Offers personalized perks (e.g., free express shipping on favorite brands) to maximize repeat buyer satisfaction.
- **VIP VIP Concierge Access**: Provides top-tier loyalty members with exclusive AI personal shopper consultations.
    `,
    keywords: ['Customer Loyalty Solutions', 'Retail LTV Optimization', 'AI Loyalty Platform'],
  },
  {
    id: 'retail-customer-experience-trends',
    title: 'Retail Customer Experience Trends',
    readTime: '7 min read',
    excerpt: 'Top customer experience innovations shaping the future of retail commerce in 2026 and beyond.',
    content: `
### The New Benchmarks in Retail CX
- **Instant Speed**: Customers expect sub-second search results and instantaneous answers to product queries.
- **Hyper-Localized Merchandising**: Stores adjust regional product curation based on local weather forecasts and trending social events.
- **AI-Guided In-Store Kiosks**: Digital touchscreens inside physical retail outlets allow shoppers to scan tags and check online inventory variants.
- **Zero-Friction Returns**: AI automates return label generation and instant store drop-off verification.
    `,
    keywords: ['Retail Customer Experience Trends', 'Digital Retail Platform', 'Future Retail CX'],
  },
  {
    id: 'future-of-ai-in-retail-commerce',
    title: 'Future of AI in Retail Commerce',
    readTime: '8 min read',
    excerpt: 'How autonomous agentic commerce, zero-click reordering, and predictive inventory will redefine retail business models.',
    content: `
### The Horizon of Autonomous Retail
As AI models evolve from passive recommendation tools to autonomous agentic assistants, retail commerce will become hyper-predictive.

### Emerging Technologies
- **Autonomous Agent-to-Agent Shopping**: Personal AI agents acting on behalf of consumers will negotiate discounts and place reorders directly with retail platforms.
- **Spatial 3D & AR Visualizations**: AI models instantly generate 3D room mockups or virtual apparel try-ons on mobile web browsers.
- **Autonomous Supply Chain Merchandising**: Retail catalogs reconfigure inventory pricing and stock transfers dynamically without manual human intervention.
    `,
    keywords: ['Future of AI in Retail Commerce', 'Autonomous Agentic Commerce', 'Enterprise AI Commerce'],
  },
];

export const RetailIndustryPage: React.FC<RetailIndustryPageProps> = ({
  onBackToHome,
  onBookDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'features' | 'sectors' | 'clusters' | 'faqs'>('overview');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('ai-shopping-assistants');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [searchDemoQuery, setSearchDemoQuery] = useState<string>('Running shoes for marathon training');
  const [demoQueryResult, setDemoQueryResult] = useState<string | null>('Showing 12 lightweight cushion marathon shoes with sub-50ms stock availability at nearby stores.');

  const handleSearchDemo = (q: string) => {
    setSearchDemoQuery(q);
    if (q.toLowerCase().includes('chair')) {
      setDemoQueryResult('Found 8 ergonomic mesh office chairs with adjustable lumbar support under $300 (In Stock & Available for Free 2-Day Delivery).');
    } else if (q.toLowerCase().includes('kitchen') || q.toLowerCase().includes('eco')) {
      setDemoQueryResult('Found 15 zero-waste bamboo and stainless steel kitchenware items with 20% bundle discount.');
    } else if (q.toLowerCase().includes('gift') || q.toLowerCase().includes('teenager')) {
      setDemoQueryResult('Curated top 10 trending wireless audio gear and apparel items highly rated by 14-19 age demographic.');
    } else {
      setDemoQueryResult(`Semantic AI search results for "${q}": 12 top-matching retail items retrieved with real-time store availability.`);
    }
  };

  const currentArticle = RETAIL_CLUSTER_ARTICLES.find((a) => a.id === selectedClusterId) || RETAIL_CLUSTER_ARTICLES[0];

  const RETAIL_SECTORS = [
    { name: 'Fashion & Apparel', icon: Shirt, desc: 'Style advice, size estimation, and seasonal trend recommendations.' },
    { name: 'Consumer Electronics', icon: Tv, desc: 'Technical spec comparisons, compatibility checks, and warranty upsells.' },
    { name: 'Grocery & Supermarkets', icon: Utensils, desc: 'Recipe-based cart building, dietary filters, and recurring reorders.' },
    { name: 'Home & Furniture', icon: Armchair, desc: 'Room dimension checks, color palette suggestions, and Click & Collect.' },
    { name: 'Beauty & Cosmetics', icon: Sparkle, desc: 'Skincare routine quizzes, shade matching, and subscription checkouts.' },
    { name: 'Sports & Outdoor', icon: Dumbbell, desc: 'Gear advice based on activity type, weather conditions, and sizing.' },
    { name: 'Jewellery & Luxury', icon: Gem, desc: 'VIP concierge chat, custom ring builders, and insured shipping tracking.' },
    { name: 'Automotive Accessories', icon: Car, desc: 'Vehicle model fitment checks, installation guides, and store stock lookup.' },
    { name: 'Books & Stationery', icon: Book, desc: 'Genre preferences, author recommendation graphs, and bundle offers.' },
    { name: 'Pet Supplies', icon: Dog, desc: 'Pet age & breed nutrition suggestions and automated auto-ship replenishment.' },
    { name: 'Toys & Games', icon: Gamepad2, desc: 'Age-appropriate gift finders and trending holiday item inventory alerts.' },
    { name: 'Department Stores', icon: Building, desc: 'Multi-category unified shopping cart and store branch stock locator.' },
  ];

  const RETAIL_FAQS = [
    {
      q: 'What is AI Commerce for retail?',
      a: 'AI Commerce uses artificial intelligence to improve retail shopping experiences through conversational shopping assistants, intelligent product search, personalized recommendations, omnichannel engagement, and customer support automation. It helps retailers increase sales while improving customer satisfaction.',
    },
    {
      q: 'How does an AI Shopping Assistant help retailers?',
      a: 'An AI Shopping Assistant helps customers discover products, compare options, check inventory, receive personalized recommendations, answer shopping questions, and complete purchases using natural language conversations.',
    },
    {
      q: 'Can SilarAI integrate with existing retail systems?',
      a: 'Yes. SilarAI integrates with ecommerce platforms (Shopify, WooCommerce, Custom APIs), ERP systems, POS software, CRM platforms, inventory systems, loyalty platforms, and payment gateways, allowing retailers to enhance existing operations without replacing their technology stack.',
    },
    {
      q: 'How does AI improve retail product discovery?',
      a: 'AI understands customer intent instead of relying only on keyword matching. Shoppers can describe their needs in natural language (e.g., "Running shoes for marathon training" or "Eco-friendly kitchen products"), enabling the platform to recommend the most relevant products quickly and accurately.',
    },
    {
      q: 'Is SilarAI suitable for omnichannel retail?',
      a: 'Yes. SilarAI is built for omnichannel retailers, enabling consistent AI-powered shopping experiences across websites, mobile applications, physical stores, customer portals, and messaging channels like WhatsApp.',
    },
    {
      q: 'Which retail sectors benefit from SilarAI?',
      a: 'SilarAI supports retailers in fashion, electronics, grocery, beauty, furniture, sports, jewellery, books, toys, automotive accessories, pet products, and department stores.',
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
                '@id': 'https://silarai.com/?page=retail-commerce#webpage',
                url: 'https://silarai.com/?page=retail-commerce',
                name: 'AI Commerce Platform for Retail',
                description:
                  'SilarAI Commerce AI is an enterprise AI commerce platform designed for modern retailers. It combines AI Shopping Assistants, omnichannel commerce, intelligent product search, personalized recommendations, real-time inventory visibility, and customer engagement to help retailers increase conversions, improve shopping experiences, and streamline operations. The platform integrates with ecommerce, ERP, POS, CRM, and loyalty systems, enabling retailers to deliver consistent AI-powered experiences across online and physical channels.',
              },
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI Retail Commerce AI Platform',
                operatingSystem: 'Cloud Native / Web / Headless API',
                applicationCategory: 'BusinessApplication',
                description:
                  'Enterprise AI Commerce Platform for Retail featuring AI Shopping Assistants, Omnichannel Commerce, Intelligent Product Search, and Real-Time Inventory Search.',
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.9',
                  ratingCount: '184',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Commerce Platform for Retail',
                provider: {
                  '@type': 'Organization',
                  name: 'SilarAI Technologies',
                  url: 'https://silarai.com',
                },
                areaServed: 'Worldwide',
                serviceType: 'Omnichannel Retail AI Commerce Solutions',
              },
              {
                '@type': 'FAQPage',
                mainEntity: RETAIL_FAQS.map((faq) => ({
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
                  { '@type': 'ListItem', position: 3, name: 'Retail Commerce AI', item: 'https://silarai.com/?page=retail-commerce' },
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
              className="hover:text-peach-300 transition-colors flex items-center gap-1 font-semibold"
            >
              ← Back to Home
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-medium">Industry Solutions</span>
            <span className="text-slate-600">/</span>
            <span className="text-peach-300 font-extrabold flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              Retail Commerce AI Platform
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-plum-800 text-peach-200 px-2.5 py-0.5 rounded-full font-bold border border-plum-700">
              Enterprise Retail Specification v2.4
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section & Executive Summary Callout */}
      <section className="relative pt-12 pb-20 bg-gradient-to-b from-plum-950 via-plum-900 to-slate-900 text-white overflow-hidden">
        {/* Background Decorative Accent Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-peach-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-800/80 border border-peach-300/40 text-peach-300 text-xs font-black uppercase tracking-wider">
                <Store className="w-4 h-4 text-peach-300" />
                <span>Retail Industry Solution Pillar</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                AI Commerce Platform for Retail
              </h1>

              <h2 className="text-xl sm:text-2xl font-extrabold text-peach-300">
                Transform Retail with AI-Powered Commerce
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Modern retail is no longer just about selling products. Customers expect personalized shopping experiences, real-time inventory visibility, intelligent product recommendations, and seamless interactions across physical stores, ecommerce websites, mobile apps, and social commerce.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                SilarAI Commerce AI helps retailers deliver AI-powered shopping experiences through conversational commerce, AI Shopping Assistants, intelligent product discovery, omnichannel engagement, and enterprise commerce automation. Whether you operate a single retail brand or a nationwide chain, SilarAI enables your customers to find products faster and complete purchases with confidence.
              </p>

              {/* Call to Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onBookDemo('Retail AI Commerce')}
                  className="px-6 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-lg hover:shadow-peach-300/20 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Book a Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('retail-cluster-hub');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-plum-800/90 hover:bg-plum-800 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-peach-300" />
                  <span>See Retail AI in Action</span>
                </button>
              </div>

              {/* Verified Metrics Badge Bar */}
              <div className="pt-6 border-t border-plum-800/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">+380%</div>
                  <div className="text-xs text-slate-400 font-medium">Conversion Lift</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">-45%</div>
                  <div className="text-xs text-slate-400 font-medium">Support Operating Costs</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-peach-300">99.8%</div>
                  <div className="text-xs text-slate-400 font-medium">Real-Time Inventory Accuracy</div>
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
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Live Retail Intent Simulator</h3>
                    <p className="text-[10px] text-slate-500">Test SilarAI Semantic Product Discovery</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online AI Engine
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Type or click a natural language retail intent query:</label>
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
                    'Running shoes for marathon training',
                    'Office chair under $300',
                    'Eco-friendly kitchen products',
                    'Birthday gifts for teenagers',
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
                    <span>AI Intent Resolution (<span className="text-emerald-600 font-bold">42ms latency</span>)</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    {demoQueryResult}
                  </p>
                  <div className="pt-2 border-t border-plum-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Store Availability: <strong className="text-slate-800 font-bold">4 local branches</strong></span>
                    <span className="text-plum-700 font-bold">BOPIS Ready</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Integrated with Shopify, POS, ERP &amp; WhatsApp</span>
                <a href="#retail-features" className="text-plum-700 font-bold hover:underline">View Features ↓</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Navigation Sticky Bar for Retail Page Sections */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-3">
          {[
            { id: 'overview', label: 'Why Retail AI' },
            { id: 'challenges', label: 'Challenges & Solutions' },
            { id: 'features', label: 'Platform Features' },
            { id: 'sectors', label: 'Industries Served (12)' },
            { id: 'clusters', label: 'Content Hub & Articles (10)' },
            { id: 'faqs', label: 'Retail FAQs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                const el = document.getElementById(`retail-${tab.id}`);
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

      {/* Section 1: Why Retailers Need AI Commerce */}
      <section id="retail-overview" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              The Retail Evolution
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Why Retailers Need AI Commerce
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Today's shoppers expect instant answers, personalized recommendations, and a consistent shopping experience across every touchpoint. Traditional retail systems often struggle with fragmented inventory, disconnected channels, slow customer support, and generic product discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Instant Intent Answers</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Shoppers refuse to wade through 40 pages of static product listings. AI Shopping Assistants match intent to exact SKUs in milliseconds.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Unified Stores &amp; Online</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bridges physical point-of-sale inventory with online storefronts, enabling real-time store pickup, inventory visibility, and cross-channel returns.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Personalized Engagement</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Adapts product bundles, promotional offers, and loyalty rewards based on individual buying history, maximizing Lifetime Value (LTV).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Challenges Faced by Retailers & How SilarAI Solves Them */}
      <section id="retail-challenges" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Solving Friction Points
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Challenges Faced by Retailers &amp; SilarAI Solutions
            </h2>
            <p className="text-base text-slate-600">
              Transforming traditional retail bottlenecks into high-converting automated workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Challenge 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #1
                </span>
                <span className="text-xs font-bold text-slate-400">Omnichannel</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Omnichannel Complexity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers expect to browse online, purchase through mobile, collect in-store, and return products anywhere. Disconnected systems create friction.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Unified omnichannel commerce engine syncing web, mobile, physical POS, WhatsApp, and store inventory.
                </p>
              </div>
            </div>

            {/* Challenge 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #2
                </span>
                <span className="text-xs font-bold text-slate-400">Discovery</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Poor Product Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retail catalogs continue to grow, making it difficult for customers to find products quickly using traditional keyword search.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Semantic intent search understanding descriptive queries like "breathable marathon running shoes".
                </p>
              </div>
            </div>

            {/* Challenge 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #3
                </span>
                <span className="text-xs font-bold text-slate-400">Inventory</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Inventory Visibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers ask: Is this product available? Which nearby store has stock? Can I collect today? When will it deliver?
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Real-time stock lookup across warehouses and regional retail stores with Click &amp; Collect status.
                </p>
              </div>
            </div>

            {/* Challenge 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #4
                </span>
                <span className="text-xs font-bold text-slate-400">Support</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Customer Service Overload</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Support teams spend hours answering repetitive questions regarding product availability, store locations, delivery, and returns.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  85%+ automated resolution of routine inquiries via AI Customer Support Bot across web and WhatsApp.
                </p>
              </div>
            </div>

            {/* Challenge 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #5
                </span>
                <span className="text-xs font-bold text-slate-400">Experience</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Generic Shopping Experiences</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every shopper receives the same experience despite having different preferences, purchase history, and buying intent.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Personalized Product Recommendations, dynamic bundle offers, and customized promotion alerts.
                </p>
              </div>
            </div>

            {/* Challenge 6 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Challenge #6
                </span>
                <span className="text-xs font-bold text-slate-400">Conversion</span>
              </div>
              <h3 className="text-base font-black text-slate-900">Low Conversion Rates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers abandon shopping journeys when they cannot quickly discover the right products or receive instant answers.
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-black text-plum-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SilarAI Solution</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  Proactive 24/7 AI assistance boosting average conversion rates by +380% with zero friction.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Platform Features & Retail Integrations */}
      <section id="retail-features" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-900 bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-300">
              Complete Feature Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              SilarAI Retail Platform Features
            </h2>
            <p className="text-base text-slate-600">
              Built ground-up for high-volume retail merchants and omnichannel brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Shopping Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide personalized shopping guidance through 24/7 conversational AI in 20+ languages.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI Product Search</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enable semantic intent search that understands exact customer needs rather than exact keyword matches.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Personalized Recommendations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recommend products, bundles, accessories, and premium alternatives to maximize Average Order Value (AOV).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Omnichannel Commerce</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect online stores, physical stores, mobile applications, and social commerce into one unified AI experience.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Inventory Visibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide real-time product availability, aisle lookup, and Click &amp; Collect times across stores.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Customer Support Automation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Handle repetitive customer inquiries regarding orders, returns, refunds, and shipping automatically.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Promotions &amp; Campaigns</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deliver personalized offers and loyalty rewards based on customer behavior and purchase history.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-plum-700 text-peach-300 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Customer Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Understand customer intent, shopping journeys, conversion bottlenecks, and purchasing trends.
              </p>
            </div>
          </div>

          {/* Retail Integrations Bar */}
          <div className="p-6 rounded-2xl bg-plum-950 text-white border border-plum-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-plum-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-peach-300">Seamless Retail Ecosystem Integrations</h3>
                <p className="text-xs text-slate-300">Integrates out-of-the-box with your existing e-commerce, POS, ERP, and payment tech stack.</p>
              </div>
              <span className="text-xs font-extrabold bg-peach-300 text-plum-950 px-3 py-1 rounded-full">
                Zero Tech Stack Overhaul Needed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs font-bold text-slate-200">
              {[
                'Shopify / Plus',
                'WooCommerce',
                'SAP / Oracle ERP',
                'Lightspeed POS',
                'Salesforce CRM',
                'Klaviyo Loyalty',
                'Stripe Payments',
                'Custom APIs',
              ].map((sys, sIdx) => (
                <div key={sIdx} className="bg-plum-900/80 p-2.5 rounded-xl border border-plum-700/80 flex items-center justify-center text-center">
                  <span>{sys}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Industries Served (12 Retail Sub-Sectors) */}
      <section id="retail-sectors" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Sub-Sectors Covered
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Retail Industries Served
            </h2>
            <p className="text-base text-slate-600">
              SilarAI Commerce AI supports specialized retail merchants across diverse product verticals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RETAIL_SECTORS.map((sector, idx) => {
              const IconComp = sector.icon;
              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center shrink-0 font-bold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{sector.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sector.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Content Cluster Strategy Hub (10 Supporting Articles) */}
      <section id="retail-clusters" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Topical Authority &amp; Knowledge Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Retail AI Content Cluster &amp; Insights
            </h2>
            <p className="text-base text-slate-600">
              Explore 10 supporting articles and strategic guides linking directly into SilarAI Retail Pillar capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cluster Article Selector List (Left 4 cols) */}
            <div className="lg:col-span-4 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-[600px] overflow-y-auto">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider px-2 pb-2 border-b border-slate-200">
                10 Retail Pillar Articles
              </div>
              {RETAIL_CLUSTER_ARTICLES.map((art, aIdx) => (
                <button
                  key={art.id}
                  onClick={() => setSelectedClusterId(art.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between group cursor-pointer ${
                    selectedClusterId === art.id
                      ? 'bg-plum-950 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold leading-snug">{art.title}</div>
                    <div className={`text-[10px] mt-1 ${selectedClusterId === art.id ? 'text-peach-300' : 'text-slate-400'}`}>
                      {art.readTime}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${selectedClusterId === art.id ? 'text-peach-300' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>

            {/* Cluster Article Display Reader (Right 8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <span className="text-xs font-black uppercase bg-plum-800 text-peach-300 px-3 py-1 rounded-full border border-plum-700">
                  Article #{RETAIL_CLUSTER_ARTICLES.findIndex((a) => a.id === currentArticle.id) + 1} of 10
                </span>
                <span className="text-xs text-slate-400 font-medium">{currentArticle.readTime}</span>
              </div>

              <h3 className="text-2xl font-black text-white">{currentArticle.title}</h3>

              <div className="p-4 rounded-xl bg-plum-950/80 border border-plum-800 text-peach-200 text-xs font-semibold leading-relaxed">
                "{currentArticle.excerpt}"
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4 font-normal">
                {currentArticle.content.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('###')) {
                    return (
                      <h4 key={pIdx} className="text-base font-bold text-peach-300 pt-2">
                        {paragraph.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={pIdx} className="list-disc pl-5 space-y-1 text-slate-300">
                        {paragraph.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={pIdx}>{paragraph}</p>;
                })}
              </div>

              {/* Article Footer Action */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onBookDemo(`Retail Cluster - ${currentArticle.title}`)}
                  className="px-4 py-2 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Request Retail Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Section 6: Frequently Asked Questions */}
      <section id="retail-faqs" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Frequently Asked Questions (Retail AI Commerce)
            </h2>
            <p className="text-sm text-slate-600">
              Direct answers designed for AI Search engines (Perplexity, ChatGPT, Gemini, Google SGE) and retail leaders.
            </p>
          </div>

          <div className="space-y-3">
            {RETAIL_FAQS.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setActiveFaqIndex(activeFaqIndex === fIdx ? null : fIdx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <span className="text-sm sm:text-base font-black text-slate-900">{faq.q}</span>
                  {activeFaqIndex === fIdx ? (
                    <ChevronUp className="w-5 h-5 text-plum-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {activeFaqIndex === fIdx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Conversion CTA */}
      <section className="py-16 bg-gradient-to-r from-plum-950 via-plum-900 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-black uppercase tracking-widest text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full inline-block">
            Accelerate Your Retail AI Transformation
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Elevate Your Retail Shopping Experience?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Book a personalized retail demonstration to see how SilarAI integrates with your ecommerce storefront, POS, and inventory backbones.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => onBookDemo('Retail AI Commerce')}
              className="px-8 py-4 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToHome}
              className="px-8 py-4 bg-plum-800/90 hover:bg-plum-800 text-white font-bold text-sm rounded-xl border border-plum-600 transition-all cursor-pointer"
            >
              Explore All Industries
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
