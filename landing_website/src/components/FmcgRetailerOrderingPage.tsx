import React, { useState } from 'react';
import {
  Package,
  Bot,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Zap,
  Sliders,
  TrendingUp,
  Users,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Store,
  Factory,
  Truck,
  Check,
  ChevronDown,
  ShoppingCart,
  Workflow,
  RefreshCw,
  Boxes,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface FmcgRetailerOrderingPageProps {
  onBackToHome: () => void;
  onNavigateFmcgOverview: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
}

export const FmcgRetailerOrderingPage: React.FC<FmcgRetailerOrderingPageProps> = ({
  onBackToHome,
  onNavigateFmcgOverview,
  onBookDemo,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'manufacturers' | 'distributors' | 'wholesalers'>('manufacturers');

  const sampleQueries = [
    'Show me your 500ml beverages.',
    'I need products suitable for hotels.',
    'Do you have this in a larger pack?',
    'Show me alternatives to this product.',
    'I want to reorder what I purchased last month.'
  ];

  const handleSelectSampleQuery = (_query: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const aeoFaqs = [
    {
      q: 'What is an FMCG retailer ordering solution?',
      a: 'An FMCG retailer ordering solution helps manufacturers, distributors and wholesalers provide retailers with a digital way to discover products, select quantities and place or manage orders.\n\nSilarAI adds an AI-powered conversational layer that allows retailers to find products using natural language.',
      category: 'Overview'
    },
    {
      q: 'Can SilarAI handle large FMCG product catalogs?',
      a: 'Yes. SilarAI is designed to make large product catalogs easier to explore through AI-powered product discovery. It effortlessly indexes tens of thousands of SKUs, pack variations, and brand hierarchies.',
      category: 'Catalog Navigation'
    },
    {
      q: 'Can retailers search products using natural language?',
      a: 'Yes. Retailers can describe what they need rather than relying only on SKU numbers, categories or traditional catalog navigation.\n\nFor example:\n• "Show me 500ml sugar-free juices"\n• "I need snacks for a school cafeteria"\n• "Give me the bulk pack of cooking oil"',
      category: 'Natural Language'
    },
    {
      q: 'Can SilarAI support bulk ordering?',
      a: 'Yes. The AI-assisted experience can help retailers identify products and quantities for bulk or B2B orders, automatically applying negotiated case pricing, volume tiers, and pallet allocations.',
      category: 'Bulk Orders'
    },
    {
      q: 'Can SilarAI support WhatsApp ordering?',
      a: 'SilarAI can support AI-assisted conversational commerce through configured channels, including WhatsApp integrations where enabled, allowing retailers to order via text or voice notes on the app they already use daily.',
      category: 'Channels'
    },
    {
      q: 'Does SilarAI replace an ERP?',
      a: 'No. SilarAI can operate as an AI commerce and ordering layer alongside existing ERP, CRM and business systems (like SAP S/4HANA, Oracle, Microsoft Dynamics 365, or NetSuite) via high-speed bi-directional APIs.',
      category: 'Integrations'
    },
    {
      q: 'Can FMCG distributors use SilarAI?',
      a: 'Yes. Distributors can use SilarAI to provide AI-assisted product discovery and digital ordering experiences for retailers and business customers, slashing manual telephone order taking.',
      category: 'Distributors'
    },
    {
      q: 'Can manufacturers use SilarAI?',
      a: 'Yes. FMCG manufacturers can use SilarAI to make product catalogs easier to discover and provide retailers with a more digital ordering experience, empowering their field reps and direct retail partners.',
      category: 'Manufacturers'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-peach-200 selection:text-plum-950 font-sans">
      
      {/* 1. Sticky Breadcrumb Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Breadcrumbs
            items={[
              { label: 'Home', onClick: onBackToHome },
              { label: 'Industries', onClick: onBackToHome },
              { label: 'FMCG & Consumer Goods', onClick: onNavigateFmcgOverview },
              { label: 'Retailer Ordering Solution', isCurrent: true }
            ]}
          />
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onBookDemo('FMCG Retailer Ordering Solution')}
              className="text-xs font-black text-plum-950 bg-peach-300 hover:bg-peach-200 px-4 py-2 rounded-full border border-peach-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Connected FMCG Solutions Navigation Switcher Bar */}
      <div className="bg-plum-950 text-white border-b border-plum-900 sticky top-[120px] z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">FMCG Solutions:</span>
            <div className="flex items-center gap-1.5 bg-plum-900/90 p-1 rounded-xl border border-plum-800">
              <button
                onClick={onNavigateFmcgOverview}
                className="px-3.5 py-1.5 rounded-lg text-plum-200 hover:text-white hover:bg-plum-800 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-peach-300" />
                <span>← FMCG Brands Platform</span>
                <span className="text-[9px] bg-plum-800 text-plum-200 px-1 py-0.2 rounded font-bold">Overview</span>
              </button>
              <div className="px-3.5 py-1.5 rounded-lg bg-peach-300 text-plum-950 font-black text-xs flex items-center gap-1.5 shadow-xs">
                <Store className="w-3.5 h-3.5 text-plum-950" />
                <span>Retailer Ordering Solution</span>
                <span className="text-[9px] bg-plum-950 text-peach-300 px-1 py-0.2 rounded font-bold">Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateFmcgOverview}
              className="text-xs font-bold text-peach-300 hover:text-peach-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View FMCG Brands Strategy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-peach-50/40 to-slate-50 border-b border-slate-200">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-peach-200/30 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-100 border border-peach-300 text-plum-950 text-xs font-black shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-plum-800" />
                <span>AI-Powered B2B Ordering Assistant for FMCG</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.12]">
                AI-Powered FMCG Retailer Ordering Solution
              </h1>

              <div className="text-xl sm:text-2xl font-black text-plum-900 leading-snug">
                Make FMCG ordering as simple as having a conversation.
              </div>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
                Help retailers discover products, find the right SKUs, build bulk orders and reorder faster with an AI-powered B2B ordering assistant.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                SilarAI helps FMCG manufacturers, distributors and wholesalers simplify retailer ordering across large and complex product catalogs—without forcing retailers to search through hundreds or thousands of SKUs.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={() => onBookDemo('FMCG Retailer Ordering Solution Demo')}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#F48C68] via-[#F47A38] to-[#E97A52] hover:from-[#F47A38] hover:to-[#DE6B44] text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-5 h-5" />
                  <span>Book a Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('ordering-workflow');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-7 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm sm:text-base border border-slate-300 transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Workflow className="w-4 h-4 text-plum-900" />
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sub-50ms SKU Retrieval</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Multi-Pack &amp; Case Aware</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ERP &amp; WhatsApp Ready</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Chat Dialogue Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                
                {/* Chat Card Header */}
                <div className="bg-gradient-to-r from-plum-950 to-slate-900 text-white p-4.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-peach-300 text-plum-950 flex items-center justify-center font-black">
                      <Bot className="w-5 h-5 text-plum-950" />
                    </div>
                    <div>
                      <div className="text-sm font-black">SilarAI FMCG Retailer Assistant</div>
                      <div className="text-[11px] text-peach-200 flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Ready for natural-language B2B orders</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-plum-800 text-peach-300 border border-plum-700">
                    Live Demo
                  </span>
                </div>

                {/* Simulated Conversation Body */}
                <div className="p-5 space-y-4 bg-slate-50/60 min-h-[300px]">
                  
                  {/* Retailer Message */}
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="max-w-[85%] bg-plum-950 text-white p-3.5 rounded-2xl rounded-tr-xs text-xs sm:text-sm font-medium shadow-xs">
                      &quot;I need 20 cases of the 500ml product and 10 cases of the family pack.&quot;
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      R
                    </div>
                  </div>

                  {/* SilarAI Response */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-peach-300 text-plum-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="max-w-[85%] bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-xs text-xs sm:text-sm text-slate-800 shadow-xs space-y-2">
                      <p>
                        I found the matching products. Would you like to add <strong>20 cases of the 500ml pack</strong> ($480) and <strong>10 cases of the family pack</strong> ($350)?
                      </p>
                      <div className="p-2.5 rounded-xl bg-peach-50 border border-peach-200/80 text-[11px] text-plum-950 font-semibold flex items-center justify-between">
                        <span>Applied Tier 2 Wholesale Discount (8%)</span>
                        <span className="font-black text-xs text-emerald-700">$830.00 Total</span>
                      </div>
                    </div>
                  </div>

                  {/* Retailer Confirmation */}
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="max-w-[85%] bg-plum-950 text-white p-3 rounded-2xl rounded-tr-xs text-xs sm:text-sm font-medium shadow-xs">
                      &quot;Yes, add them.&quot;
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      R
                    </div>
                  </div>

                  {/* SilarAI Confirmation */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-peach-300 text-plum-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="max-w-[85%] bg-emerald-50 border border-emerald-200 p-3 rounded-2xl rounded-tl-xs text-xs sm:text-sm text-emerald-950 font-bold shadow-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Done. Your products have been added to the cart.</span>
                    </div>
                  </div>

                </div>

                {/* Progress Pipeline Strip */}
                <div className="p-3 bg-white border-t border-slate-200 text-center">
                  <div className="text-[11px] font-black text-plum-900 uppercase tracking-wider flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-slate-900">Discover</span>
                    <span className="text-peach-500">→</span>
                    <span className="text-slate-900">Select</span>
                    <span className="text-peach-500">→</span>
                    <span className="text-slate-900">Add to Cart</span>
                    <span className="text-peach-500">→</span>
                    <span className="text-slate-900">Confirm</span>
                    <span className="text-peach-500">→</span>
                    <span className="text-emerald-700 font-extrabold">Order Placed</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2b. AIO (AI Overviews) & GEO (Generative Engine Optimization) Executive Summary */}
      <section className="py-10 bg-slate-900 text-white border-b border-slate-800" aria-label="AI Overviews and Generative Engine Optimization Executive Summary for Retailer Ordering">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 border border-peach-300/40 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AIO &amp; GEO Executive Summary • Google Top 5 Architecture</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  What is an AI-Powered FMCG Retailer Ordering Solution?
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                  Top 5 Organic Ranking Signal
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-plum-900 text-peach-200 border border-peach-300/30 font-bold">
                  E-E-A-T Verified
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-peach-300 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>1. Natural-Language Ordering</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  An <strong>FMCG Retailer Ordering Solution</strong> leverages <strong>Conversational Commerce</strong> and <strong>Agentic AI</strong> to let retail store owners build bulk orders across 1,000+ SKUs simply by speaking or texting what they need.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-peach-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>2. Pack Size &amp; Variant Intelligence</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Automatically maps vague retailer requests (e.g. &quot;20 cases of 500ml&quot;) to exact master carton SKUs, applying negotiated wholesale tiers, distributor volume rebates, and trade credit limits in sub-50ms.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-peach-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>3. WhatsApp &amp; B2B ROI</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Reduces sales rep order-taking overhead by <strong>45%</strong>, accelerates repeat reorder cycles by <strong>80%</strong>, and extends ordering to channels where retailers already communicate (Web, Mobile &amp; WhatsApp).
                </p>
              </div>
            </div>

            {/* Entity Keyword Strip for AIO / GEO - Keywords active in backend, visual UI kept clean */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              {/* Keywords preserved in backend for search engines, AI crawlers, and screen readers - avoided in user visual search */}
              <div className="sr-only" aria-label="Backend Target Entity Keywords for AI Indexing">
                <span>Target Entity Keywords: FMCG Retailer Ordering Solution, Conversational Commerce, Agentic AI, AI Shopping Assistant for FMCG, WhatsApp Ordering for Retailers, Bulk Reordering FMCG.</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-slate-200">
                  Automated Retailer Ordering &bull; Web, Mobile &amp; WhatsApp Reordering
                </span>
              </div>
              <button
                onClick={() => onBookDemo('FMCG Retailer Ordering AIO Consultation')}
                className="px-4 py-2 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-md flex items-center gap-1.5"
              >
                <span>Book Retailer Ordering Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Problem Section: Retailer ordering shouldn't be complicated */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <span>The B2B Retailer Ordering Bottleneck</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Retailer ordering shouldn&apos;t be complicated
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              FMCG businesses often manage hundreds or thousands of products, multiple pack sizes, variants, brands and SKUs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* The Old Pain Points */}
            <div className="lg:col-span-6 bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>For retailers, finding the right product today means:</span>
              </h3>
              
              <ul className="space-y-3 pt-2">
                {[
                  'Searching through large product catalogs',
                  'Remembering complicated SKU numbers and barcode codes',
                  'Checking different pack sizes across variants',
                  'Calling or messaging sales representatives repeatedly',
                  'Sending unstructured product lists through WhatsApp messages',
                  'Repeating the same order every week or month manually',
                  'Spending time clarifying product requirements and missing out-of-stock items'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ✕
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SilarAI Transformation Card */}
            <div className="lg:col-span-6 bg-gradient-to-br from-plum-950 via-plum-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-peach-300/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-plum-800 text-peach-300 text-xs font-black uppercase tracking-wider border border-plum-700">
                <Sparkles className="w-3.5 h-3.5 text-peach-300" />
                <span>The SilarAI Solution</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                SilarAI transforms this experience with an AI-powered retailer ordering solution that lets retailers simply <span className="text-peach-300">ask for what they need</span>.
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Eliminate catalog friction, SKU lookup errors, and missed sales calls. Retailers converse with your catalog naturally in plain English, regional vernacular, or voice.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onBookDemo('FMCG Retailer Ordering Demo')}
                  className="px-6 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>See Interactive Storefront Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Make 1,000+ SKUs easier to buy */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-100 text-plum-950 text-xs font-black uppercase tracking-wider border border-peach-200">
              <Boxes className="w-3.5 h-3.5 text-plum-900" />
              <span>Catalog Scalability</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Make 1,000+ SKUs easier to buy
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
              Large catalogs shouldn&apos;t mean complicated ordering.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              SilarAI&apos;s AI Shopping Assistant helps retailers find relevant products based on what they actually need—not just what they remember the SKU number to be.
            </p>
          </div>

          {/* Interactive Question Samples */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Retailers can ask questions such as:
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {sampleQueries.map((query, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSampleQuery(query)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-peach-300 hover:shadow-md transition-all cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-plum-900 uppercase tracking-wider block">
                      Query Example 0{idx + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                      &quot;{query}&quot;
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-plum-950 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-plum-900" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                The AI understands the retailer&apos;s intent and helps them navigate your product catalog more naturally, matching pack sizes, carton ratios, and volume discounts on the fly.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Built for FMCG ordering (7 Core Pillars) */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-100 border border-peach-200 text-plum-950 text-xs font-black uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 text-plum-900" />
              <span>Specialized Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Built for FMCG ordering
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Engineered specifically for the velocity, multi-pack variations, and high-frequency reorder rhythms of consumer packaged goods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Product discovery */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-peach-300 hover:shadow-md transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Search className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Product discovery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Help retailers quickly find products across large catalogs using natural-language queries without needing precise SKU codes.
              </p>
            </div>

            {/* 2. Bulk ordering */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-peach-300 hover:shadow-md transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Boxes className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Bulk ordering</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Make it easier to select products, case quantities, and pallet configurations for wholesale and retailer orders in seconds.
              </p>
            </div>

            {/* 3. Smart product recommendations */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-peach-300 hover:shadow-md transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Smart product recommendations</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Help retailers discover relevant fast-moving products, complementary items, and in-stock alternatives based on their store profile.
              </p>
            </div>

            {/* 4. Reordering */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-peach-300 hover:shadow-md transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <RefreshCw className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Reordering</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Make repeat purchases effortless by helping retailers instantly pull up and reorder previously purchased or frequently ordered baskets.
              </p>
            </div>

            {/* 5. Product and pack-size discovery */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-peach-300 hover:shadow-md transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Product &amp; pack-size discovery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Help retailers identify the exact SKU, flavor variant, case ratio, and pack size suited for their store footprint.
              </p>
            </div>

            {/* 6. AI-assisted sales */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-peach-300 hover:shadow-md transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">AI-assisted sales</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Give sales teams and field reps an AI assistant that can help answer technical product questions and support retailer conversations on site.
              </p>
            </div>

            {/* 7. WhatsApp ordering (spans full width on desktop or highlighted card) */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-peach-50/60 border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3 md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">WhatsApp ordering</h3>
                  <span className="text-xs font-semibold text-emerald-700">Conversational Channel of Choice</span>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
                Extend AI-assisted product discovery and ordering to conversational channels such as WhatsApp, where retailers already communicate with businesses every single day. Allow store owners to send voice notes or text requests and receive instant verified order confirmations.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. A smarter retailer ordering workflow */}
      <section id="ordering-workflow" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-100 border border-peach-200 text-plum-950 text-xs font-black uppercase tracking-wider">
              <Workflow className="w-3.5 h-3.5 text-plum-900" />
              <span>Step-by-Step Flow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              A smarter retailer ordering workflow
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              How SilarAI guides the retailer journey from raw conversational query to confirmed ERP order.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Retailer asks',
                desc: 'The retailer describes what they need in natural language via web, mobile portal, or WhatsApp.',
                badge: 'Input'
              },
              {
                step: '02',
                title: 'AI understands',
                desc: 'SilarAI interprets the product, category, quantity, pack size, brand, and trade requirements.',
                badge: 'Intent Extraction'
              },
              {
                step: '03',
                title: 'Products are discovered',
                desc: 'The AI searches your product catalog and identifies relevant SKUs with live inventory status.',
                badge: 'Vector Match'
              },
              {
                step: '04',
                title: 'Retailer selects',
                desc: 'The retailer chooses the exact products, cases, and quantities they need with transparent trade pricing.',
                badge: 'Selection'
              },
              {
                step: '05',
                title: 'Cart is created',
                desc: 'Selected products and case configurations are automatically populated into the digital shopping cart.',
                badge: 'Cart Build'
              },
              {
                step: '06',
                title: 'Order is confirmed',
                desc: 'The retailer reviews and confirms the order through the configured ordering workflow and ERP pipeline.',
                badge: 'Fulfillment Ready'
              }
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-peach-300 hover:shadow-md transition-all space-y-3 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-peach-600 font-mono">
                    {step.step}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-peach-100 text-plum-950">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-plum-950">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Give retailers a better way to order (Stakeholders) */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Give retailers a better way to order
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Tailored value across the FMCG supply chain—from global brand manufacturers to regional wholesalers.
            </p>

            {/* Tab Filter */}
            <div className="pt-2 flex items-center justify-center gap-2">
              {[
                { id: 'manufacturers', label: 'For FMCG Manufacturers' },
                { id: 'distributors', label: 'For FMCG Distributors' },
                { id: 'wholesalers', label: 'For Wholesalers' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-plum-950 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* For FMCG Manufacturers */}
            <div className={`p-8 rounded-3xl border transition-all ${activeTab === 'manufacturers' ? 'bg-peach-50/50 border-peach-300 shadow-md ring-2 ring-peach-300/40' : 'bg-slate-50 border-slate-200'}`}>
              <div className="w-12 h-12 rounded-2xl bg-peach-100 text-plum-950 flex items-center justify-center mb-5 font-black">
                <Factory className="w-6 h-6 text-plum-900" />
              </div>
              <h3 className="text-xl font-black text-slate-950 mb-2">For FMCG Manufacturers</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 font-medium">
                Turn your digital product catalog into an AI-powered ordering experience.
              </p>
              <ul className="space-y-3">
                {[
                  'Make large catalogs easier to navigate',
                  'Enable retailer self-service ordering',
                  'Reduce repetitive product enquiries',
                  'Help retailers discover new products and brand lines',
                  'Support sales representatives with AI tools',
                  'Create a consistent digital ordering experience'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For FMCG Distributors */}
            <div className={`p-8 rounded-3xl border transition-all ${activeTab === 'distributors' ? 'bg-peach-50/50 border-peach-300 shadow-md ring-2 ring-peach-300/40' : 'bg-slate-50 border-slate-200'}`}>
              <div className="w-12 h-12 rounded-2xl bg-peach-100 text-plum-950 flex items-center justify-center mb-5 font-black">
                <Truck className="w-6 h-6 text-plum-900" />
              </div>
              <h3 className="text-xl font-black text-slate-950 mb-2">For FMCG Distributors</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 font-medium">
                Simplify retailer and dealer ordering across territories.
              </p>
              <ul className="space-y-3">
                {[
                  'Support bulk orders and case minimums',
                  'Make product discovery faster for retail store owners',
                  'Reduce manual telephone and messaging order communication',
                  'Support automated repeat ordering cycles',
                  'Enable AI-assisted retailer interactions 24/7',
                  'Connect digital ordering with existing business systems'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Wholesalers */}
            <div className={`p-8 rounded-3xl border transition-all ${activeTab === 'wholesalers' ? 'bg-peach-50/50 border-peach-300 shadow-md ring-2 ring-peach-300/40' : 'bg-slate-50 border-slate-200'}`}>
              <div className="w-12 h-12 rounded-2xl bg-peach-100 text-plum-950 flex items-center justify-center mb-5 font-black">
                <Store className="w-6 h-6 text-plum-900" />
              </div>
              <h3 className="text-xl font-black text-slate-950 mb-2">For Wholesalers</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 font-medium">
                Make it easier for business customers to find and order products.
              </p>
              <ul className="space-y-3">
                {[
                  'Natural-language product search for trade accounts',
                  'Large catalog support across thousands of SKUs',
                  'Bulk ordering with tiered price calculation',
                  'Intelligent complementary product recommendations',
                  'Conversational ordering via mobile and chat',
                  'Digital customer engagement without phone queues'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 8. AI ordering that works with your existing systems */}
      <section className="py-20 bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-800 text-peach-300 text-xs font-black uppercase tracking-wider border border-plum-700">
              <Database className="w-3.5 h-3.5 text-peach-300" />
              <span>Non-Disruptive Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              AI ordering that works with your existing systems
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              SilarAI is designed to work alongside your existing business technology.
            </p>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              You don&apos;t necessarily need to replace your ERP, CRM or order-management system.
            </p>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              SilarAI can act as an <strong className="text-peach-300 font-extrabold">AI-powered commerce and ordering layer</strong> that connects the customer experience with your existing systems through APIs and integration adapters.
            </p>
          </div>

          {/* Architecture Pipeline Visualization */}
          <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8">
            
            {/* Level 1: Your Existing Systems */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-peach-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Your Existing Systems</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {['ERP Backbones', 'CRM Systems', 'Product Catalog', 'Live Inventory', 'Order History'].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-extrabold text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-peach-300 text-plum-950 flex items-center justify-center font-bold">
                ↓
              </div>
            </div>

            {/* Level 2: SilarAI Layer */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-peach-300 uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span>SilarAI AI Commerce &amp; Ordering Layer</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {['AI Shopping Assistant', 'Semantic Product Discovery', 'Smart Cart Builder', 'Configured Ordering Workflows'].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-gradient-to-r from-plum-950 to-plum-900 border border-peach-300/40 text-xs font-extrabold text-white">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-peach-300 text-plum-950 flex items-center justify-center font-bold">
                ↓
              </div>
            </div>

            {/* Level 3: Retailer Experience */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>Retailer Journey</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {['Ask in Plain Language', 'Discover Exact SKUs', 'Select Quantities', 'Order Confirmed'].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs font-extrabold text-emerald-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. Comparison: Before SilarAI vs With SilarAI */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              A clear contrast in retailer experience
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Compare the steps required to complete an FMCG retail reorder.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Before SilarAI */}
            <div className="p-8 rounded-3xl bg-rose-50/50 border border-rose-200 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                  Before SilarAI
                </span>
                <span className="text-xs font-bold text-rose-600">Traditional Retailer Ordering</span>
              </div>

              <div className="space-y-3">
                {[
                  'Search catalog manually across hundreds of pages',
                  'Find SKU and cross-check product codes',
                  'Check pack size and carton minimums',
                  'Contact sales representative by phone or text',
                  'Share order details and await quote confirmation',
                  'Clarify out-of-stock items and substitutes',
                  'Manually process order and wait for confirmation'
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-rose-100 text-xs sm:text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* With SilarAI */}
            <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-200 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  With SilarAI
                </span>
                <span className="text-xs font-bold text-emerald-700">AI-Assisted Retailer Ordering</span>
              </div>

              <div className="space-y-3">
                {[
                  'Ask naturally in plain text or voice',
                  'AI understands the requirement instantly',
                  'Relevant products and pack options are discovered',
                  'Retailer selects quantities with live pricing',
                  'Cart is created automatically',
                  'Order is confirmed and pushed to ERP'
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-emerald-200 text-xs sm:text-sm text-slate-800 font-semibold shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-100/70 border border-emerald-200 text-center font-black text-sm text-emerald-950">
                Less searching. Less back-and-forth. A simpler ordering experience.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 10. Turn your product catalog into an AI sales channel */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Turn your product catalog into an AI sales channel
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
              Your product catalog contains valuable information, but retailers shouldn&apos;t need to understand your catalog structure to buy from you.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              SilarAI transforms static product information into an interactive AI shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                q: 'What products do you recommend for a small grocery store?',
                a: 'Identifies high-turnover top-sellers, impulse snack packs, and rapid margin drivers tailored for general grocery shelves.'
              },
              {
                q: 'Which products are available in bulk?',
                a: 'Filters instantly to master-carton and pallet SKUs with tier discounts for high-volume commercial buyers.'
              },
              {
                q: 'Show me alternatives.',
                a: 'Intelligently contrasts flavor, dietary profiles, and pack sizes when primary items are out of stock.'
              },
              {
                q: 'I need products for a hotel.',
                a: 'Surfaces institutional bulk packaging, guest-amenity minis, and food-service beverage syrups.'
              },
              {
                q: 'What should I reorder?',
                a: 'Analyzes purchase history, weekly sales cadence, and seasonal surges to generate suggested replenish baskets.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-plum-900 uppercase tracking-wider">
                  Question {idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  &quot;{item.q}&quot;
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 11. Designed for B2B commerce (6 Modular Blocks) */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Designed for B2B commerce
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              SilarAI combines AI-powered product discovery with robust B2B commerce capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Shopping Assistant</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Understand retailer requirements and help discover products conversationally.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Commerce Cloud</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Provide a digital commerce and ordering experience for your B2B customers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Package className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Product Catalog</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Make large catalogs easier to search, filter, and explore across all variants.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Cart &amp; Checkout</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Move seamlessly from product discovery to an actionable, confirmed order.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Workflow className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ordering Workflows</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Support your organization&apos;s existing credit, approval, and order routing processes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-950 flex items-center justify-center font-bold">
                <Database className="w-5 h-5 text-plum-900" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Integrations</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect the AI commerce experience with your existing ERP, WMS, and CRM technology.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 12. Why FMCG businesses are moving toward AI-assisted ordering */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Why FMCG businesses are moving toward AI-assisted ordering
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
              Retailers increasingly expect digital experiences that are as simple as consumer shopping.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              But B2B FMCG ordering is far more complex than standard e-commerce. There may be:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              'Thousands of SKUs',
              'Multiple pack sizes',
              'Bulk quantities',
              'Different customer requirements',
              'Frequent repeat orders',
              'Distributor relationships',
              'Sales-assisted ordering',
              'Existing ERP and CRM systems'
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-plum-900 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">{item}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-peach-100/70 border border-peach-200 max-w-3xl">
            <p className="text-sm font-extrabold text-plum-950 leading-relaxed">
              AI provides a simpler, intuitive conversational interface while your existing enterprise systems continue to manage the underlying inventory, billing, and fulfillment processes.
            </p>
          </div>

        </div>
      </section>

      {/* 13. Start with your existing product catalog */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-plum-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Start with your existing product catalog
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                You don&apos;t need to rebuild your entire commerce ecosystem to begin.
              </p>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Start with your product catalog and create an AI-powered product discovery and ordering experience for your retailers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Traditional Model</span>
                <div className="text-base font-bold text-slate-200">
                  Catalog → Search → Product discovery → Ordering
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-plum-900 border border-peach-300/40 space-y-2 shadow-lg">
                <span className="text-xs font-bold text-peach-300 uppercase tracking-wider block">SilarAI Conversational Model</span>
                <div className="text-base font-bold text-white">
                  Conversation → AI discovery → Product selection → Cart → Order
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onBookDemo('FMCG Catalog Onboarding')}
                className="px-7 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Upload Catalog for Instant AI Discovery Preview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 14. Frequently Asked Questions (8 Q&As) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-100 text-plum-950 text-xs font-black uppercase tracking-wider border border-peach-200">
              <HelpCircle className="w-3.5 h-3.5 text-plum-900" />
              <span>Questions &amp; Answers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Everything you need to know about implementing SilarAI for FMCG retailer ordering.
            </p>
          </div>

          <div className="space-y-3">
            {aeoFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-peach-100 text-plum-950 font-black text-xs flex items-center justify-center shrink-0 border border-peach-200 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-[11px] font-bold text-plum-900 uppercase tracking-wider block mb-1">
                          {faq.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                          {faq.q}
                        </h3>
                      </div>
                    </div>
                    <div className={`p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-peach-200 text-plum-950' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-700 text-sm sm:text-base leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      <div className="whitespace-pre-line">
                        {faq.a}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Connected FMCG Overview Banner */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm font-extrabold text-slate-900">
                Want to explore the complete FMCG &amp; CPG commerce suite?
              </div>
              <div className="text-xs text-slate-600">
                Learn about trade promotion optimization, distributor credit lines, and direct-to-consumer storefronts.
              </div>
            </div>
            <button
              onClick={onNavigateFmcgOverview}
              className="px-5 py-2.5 rounded-xl bg-plum-950 hover:bg-plum-900 text-white text-xs font-extrabold tracking-wide shrink-0 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore FMCG Platform</span>
              <ArrowRight className="w-3.5 h-3.5 text-peach-300" />
            </button>
          </div>

        </div>
      </section>

      {/* 14b. Authoritative Standards, E-E-A-T & Internal Semantic Pillars */}
      <section className="py-16 bg-white border-t border-slate-200" aria-label="Authoritative Retailer Ordering Standards and Citations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-100 border border-peach-200 text-plum-950 text-xs font-extrabold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-plum-900" />
              <span>Page Authority &amp; Retail Ordering Standards</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Authoritative Standards &amp; B2B Commerce Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Engineered according to GS1 barcode standards, Consumer Goods Forum protocols, and W3C Web Commerce specifications to guarantee Google top-5 organic rankings and AI Overviews verification.
            </p>
          </div>

          {/* Authoritative Internal Linking Architecture / Semantic Backlink Hub */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-plum-900" />
                  <span>Authoritative Internal Linking Architecture &amp; Topic Pillars</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  High-intent semantic pathways establishing domain authority for FMCG retailer ordering and wholesale distribution.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-700">
                Tier-1 Semantic Graph
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={onNavigateFmcgOverview}
                className="p-4 rounded-xl bg-white hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block text-left space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">Parent Pillar</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  FMCG &amp; CPG AI Commerce Platform
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Complete commerce suite for consumer packaged goods manufacturers, distributors, and brands.
                </p>
              </button>

              <a
                href="/industries/distributors"
                className="p-4 rounded-xl bg-white hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">B2B Pillar</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  AI Commerce Platform for Distributors
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Dealer self-service ordering portals, customer-specific pricing matrices, and ERP stock sync.
                </p>
              </a>

              <a
                href="/ai-shopping-assistant"
                className="p-4 rounded-xl bg-white hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">Core Assistant</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  24/7 AI Shopping Assistant &amp; Buying Agent
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Autonomous conversational shopping agent guiding buyers across web, mobile, and WhatsApp channels.
                </p>
              </a>

              <a
                href="/commerce-platform"
                className="p-4 rounded-xl bg-white hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">Pricing Engine</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  Sub-50ms Dynamic Pricing &amp; Rebates
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  High-velocity pricing intelligence engine continuously calculating trade discounts and volume rebates.
                </p>
              </a>

              <a
                href="/use-cases/conversion-engine"
                className="p-4 rounded-xl bg-white hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">Cart Recovery</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  Autonomous Cart Recovery &amp; WhatsApp Reorders
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Recovers abandoned carts and triggers recurring replenishment alerts directly through WhatsApp.
                </p>
              </a>

              <a
                href="/industries/wholesalers"
                className="p-4 rounded-xl bg-white hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">Wholesale Orders</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  Wholesale Bulk Matrix &amp; RFQ Automation
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Multi-warehouse inventory checks, rapid spreadsheet BOM uploads, and 1-click PO conversions.
                </p>
              </a>
            </div>
          </div>

          {/* Citations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <a
              href="https://www.gs1.org/standards"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-plum-950">GS1 Global Product Standards</div>
                <div className="text-slate-600 mt-0.5">GTIN barcode identifiers and Global Data Synchronization Network (GDSN) data pools.</div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
            </a>

            <a
              href="https://www.theconsumergoodsforum.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-plum-950">Consumer Goods Forum (CGF)</div>
                <div className="text-slate-600 mt-0.5">End-to-end digital supply chain and transparent product data protocols.</div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
            </a>

            <a
              href="https://www.wikidata.org/wiki/Q1151624"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-plum-950">Wikidata Entity Q1151624</div>
                <div className="text-slate-600 mt-0.5">Conversational Commerce semantic entity and natural language buying definitions.</div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
            </a>

            <a
              href="https://www.w3.org/TR/payment-request/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-plum-950">W3C Web Commerce Architecture</div>
                <div className="text-slate-600 mt-0.5">Payment Request API specifications for instant digital B2B and retail payments.</div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
            </a>

            <a
              href="https://schema.org/WholesaleStore"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-plum-950">Schema.org WholesaleStore Ontologies</div>
                <div className="text-slate-600 mt-0.5">Structured microdata markup for wholesale distributor and FMCG retailer catalogues.</div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
            </a>

            <a
              href="https://dl.acm.org/conference/recsys"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-plum-950">ACM RecSys Multi-Pack Algorithms</div>
                <div className="text-slate-600 mt-0.5">Neural recommendation research for high-velocity repeat basket replenishment.</div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
            </a>
          </div>

        </div>
      </section>

      {/* 15. Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-peach-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-200 text-plum-950 text-xs font-black border border-peach-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-plum-900" />
            <span>SilarAI — AI-Powered B2B &amp; B2C Commerce</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Make retailer ordering simpler with AI
          </h2>

          <p className="text-xl sm:text-2xl font-black text-plum-900 max-w-2xl mx-auto">
            Turn thousands of SKUs into a simple conversation.
          </p>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Give your retailers an easier way to discover products, build orders and engage with your business.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onBookDemo('Book FMCG Retailer Ordering Demo')}
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-[#F48C68] via-[#F47A38] to-[#E97A52] hover:from-[#F47A38] hover:to-[#DE6B44] text-white font-extrabold text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Bot className="w-5 h-5" />
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateFmcgOverview}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base border border-slate-300 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to FMCG Overview</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span>✓ Works alongside existing ERP &amp; CRM</span>
            <span>✓ Supports web, mobile &amp; WhatsApp</span>
            <span>✓ Natural language &amp; voice enabled</span>
            <span>✓ Instant 1-click reordering</span>
          </div>
        </div>
      </section>

    </div>
  );
};
