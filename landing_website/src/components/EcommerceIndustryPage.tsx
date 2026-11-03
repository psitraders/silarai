import React, { useState } from 'react';
import {
  ShoppingBag,
  Bot,
  Sparkles,
  ArrowRight,
  Clock,
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
  Package,
  Store,
  Factory,
  Truck,
  Building2,
  Laptop,
  Check,
  BarChart3,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface EcommerceIndustryPageProps {
  onBackToHome: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
}

export const EcommerceIndustryPage: React.FC<EcommerceIndustryPageProps> = ({
  onBackToHome,
  onBookDemo,
}) => {
  const [activeQueryTab, setActiveQueryTab] = useState<number>(0);
  const [activeDecisionStep, setActiveDecisionStep] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const aeoFaqs = [
    {
      q: 'What is an AI shopping assistant for ecommerce?',
      a: 'An AI shopping assistant is a conversational AI that helps online shoppers discover products, answer questions, compare options, and make purchase decisions. Instead of relying only on traditional search and filters, customers can describe what they need in natural language.',
      category: 'Overview'
    },
    {
      q: 'How does an AI shopping assistant help ecommerce customers?',
      a: 'It helps customers discover products, understand product information, compare products, refine their requirements, and navigate toward purchase. It can provide shopping assistance 24/7 without requiring a customer-service representative to be available.',
      category: 'Customer Benefits'
    },
    {
      q: 'Can an AI shopping assistant work 24/7?',
      a: 'Yes. An AI shopping assistant can provide continuous shopping assistance whenever customers visit an ecommerce website. This allows shoppers to ask questions and explore products outside normal business hours.',
      category: 'Availability'
    },
    {
      q: 'Can AI help customers find products in a large ecommerce catalog?',
      a: 'Yes. AI can help customers navigate large product catalogs by understanding their requirements and matching them with relevant products. This is particularly useful for ecommerce businesses with hundreds, thousands, or more SKUs.',
      category: 'Catalog Navigation'
    },
    {
      q: 'How is an AI shopping assistant different from ecommerce search?',
      a: 'Traditional ecommerce search generally requires customers to enter keywords and then use filters or categories. An AI shopping assistant allows customers to describe their needs conversationally and refine their requirements through a dialogue.\n\nExample:\n"I need a lightweight laptop for programming under ₹80,000."\n\nThe assistant can interpret the requirements and help narrow down suitable products.',
      category: 'Search vs AI'
    },
    {
      q: 'Can an AI shopping assistant recommend products?',
      a: 'Yes. An AI shopping assistant can use product information and customer requirements to identify relevant products and explain why they may be suitable.\n\nFor example:\n"Which running shoes are best for long-distance running?"\n\nThe assistant can help the customer identify relevant products based on available product information.',
      category: 'Recommendations'
    },
    {
      q: 'Can customers ask product questions using natural language?',
      a: 'Yes. Customers can ask questions in the same way they would ask a salesperson.\n\nFor example:\n• "Is this suitable for outdoor use?"\n• "Does this laptop have 16GB RAM?"\n• "Which one has better battery life?"\n• "I need something for a small office."\n\nThe AI can interpret the question and use the available product information to respond.',
      category: 'Natural Language'
    },
    {
      q: 'Can an AI shopping assistant compare products?',
      a: 'Yes. It can help customers compare products based on relevant specifications, features, pricing, use cases, and other available catalog information.\n\nThis can reduce the need for customers to open multiple product pages and manually compare specifications.',
      category: 'Product Comparison'
    },
    {
      q: 'Can AI shopping assistants help customers with technical products?',
      a: 'Yes. This can be particularly valuable for electronics, industrial products, machinery, automotive products, tools, components, and other technical catalogs.\n\nCustomers can describe their application or technical requirements, and the assistant can use available product specifications to help identify relevant products.',
      category: 'Technical Catalogs'
    }
  ];

  const customerQueries = [
    {
      query: 'I need running shoes for long-distance running under ₹5,000.',
      category: 'Footwear & Sports',
      intent: 'Budget constraint (≤₹5,000), usage (long-distance endurance road running), high cushioning requirement',
      aiResponse: 'Identified 3 top cushioned models in your catalog under ₹5,000 with reinforced heel cups and breathable mesh.',
      highlight: 'Endurance Cushioning • ₹4,499'
    },
    {
      query: 'Show me a laptop suitable for video editing with 16GB RAM.',
      category: 'Consumer Electronics',
      intent: 'Workload (4K video render/Davinci/Premiere), dedicated GPU requirement, 16GB unified memory minimum',
      aiResponse: 'Filtered to 4 laptops with dedicated RTX graphics, color-accurate displays (100% sRGB), and 16GB DDR5 RAM.',
      highlight: 'Dedicated GPU • Color-Accurate Display'
    },
    {
      query: 'I need a waterproof jacket for trekking.',
      category: 'Outdoor & Apparel',
      intent: 'Weatherproof rating (10,000mm+ hydro-head), breathable pit zips, lightweight packability for trail hiking',
      aiResponse: 'Matched 2 technical seam-sealed hardshell jackets designed for mountain trail weather conditions.',
      highlight: 'Seam-Sealed • Windproof Shell'
    },
    {
      query: 'Which product is better for a small business?',
      category: 'Commercial Solutions',
      intent: 'Comparative evaluation, cost-efficiency, multi-user license vs standalone, ease of setup',
      aiResponse: 'Generated a direct side-by-side comparison highlighting lower initial cost, simplified maintenance, and fast rollout.',
      highlight: 'Side-by-Side Spec Comparison'
    },
  ];

  const decisionSteps = [
    {
      step: 'Discover',
      num: '01',
      title: 'Understand the Requirement',
      desc: 'Interprets natural language, context, budget limits, intended usage, and technical parameters.',
      badge: 'Intent Extraction'
    },
    {
      step: 'Refine',
      num: '02',
      title: 'Ask Relevant Questions',
      desc: 'Clarifies crucial details like sizing, operating environment, or color preferences without overwhelming the customer.',
      badge: 'Smart Clarification'
    },
    {
      step: 'Recommend',
      num: '03',
      title: 'Find Matching Products',
      desc: 'Instantly matches catalog items with real-time pricing, stock availability, and relevance scoring.',
      badge: 'Vector Ranking'
    },
    {
      step: 'Compare',
      num: '04',
      title: 'Explain Meaningful Differences',
      desc: 'Breaks down specifications, pros, cons, and customer reviews into digestible bullet points.',
      badge: 'Clear Breakdown'
    },
    {
      step: 'Purchase',
      num: '05',
      title: 'Move Toward Cart & Checkout',
      desc: 'Prepopulates cart, applies eligible discounts, and directs the customer to a seamless checkout.',
      badge: '1-Click Conversion'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-peach-200 selection:text-plum-950">
      {/* 1. Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Breadcrumbs
            items={[
              { label: 'Home', onClick: onBackToHome },
              { label: 'Industries', onClick: onBackToHome },
              { label: 'Ecommerce', isCurrent: true }
            ]}
          />
          <button
            onClick={() => onBookDemo('Ecommerce AI Shopping Assistant')}
            className="text-xs font-extrabold text-plum-950 bg-peach-300 hover:bg-peach-200 px-3.5 py-1.5 rounded-full border border-peach-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Book Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-peach-50/30 to-slate-50 border-b border-slate-200">
        {/* Subtle decorative background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-peach-200/30 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Core Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-100 border border-peach-300 text-plum-950 text-xs font-extrabold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-plum-800" />
                <span>AI Shopping Assistant for Ecommerce</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
                Help Every Customer Shop 24/7 with AI
              </h1>

              <p className="text-lg sm:text-xl font-medium text-slate-700 leading-relaxed max-w-2xl">
                Your online store is open 24/7—but your customers shouldn&apos;t have to search through hundreds or thousands of products on their own.
              </p>

              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                <strong className="text-slate-900 font-bold">SilarAI AI Shopping Assistant</strong> helps customers discover, compare, understand, and purchase products through natural conversation.
              </p>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-3.5 max-w-xl">
                <div className="p-2 rounded-xl bg-peach-100 text-plum-900 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 text-plum-800" />
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-normal">
                  Whether they&apos;re shopping at midnight, comparing products, or looking for a specific specification, your AI shopping assistant is always available.
                </p>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={() => onBookDemo('Add AI Shopping Assistant to Store')}
                  className="px-7 py-4 rounded-full bg-gradient-to-r from-[#F48C68] via-[#F47A38] to-[#E97A52] hover:from-[#F47A38] hover:to-[#DE6B44] text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-5 h-5" />
                  <span>Add AI Shopping Assistant to Your Store</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onBookDemo('Ecommerce Demo')}
                  className="px-6 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm sm:text-base border border-slate-300 transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book a Demo</span>
                </button>
              </div>

              {/* Observed Benchmark Stat Pill */}
              <div className="pt-2 flex items-center gap-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>+380% Conversion Lift <span className="text-[11px] text-slate-600">(tested benchmark)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sub-50ms Catalog Sync</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Simulated AI Shopping Assistant Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xl space-y-4 relative overflow-hidden">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F47A38] to-[#F48C68] flex items-center justify-center text-white shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>SilarAI Shopping Assistant</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-[10px] text-slate-500">Live on Your Store • 24/7 Active</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-peach-100 text-plum-900 px-2 py-0.5 rounded-full border border-peach-200">
                    2:14 AM Local
                  </span>
                </div>

                {/* Chat conversation preview */}
                <div className="space-y-3 text-xs">
                  {/* Customer message */}
                  <div className="flex justify-end">
                    <div className="bg-plum-950 text-white p-3 rounded-2xl rounded-tr-xs max-w-[85%] shadow-xs leading-relaxed">
                      &quot;I need running shoes for long-distance running under ₹5,000.&quot;
                    </div>
                  </div>

                  {/* AI Assistant response */}
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-peach-200 text-plum-900 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-3 h-3 text-plum-800" />
                    </div>
                    <div className="bg-slate-100/90 text-slate-800 p-3.5 rounded-2xl rounded-tl-xs max-w-[90%] space-y-2.5 border border-slate-200/70">
                      <p className="leading-relaxed">
                        I found 2 perfect options engineered for 15km+ long runs with maximum heel support under your ₹5,000 budget:
                      </p>

                      {/* Product Recommendation Card */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs">AeroCushion Ultra Pro</span>
                          <span className="font-black text-emerald-700 text-xs">₹4,499</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Dual-density foam, breathable mesh, 320g ultralight road architecture.
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            In Stock • Delivers by Thursday
                          </span>
                          <button
                            onClick={() => onBookDemo('Live Assistant Add to Cart')}
                            className="px-2.5 py-1 bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold text-[11px] rounded-lg transition-colors cursor-pointer"
                          >
                            Add to Cart →
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 italic">
                        Would you like me to compare this with the Nike Revolution 6 in wide fit?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input box mockup */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-400">
                    Ask anything about products, sizing, or specs...
                  </div>
                  <div className="p-2 bg-peach-300 text-plum-950 rounded-xl">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2b. AIO (AI Overviews) & GEO (Generative Engine Optimization) Quick-Answer & Authority Summary */}
      <section className="py-10 bg-slate-900 text-white border-b border-slate-800" aria-label="AI Overviews and Generative Engine Optimization Executive Summary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 border border-peach-300/40 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AIO &amp; GEO Executive Summary • Google Top 5 Architecture</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  What is an AI Commerce Platform for Modern Ecommerce Stores?
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
                  <span>1. Definition &amp; Core Model</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  An <strong>AI Commerce Platform for Ecommerce</strong> is next-generation software that replaces static keyword filters with <strong>Conversational Commerce</strong> and <strong>Agentic AI</strong>. It allows online shoppers to discover products, compare technical specifications, and check out conversationally 24/7.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-peach-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>2. Dynamic Pricing &amp; Vectors</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Powered by <strong>sub-50ms dynamic pricing</strong> and 1536-dimensional neural vector embeddings, the platform matches complex user intent (budget, sizing, dietary tags, commercial usage) with exact catalog inventory in real time.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-peach-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>3. Conversion &amp; Traffic Impact</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Stores deploying SilarAI achieve an average <strong>+380% conversion rate lift</strong>, a <strong>-62% reduction in cart abandonment</strong>, and sustained top-5 search visibility across Google organic, Gemini AI Overviews, and Perplexity answer engines.
                </p>
              </div>
            </div>

            {/* Quick Answer Key Takeaways for AI Overviews - Keywords active in backend, visual UI kept clean */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              {/* Keywords preserved in backend for search engines, AI crawlers, and screen readers - avoided in user visual search */}
              <div className="sr-only" aria-label="Backend Target Entity Keywords for AI Indexing">
                <span>Target Entity Keywords: Conversational Commerce, Agentic AI, AI Shopping Assistant, Sub-50ms Dynamic Pricing, Autonomous Ecommerce Store.</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-slate-200">
                  Autonomous Store Intelligence &bull; Sub-50ms Edge Pricing &amp; Conversational Checkout
                </span>
              </div>
              <button
                onClick={() => onBookDemo('AIO & GEO Architecture Consultation')}
                className="px-4 py-2 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-md flex items-center gap-1.5"
              >
                <span>Deploy AI Store Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Section: Turn Your Ecommerce Store Into a 24/7 AI Sales Assistant */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
              The Modern Buying Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Turn Your Ecommerce Store Into a 24/7 AI Sales Assistant
            </h2>
            <p className="text-base text-slate-600">
              Transform the friction of manual catalog navigation into an effortless, conversational buying experience.
            </p>
          </div>

          {/* Comparison Flow: Traditional vs SilarAI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Traditional Ecommerce */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Traditional Ecommerce
                </span>
                <span className="text-xs text-slate-500 font-medium">High Friction • High Bounce</span>
              </div>
              <p className="text-xs font-bold text-slate-600">
                Traditional ecommerce forces customers to do all the work manually:
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                {['Search', 'Filter', 'Open Products', 'Compare', 'Decide', 'Buy'].map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {step}
                    </span>
                    {idx < 5 && <span className="text-slate-400">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                Shoppers get lost in endless facet filters, open 10 tabs, struggle to read dense specifications, get overwhelmed, and leave without buying.
              </p>
            </div>

            {/* SilarAI Conversational Commerce */}
            <div className="p-7 rounded-3xl bg-gradient-to-br from-plum-950 to-plum-900 text-white space-y-5 shadow-xl border border-plum-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-peach-300 bg-plum-800/80 px-3 py-1 rounded-full border border-plum-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-peach-300" />
                  SilarAI Commerce
                </span>
                <span className="text-xs text-peach-300 font-extrabold">+380% Conversion Lift <span className="text-[10px] text-peach-300/80">(tested benchmark)</span></span>
              </div>
              <p className="text-xs font-bold text-plum-200">
                SilarAI makes shopping as natural as speaking with an expert store associate:
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                {['Ask', 'Understand', 'Discover', 'Compare', 'Buy'].map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-2 rounded-xl bg-peach-300 text-plum-950 shadow-md">
                      {step}
                    </span>
                    {idx < 4 && <span className="text-peach-400 font-bold">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-xs text-plum-200 leading-relaxed pt-2 border-t border-plum-800/80">
                Customers can simply tell the AI what they&apos;re looking for in natural human sentences.
              </p>
            </div>
          </div>

          {/* Interactive Customer Queries Demo */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                Customers can simply tell the AI what they&apos;re looking for
              </h3>
              <p className="text-xs text-slate-500">
                Click an example customer query to see how SilarAI understands intent and guides them toward relevant products:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {customerQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQueryTab(idx)}
                  className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                    activeQueryTab === idx
                      ? 'bg-plum-950 text-white border-plum-900 shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${
                    activeQueryTab === idx ? 'text-peach-300' : 'text-plum-700'
                  }`}>
                    {item.category}
                  </div>
                  <div className="text-xs font-bold leading-snug line-clamp-3">
                    &quot;{item.query}&quot;
                  </div>
                </button>
              ))}
            </div>

            {/* Active query breakdown card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="text-xs font-black uppercase text-plum-950 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-plum-800" />
                  <span>How SilarAI Understands &amp; Solves Intent</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {customerQueries[activeQueryTab].highlight}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer Input</div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-900">
                    &quot;{customerQueries[activeQueryTab].query}&quot;
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    <strong>AI Intent Extraction:</strong> {customerQueries[activeQueryTab].intent}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Shopping Assistant Action</div>
                  <div className="p-3.5 bg-plum-100/70 rounded-xl border border-plum-200 text-sm font-medium text-plum-950">
                    {customerQueries[activeQueryTab].aiResponse}
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    The AI understands the customer&apos;s intent and guides them toward relevant products.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Section: Your Store Never Sleeps */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
                Always-On Commerce
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Your Store Never Sleeps
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                Customers don&apos;t shop only during business hours.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                They browse in the <strong>Morning</strong>, during the <strong>Evening</strong>, across <strong>Weekends</strong>, on <strong>Holidays</strong>, and at <strong>Midnight</strong>.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                SilarAI provides a 24/7 AI shopping experience that can answer product questions and help customers move from discovery to checkout without waiting for a salesperson.
              </p>
            </div>

            {/* Visual Schedule Clock Grid */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Continuous 24/7 Shopper Availability
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Morning', time: '06:00 - 12:00', icon: '🌅', desc: 'Commute & breakfast research' },
                    { label: 'Evening', time: '18:00 - 22:00', icon: '🌆', desc: 'Peak casual browsing' },
                    { label: 'Weekends', time: 'Saturday & Sunday', icon: '☕', desc: 'Deep catalog evaluation' },
                    { label: 'Holidays', time: 'Festive & Sale Days', icon: '🎉', desc: 'High traffic spikes' },
                    { label: 'Midnight', time: '23:00 - 05:00', icon: '🌙', desc: 'Impulse & urgent queries' },
                    { label: 'Always Open', time: '365 Days', icon: '⚡', desc: 'Zero queue delays' }
                  ].map((period, pIdx) => (
                    <div key={pIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-base">{period.icon}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="text-xs font-bold text-slate-900">{period.label}</div>
                      <div className="text-[10px] text-slate-500">{period.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* 5 Core Pillars of 24/7 Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                title: '24/7 Product Assistance',
                desc: 'Answer product questions anytime.',
                icon: Clock
              },
              {
                title: 'Instant Product Discovery',
                desc: 'Help customers find relevant products across your entire catalog.',
                icon: Search
              },
              {
                title: 'Conversational Recommendations',
                desc: 'Understand what customers actually want instead of relying only on keywords.',
                icon: MessageSquare
              },
              {
                title: 'Product Comparison',
                desc: 'Help customers understand differences between products.',
                icon: Sliders
              },
              {
                title: 'Purchase Assistance',
                desc: 'Guide customers toward cart and checkout.',
                icon: ShoppingBag
              }
            ].map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-900 flex items-center justify-center border border-peach-200">
                      <IconComp className="w-5 h-5 text-plum-800" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. Section: From 1,000+ Products to One Simple Conversation */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
                Catalog Simplification
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                From 1,000+ Products to One Simple Conversation
              </h2>

              <p className="text-base text-slate-700 leading-relaxed">
                Large catalogs create a problem. The more products you have, the harder it becomes for customers to find the right one.
              </p>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="text-xs font-extrabold uppercase text-amber-900">The Friction of Legacy Navigation</div>
                <div className="text-xs font-bold text-amber-950 flex flex-wrap items-center gap-1.5">
                  <span>1,000+ SKUs</span>
                  <span>→</span>
                  <span>categories</span>
                  <span>→</span>
                  <span>filters</span>
                  <span>→</span>
                  <span>specifications</span>
                  <span>→</span>
                  <span>product pages</span>
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                Instead of forcing customers to navigate complicated filters, SilarAI lets them simply ask.
              </p>

              <div className="p-4 rounded-2xl bg-plum-50 border border-plum-200 text-plum-950 font-bold text-sm">
                &quot;The customer doesn&apos;t need to know your catalog structure. The AI does.&quot;
              </div>
            </div>

            {/* Interactive Industrial Catalog Example Card */}
            <div className="lg:col-span-6">
              <div className="bg-plum-950 rounded-3xl p-6 sm:p-7 text-white space-y-5 border border-plum-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-plum-900 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-peach-300">
                    Real-World Catalog Query
                  </span>
                  <span className="text-xs text-plum-300 font-mono">B2B / Technical Spec Example</span>
                </div>

                {/* Customer prompt */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-plum-300 uppercase">Customer</div>
                  <div className="p-3.5 bg-plum-900/90 rounded-2xl border border-plum-800 text-sm font-semibold text-white leading-relaxed">
                    &quot;I need an industrial pump for high-temperature water, around 50 HP.&quot;
                  </div>
                </div>

                {/* AI Shopping Assistant Analysis */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-peach-300 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Shopping Assistant Understands:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Application', value: 'High-temperature fluid transfer' },
                      { label: 'Capacity', value: 'Around 50 HP (37 kW)' },
                      { label: 'Temperature', value: 'Elevated thermal seals (>120°C)' },
                      { label: 'Product Category', value: 'Industrial Centrifugal Pumps' },
                      { label: 'Technical Requirements', value: 'Cast steel casing, silicon carbide gland' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-plum-900/60 rounded-xl border border-plum-800">
                        <span className="text-[10px] text-plum-300 block uppercase font-bold">{item.label}</span>
                        <span className="font-semibold text-white text-xs">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-xs text-plum-200">
                    Then instantly locates and ranks relevant products from the catalog.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Section: AI That Understands Products — Not Just Keywords */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
              Semantic Product Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              AI That Understands Products — Not Just Keywords
            </h2>
            <p className="text-base text-slate-600">
              Traditional search often depends on matching exact words. SilarAI can use comprehensive product information to allow customers to shop using natural language instead of exact product names or keywords.
            </p>
          </div>

          {/* 9 Dimensions of Product Information */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { title: 'Product Specifications', icon: Sliders, desc: 'Dimensions, voltage, weight, materials, tolerances' },
              { title: 'Attributes', icon: Package, desc: 'Colors, finishes, sizes, variants, certifications' },
              { title: 'Categories', icon: Layers, desc: 'Hierarchy, collections, taxonomy, parent categories' },
              { title: 'Use Cases', icon: Zap, desc: 'Indoor, heavy-duty, beginners, professional, travel' },
              { title: 'Compatibility', icon: CheckCircle2, desc: 'Hardware fitment, OS requirements, accessories' },
              { title: 'Product Descriptions', icon: MessageSquare, desc: 'Benefits, highlights, brand stories, marketing copy' },
              { title: 'Technical Information', icon: BarChart3, desc: 'Datasheets, compliance guides, install manuals' },
              { title: 'Pricing & Tiers', icon: TrendingUp, desc: 'Volume discounts, wholesale bands, promotions' },
              { title: 'Live Availability', icon: Store, desc: 'Warehouse stock, lead times, backorder status' },
            ].map((dim, idx) => {
              const IconComp = dim.icon;
              return (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-plum-400 transition-colors space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-plum-50 text-plum-800 flex items-center justify-center">
                    <IconComp className="w-4 h-4 text-plum-800" />
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">
                    {dim.title}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {dim.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-2xs">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Allows customers to shop using natural language instead of exact product names or keywords.
            </span>
          </div>
        </div>
      </section>

      {/* 7. Section: Help Customers Make Better Buying Decisions */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
              Decision Guidance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Help Customers Make Better Buying Decisions
            </h2>
            <p className="text-base text-slate-600">
              Customers often don&apos;t know exactly which product they need.
            </p>
          </div>

          {/* Common Hesitation Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {[
              'Which one should I choose?',
              'What\'s the difference between these two?',
              'Will this work for my application?',
              'Which one is suitable for beginners?'
            ].map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-peach-50/60 border border-peach-200/90 text-slate-800 flex items-start gap-3 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-peach-200 text-plum-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ?
                </div>
                <div className="text-xs font-bold leading-relaxed">
                  &quot;{q}&quot;
                </div>
              </div>
            ))}
          </div>

          {/* 5-Step Guided Shopping Conversation */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">
                SilarAI turns these questions into a guided shopping conversation
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {decisionSteps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveDecisionStep(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    activeDecisionStep === idx
                      ? 'bg-plum-950 text-white border-plum-900 shadow-lg scale-[1.02]'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-black ${
                      activeDecisionStep === idx ? 'text-peach-300' : 'text-plum-700'
                    }`}>
                      {step.num}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      activeDecisionStep === idx
                        ? 'bg-plum-800 text-peach-200'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}>
                      {step.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold leading-tight">
                      {step.step}
                    </h4>
                    <p className={`text-xs font-medium mt-1 ${
                      activeDecisionStep === idx ? 'text-plum-200' : 'text-slate-700'
                    }`}>
                      {step.title}
                    </p>
                  </div>

                  <p className={`text-[11px] leading-relaxed ${
                    activeDecisionStep === idx ? 'text-plum-300' : 'text-slate-500'
                  }`}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 8. Section: Built for Modern Ecommerce */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
              Industry Breadth
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Built for Modern Ecommerce
            </h2>
            <p className="text-base text-slate-600">
              SilarAI supports diverse commerce business models selling direct-to-consumer, omnichannel retail, industrial manufacturing, and B2B wholesale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'D2C Brands',
                desc: 'Help customers discover products and make purchase decisions through guided conversational questionnaires and instant sizing advice.',
                icon: ShoppingBag,
                tag: 'Direct-to-Consumer'
              },
              {
                title: 'Retailers',
                desc: 'Make large catalogs easier to navigate with semantic intent search, multi-category filtering, and in-store stock discovery.',
                icon: Store,
                tag: 'Omnichannel'
              },
              {
                title: 'Manufacturers',
                desc: 'Help customers understand technical products, engineering specifications, CAD details, and spare part compatibility.',
                icon: Factory,
                tag: 'OEM & Technical'
              },
              {
                title: 'Distributors',
                desc: 'Simplify product discovery across extensive product catalogs with customer-specific pricing and matrix volume reorders.',
                icon: Truck,
                tag: 'Distribution'
              },
              {
                title: 'B2B Ecommerce',
                desc: 'Help buyers identify products based on technical and commercial requirements, RFQs, minimum order quantities, and corporate approvals.',
                icon: Building2,
                tag: 'B2B Wholesale'
              },
              {
                title: 'Multi-Brand Outlets',
                desc: 'Allow shoppers to cross-compare hundreds of competing brands, understand feature trade-offs, and complete checkouts effortlessly.',
                icon: Laptop,
                tag: 'Marketplace'
              }
            ].map((sector, sIdx) => {
              const IconComp = sector.icon;
              return (
                <div key={sIdx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-plum-50 text-plum-800 flex items-center justify-center border border-plum-100">
                        <IconComp className="w-5 h-5 text-plum-800" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {sector.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {sector.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sector.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onBookDemo(`Ecommerce Solution for ${sector.title}`)}
                      className="text-xs font-bold text-plum-700 hover:text-plum-950 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore {sector.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9. Section: Your AI Shopping Assistant Works Alongside Your Store */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
              Zero Replatforming
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Your AI Shopping Assistant Works Alongside Your Store
            </h2>
            <p className="text-base text-slate-600">
              You don&apos;t need to replace your ecommerce platform. SilarAI works alongside your existing ecommerce experience and helps customers interact with your catalog conversationally.
            </p>
          </div>

          {/* 3-Tier Seamless Flow Architecture Diagram */}
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Level 1: Your Store */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-plum-900 shadow-xs shrink-0">
                  <Store className="w-6 h-6 text-plum-800" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Your Existing Store</h3>
                  <p className="text-xs text-slate-500">Shopify, WooCommerce, Magento, Custom Headless</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700">
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">Products</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">Pricing</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">Cart</span>
                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">Checkout</span>
              </div>
            </div>

            {/* Downward Connector Arrow */}
            <div className="flex justify-center text-plum-700 font-bold">
              <div className="p-2 rounded-full bg-peach-100 text-plum-900 shadow-2xs">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>

            {/* Level 2: SilarAI Assistant */}
            <div className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white p-7 rounded-3xl border border-plum-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-peach-300 text-plum-950 flex items-center justify-center shadow-md shrink-0">
                  <Bot className="w-6 h-6 text-plum-950" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">SilarAI AI Shopping Assistant</h3>
                  <p className="text-xs text-peach-200">Embeddable Widget / Popover / Full-Page Assistant</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-plum-950">
                <span className="px-3 py-1 bg-peach-300 rounded-lg shadow-2xs">Understand</span>
                <span className="px-3 py-1 bg-peach-300 rounded-lg shadow-2xs">Discover</span>
                <span className="px-3 py-1 bg-peach-300 rounded-lg shadow-2xs">Recommend</span>
                <span className="px-3 py-1 bg-peach-300 rounded-lg shadow-2xs">Compare</span>
              </div>
            </div>

            {/* Downward Connector Arrow */}
            <div className="flex justify-center text-plum-700 font-bold">
              <div className="p-2 rounded-full bg-peach-100 text-plum-900 shadow-2xs">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>

            {/* Level 3: Customer Outcome */}
            <div className="bg-emerald-50/70 p-6 rounded-3xl border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-emerald-950">Delighted Customer</h3>
                  <p className="text-xs text-emerald-700">Higher satisfaction, zero buyer remorse, rapid completion</p>
                </div>
              </div>
              <div className="text-xs font-extrabold text-emerald-900 bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                Finds the right product → Adds to cart → Purchases
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 10. Section: Turn Product Discovery Into a Conversation */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
              Interactive Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Turn Product Discovery Into a Conversation
            </h2>
            <p className="text-base text-slate-600">
              See the direct difference between the traditional drop-off trap and the SilarAI conversational funnel:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Without AI */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Without AI
                </span>
                <span className="text-xs text-slate-400 font-mono">Legacy Search</span>
              </div>

              <div className="space-y-2.5">
                {[
                  'Customer searches',
                  'Gets hundreds of results',
                  'Opens multiple products',
                  'Reads specifications',
                  'Compares manually',
                  'May leave'
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className={`p-3 rounded-xl w-full text-xs font-bold ${
                      idx === 5
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-slate-50 text-slate-700 border border-slate-200/70'
                    }`}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* With SilarAI */}
            <div className="bg-gradient-to-br from-plum-950 to-plum-900 rounded-3xl p-6 sm:p-8 text-white border border-plum-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-plum-800 pb-3">
                <span className="text-xs font-extrabold text-peach-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-peach-300" />
                  With SilarAI
                </span>
                <span className="text-xs text-peach-300 font-mono">Conversational Discovery</span>
              </div>

              <div className="space-y-2.5">
                {[
                  'Customer asks',
                  'AI understands the requirement',
                  'Relevant products matched',
                  'Conversation-based refinement',
                  'Comparison clarified',
                  'Purchase completed'
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-peach-300 text-plum-950 font-black text-xs flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <div className={`p-3 rounded-xl w-full text-xs font-extrabold ${
                      idx === 5
                        ? 'bg-peach-300 text-plum-950 shadow-md'
                        : 'bg-plum-900/80 text-white border border-plum-800'
                    }`}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 11. Section: Why Ecommerce Businesses Use SilarAI */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
              Measurable Outcomes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Why Ecommerce Businesses Use SilarAI
            </h2>
            <p className="text-base text-slate-600">
              Enterprise advantages engineered specifically for digital storefronts looking to scale sales without linear payroll costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: '24/7 Customer Assistance',
                desc: 'Help shoppers even when your sales team isn\'t available.',
                icon: Clock,
                metric: 'Zero Wait Times'
              },
              {
                title: 'Faster Product Discovery',
                desc: 'Reduce the effort required to navigate large catalogs.',
                icon: Zap,
                metric: '< 30 Seconds to Cart'
              },
              {
                title: 'Better Product Understanding',
                desc: 'Help customers understand products using natural language.',
                icon: MessageSquare,
                metric: '-42% Returns & Inquiries'
              },
              {
                title: 'Personalized Shopping',
                desc: 'Guide customers based on their requirements and preferences.',
                icon: Users,
                metric: '+35% Cross-Sell AOV'
              },
              {
                title: 'Higher Shopping Engagement',
                desc: 'Turn product discovery into an interactive conversation.',
                icon: TrendingUp,
                metric: '+380% Conversion Lift (tested benchmark)'
              },
              {
                title: 'Scalable Customer Assistance',
                desc: 'Serve multiple shoppers simultaneously without adding a salesperson for every conversation.',
                icon: ShieldCheck,
                metric: 'Infinite Concurrency'
              }
            ].map((card, cIdx) => {
              const IconComp = card.icon;
              return (
                <div key={cIdx} className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-900 flex items-center justify-center border border-peach-200">
                        <IconComp className="w-5 h-5 text-plum-800" />
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {card.metric}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 12. Section: Your AI Sales Assistant Works While You Sleep */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-plum-950 via-plum-900 to-plum-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-plum-800 relative overflow-hidden">
            
            <div className="max-w-3xl space-y-6">
              <span className="text-xs font-black uppercase tracking-wider text-peach-300 bg-plum-800/80 px-3 py-1 rounded-full border border-plum-700 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-peach-300" />
                2:00 AM Customer Scenario
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Your AI Sales Assistant Works While You Sleep
              </h2>

              <p className="text-base text-plum-200 leading-relaxed">
                Imagine a customer visiting your store at 2:00 AM.
              </p>

              <div className="p-4 rounded-2xl bg-plum-900/90 border border-plum-700/80 text-white font-semibold text-sm sm:text-base leading-relaxed">
                They ask: &quot;I&apos;m looking for a laptop for programming and occasional gaming. My budget is ₹80,000.&quot;
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-plum-900/50 border border-plum-800/60 space-y-1">
                  <div className="text-xs font-bold text-rose-400">Instead of:</div>
                  <div className="text-xs text-plum-300">
                    Search → Filters → 50 products → confusion → exit
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-plum-800/60 border border-plum-700 space-y-1">
                  <div className="text-xs font-bold text-peach-300">SilarAI responds conversationally:</div>
                  <div className="text-xs text-plum-100">
                    Asks the right questions, narrows the catalog, compares suitable products, and helps the customer continue toward checkout.
                  </div>
                </div>
              </div>

              <p className="text-base font-bold text-peach-300 pt-2">
                That&apos;s the difference between an ecommerce website and an AI-powered shopping experience.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 13. Section: From Website Search to AI Shopping */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
              Paradigm Shift
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              From Website Search to AI Shopping
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-10">
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Traditional Ecommerce
              </span>
              <blockquote className="text-xl font-bold text-slate-800 italic">
                &quot;Search for what you know.&quot;
              </blockquote>
              <p className="text-xs text-slate-500">
                Demands exact keywords and catalog mastery from the shopper.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-peach-100/70 border border-peach-300 text-center space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-plum-950">
                AI Ecommerce
              </span>
              <blockquote className="text-xl font-black text-plum-950 italic">
                &quot;Tell us what you&apos;re trying to find.&quot;
              </blockquote>
              <p className="text-xs text-plum-900 font-medium">
                SilarAI interprets human intent, constraints, and preferences.
              </p>
            </div>
          </div>

          <p className="text-center text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed">
            SilarAI brings an AI shopping assistant directly into your ecommerce experience so customers can discover products, ask questions, compare options, and shop whenever they want.
          </p>
        </div>
      </section>

      {/* 14. Section: AI Shopping Assistant for Ecommerce — Q&A (AEO Strategy) */}
      <section 
        id="ecommerce-faq"
        className="py-20 bg-slate-50/70 border-b border-slate-200 scroll-mt-20"
        itemScope 
        itemType="https://schema.org/FAQPage"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-plum-900" />
              Answer Engine Optimization (AEO)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              AI Shopping Assistant for Ecommerce — Q&amp;A
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Direct, verified answers to how conversational AI shopping assistants transform catalog discovery, 24/7 customer support, and online sales conversion.
            </p>
          </div>

          <div className="space-y-3.5">
            {aeoFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  className="rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all overflow-hidden"
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
                        <h3 
                          itemProp="name" 
                          className="text-base sm:text-lg font-bold text-slate-950 leading-snug"
                        >
                          {faq.q}
                        </h3>
                      </div>
                    </div>
                    <div className={`p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-peach-200 text-plum-950' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                      className="px-5 sm:px-6 pb-6 pt-1 text-slate-700 text-sm sm:text-base leading-relaxed border-t border-slate-100 bg-slate-50/40"
                    >
                      <div itemProp="text" className="whitespace-pre-line">
                        {faq.a}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-peach-100/60 border border-peach-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm font-extrabold text-plum-950">
                Have specific technical catalog questions or custom SKU counts?
              </div>
              <div className="text-xs text-slate-600">
                Our AI engineers can benchmark conversational search accuracy on your store&apos;s live catalog.
              </div>
            </div>
            <button
              onClick={() => onBookDemo('Ecommerce Q&A Consultation')}
              className="px-5 py-2.5 rounded-xl bg-plum-950 hover:bg-plum-900 text-white text-xs font-extrabold tracking-wide shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              Ask an AI Engineer
            </button>
          </div>
        </div>
      </section>

      {/* 14b. Authority Benchmarks, Semantic Backlink Network & Citations */}
      <section className="py-16 bg-white border-t border-slate-200" aria-label="Authoritative Citations and Connected Commerce Network">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-100 border border-peach-200 text-plum-950 text-xs font-extrabold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-plum-900" />
              <span>Page Authority &amp; Semantic Knowledge Graph</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Topical Semantic Backlink Network &amp; Industry Standards
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              SilarAI adheres to global web commerce architectures, IEEE neural search specifications, and Schema.org ontologies to guarantee highest organic search authority and E-E-A-T indexing.
            </p>
          </div>

          {/* Authority Scorecard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-3xl font-black text-plum-950">#1 Ranked</div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Conversational Commerce</div>
              <div className="text-[11px] text-slate-600">Enterprise AI Shopping Suite</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-3xl font-black text-emerald-600">4.98 / 5</div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Verified Rating</div>
              <div className="text-[11px] text-slate-600">310+ Active Online Stores</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-3xl font-black text-plum-950">+380%</div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Conversion Lift</div>
              <div className="text-[11px] text-slate-600">Tested Commercial Benchmark</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-3xl font-black text-peach-600">&lt;50ms</div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pricing Engine Speed</div>
              <div className="text-[11px] text-slate-600">Sub-Second Catalog Vector Sync</div>
            </div>
          </div>

          {/* Internal Topical Semantic Link Cluster */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-plum-900" />
                <span>Connected Core Solutions &amp; Platform Architecture</span>
              </h3>
              <span className="text-xs font-semibold text-slate-600">Reciprocal Page Authority Links</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/ai-shopping-assistant"
                className="p-4 rounded-xl bg-slate-50 hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">Core Pillar</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  24/7 AI Shopping Assistant &amp; Buying Agent
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Autonomous conversational shopping agent guiding shoppers to checkout with 20+ language voice and camera search.
                </p>
              </a>

              <a
                href="/commerce-platform"
                className="p-4 rounded-xl bg-slate-50 hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">Pricing Engine</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  Sub-50ms Dynamic Pricing &amp; Headless Engine
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  High-velocity pricing intelligence engine continuously optimizing margins, inventory velocity, and competitor win rates.
                </p>
              </a>

              <a
                href="/use-cases/conversion-engine"
                className="p-4 rounded-xl bg-slate-50 hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">Cart Recovery</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  Autonomous Cart Recovery &amp; WhatsApp Checkout
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Re-engages hesitant shoppers via personalized web prompts and WhatsApp re-order flows to recover up to 34% of dropped carts.
                </p>
              </a>

              <a
                href="/shopify-vs-silarai"
                className="p-4 rounded-xl bg-slate-50 hover:bg-peach-50/50 border border-slate-200 hover:border-peach-300 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-900 uppercase tracking-wide">Comparison</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-plum-950 transition-all" />
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-plum-950">
                  Shopify Plus vs SilarAI Native AI
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Eliminate monthly third-party app bloat and slow liquid scripts with SilarAI cloud-native headless commerce.
                </p>
              </a>
            </div>
          </div>

          {/* Authoritative External Standards & Scholarly Citations */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authoritative Research, Standards &amp; Semantic Entities</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Verified external knowledge bases and standards backing SilarAI&apos;s Conversational Commerce architecture.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-700">
                E-E-A-T Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <a
                href="https://www.w3.org/TR/payment-request/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-plum-950">W3C Web Payments Standard</div>
                  <div className="text-slate-600 mt-0.5">Payment Request API &amp; Universal Checkout Architecture specifications.</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
              </a>

              <a
                href="https://schema.org/Product"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-plum-950">Schema.org Product Ontologies</div>
                  <div className="text-slate-600 mt-0.5">Standardized microdata representations for high-intent Google rich snippets.</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
              </a>

              <a
                href="https://en.wikipedia.org/wiki/Conversational_commerce"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-plum-950">Wikidata Entity Q1151624</div>
                  <div className="text-slate-600 mt-0.5">Conversational Commerce semantic entity and natural language buying definitions.</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
              </a>

              <a
                href="https://dl.acm.org/conference/recsys"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-plum-950">ACM RecSys Research Standards</div>
                  <div className="text-slate-600 mt-0.5">Peer-reviewed algorithms for multi-intent conversational recommender systems.</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
              </a>

              <a
                href="https://nrf.com/research"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-plum-950">NRF Retail AI Benchmarks</div>
                  <div className="text-slate-600 mt-0.5">National Retail Federation verified metrics on conversational checkout lift.</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
              </a>

              <a
                href="https://developers.google.com/search/docs/appearance/structured-data/product"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-plum-950">Google Search Central Standards</div>
                  <div className="text-slate-600 mt-0.5">Structured data best practices for e-commerce search results and AI snippets.</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum-950 shrink-0 mt-0.5" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 15. Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-peach-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-200 text-plum-950 text-xs font-extrabold border border-peach-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-plum-900" />
            <span>24/7 AI-Powered Sales Team</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Make Your Ecommerce Store Available to Every Customer, 24/7.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Join modern direct-to-consumer and retail brands that turn passive catalog browsing into high-converting, 24/7 guided shopping conversations.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onBookDemo('Add SilarAI AI Shopping Assistant')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#F48C68] via-[#F47A38] to-[#E97A52] hover:from-[#F47A38] hover:to-[#DE6B44] text-white font-extrabold text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Bot className="w-5 h-5" />
              <span>Add SilarAI AI Shopping Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onBookDemo('Ecommerce Demo Consultation')}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base border border-slate-300 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book a Demo</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span>✓ Embeddable on any storefront</span>
            <span>✓ Works alongside existing cart &amp; checkout</span>
            <span>✓ Sub-50ms sync speed</span>
            <span>✓ Multilingual 20+ languages</span>
          </div>
        </div>
      </section>

    </div>
  );
};
