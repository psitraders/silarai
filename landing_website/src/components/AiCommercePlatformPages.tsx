import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Layers,
  Building,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Bot,
  Globe,
  Check,
  ShieldCheck,
  Users,
  Search,
  Sparkles,
  BarChart3,
  FileText,
  Building2,
  Tag,
  PackageCheck,
  TrendingUp,
  Share2,
  BrainCircuit,
  Megaphone,
  Target,
  Zap,
  Store,
  MessageSquare,
  ShoppingCart,
  Calendar,
  Layers3,
  Smartphone,
  Flame,
  CheckSquare,
  Cpu,
  Layers2
} from 'lucide-react';

export type AiCommercePageId = 1 | 2 | 3;

interface AiCommercePlatformPagesProps {
  activePage: AiCommercePageId;
  onSelectPage: (pageId: AiCommercePageId) => void;
  onNavigateAiAssistantPage?: (pageId: 1 | 2 | 3) => void;
  onBackToHome: () => void;
  onBookDemo: (plan?: string) => void;
}

export const AI_COMMERCE_PAGES_META = {
  1: {
    id: 1 as AiCommercePageId,
    slug: 'ai-commerce-platform',
    title: 'AI Commerce & Marketing Platform',
    navTitle: '1. Commerce & Marketing',
    shortTitle: 'Commerce & Marketing',
    metaTitle: 'AI Commerce & Marketing Platform | SilarAI',
    metaDescription:
      'SilarAI is an AI Commerce & Marketing Platform that combines ecommerce, AI-powered shopping, marketing automation, social media management, and customer engagement into one intelligent solution.',
    icon: Layers,
    badgeText: 'Sell. Market. Grow.'
  },
  2: {
    id: 2 as AiCommercePageId,
    slug: 'ai-shopping-assistant',
    title: 'AI Shopping Assistant',
    navTitle: '2. AI Shopping Assistant',
    shortTitle: 'AI Shopping Assistant',
    metaTitle: 'AI Shopping Assistant | SilarAI',
    metaDescription:
      'Turn every visitor into a confident buyer. SilarAI AI Shopping Assistant helps businesses deliver intelligent 24/7 buying experiences that increase conversion rates.',
    icon: Bot,
    badgeText: '24/7 Guided Shopping'
  },
  3: {
    id: 3 as AiCommercePageId,
    slug: 'ai-commerce-marketing-automation',
    title: 'AI Commerce Marketing Automation',
    navTitle: '3. Marketing Automation',
    shortTitle: 'Marketing Automation',
    metaTitle: 'AI Commerce Marketing Automation | SilarAI',
    metaDescription:
      'Create, publish, and grow without leaving your commerce platform. SilarAI combines AI-powered content creation, social media publishing, promotions, and marketing automation.',
    icon: Share2,
    badgeText: 'Unified Marketing Workspace'
  }
};

export const AiCommercePlatformPages: React.FC<AiCommercePlatformPagesProps> = ({
  activePage,
  onSelectPage,
  onNavigateAiAssistantPage,
  onBackToHome,
  onBookDemo
}) => {
  const currentMeta = AI_COMMERCE_PAGES_META[activePage];

  // Update document title and meta description dynamically
  useEffect(() => {
    document.title = currentMeta.metaTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', currentMeta.metaDescription);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, currentMeta]);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pt-24 pb-20">
      
      {/* Hero / Header Section */}
      <div className="bg-plum-950 text-white relative overflow-hidden border-b border-plum-800 py-12 sm:py-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-plum-800/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumbs & Back Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-teal-300 text-xs font-bold transition-all border border-white/10 hover:border-white/20 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Main Site</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-plum-300 font-medium">
              <span>Platform Overview</span>
              <ChevronRight className="w-3.5 h-3.5 text-plum-500" />
              <span className="text-peach-300 font-bold">AI Commerce &amp; Marketing</span>
              <ChevronRight className="w-3.5 h-3.5 text-plum-500" />
              <span className="text-white font-bold">Page {activePage} of 3</span>
            </div>
          </div>

          {/* Title Area */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 font-extrabold text-xs tracking-wider uppercase border border-peach-300/30">
              <ShoppingBag className="w-3.5 h-3.5" />
              {currentMeta.badgeText}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {currentMeta.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-1">
              {currentMeta.metaDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Quick-Navigation Bar Across the 3 Pages */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-3 gap-2 no-scrollbar">
            {([1, 2, 3] as AiCommercePageId[]).map((pageId) => {
              const meta = AI_COMMERCE_PAGES_META[pageId];
              const Icon = meta.icon;
              const isActive = activePage === pageId;

              return (
                <button
                  key={pageId}
                  onClick={() => onSelectPage(pageId)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-plum-950 text-white shadow-md ring-2 ring-teal-400/40'
                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                      isActive ? 'bg-teal-400 text-plum-950' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pageId}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-peach-300' : 'text-slate-500'}`} />
                  <span>{meta.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* ==================== PAGE 1: AI COMMERCE & MARKETING PLATFORM ==================== */}
        {activePage === 1 && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Overview Intro */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-100 text-plum-950 text-xs font-extrabold border border-peach-300">
                <Sparkles className="w-3.5 h-3.5 text-plum-800" />
                Sell. Market. Grow. Powered by AI.
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                AI Commerce &amp; Marketing Platform
              </h2>

              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 text-base leading-relaxed">
                <p className="text-lg text-slate-700 font-semibold leading-relaxed bg-slate-50 p-6 rounded-2xl border-l-4 border-plum-800">
                  Modern businesses need more than an ecommerce platform. They need a platform that helps them attract customers, convert visitors into buyers, and build lasting customer relationships.
                </p>

                <p>
                  SilarAI is an AI Commerce &amp; Marketing Platform that combines ecommerce, AI-powered shopping, marketing automation, social media management, and customer engagement into one intelligent solution.
                </p>

                <p>
                  Instead of managing multiple tools for your online store, AI content creation, social media publishing, customer support, and marketing campaigns, SilarAI brings everything together in one platform.
                </p>
              </div>
            </section>

            {/* Why Traditional Commerce Platforms Fall Short */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  The Problem
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Why Traditional Commerce Platforms Fall Short
                </h2>
                <p className="text-slate-600 text-sm">
                  Many businesses rely on separate applications to manage their digital operations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {[
                  { title: 'Ecommerce platform for products and orders', desc: 'Siloed catalog & order data' },
                  { title: 'AI tools for content generation', desc: 'Disconnected writing software' },
                  { title: 'Social media scheduling software', desc: 'Separate posting dashboards' },
                  { title: 'WhatsApp messaging tools', desc: 'Manual messaging channels' },
                  { title: 'Email marketing platforms', desc: 'External list management' },
                  { title: 'Marketing analytics dashboards', desc: 'Scattered performance stats' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-red-50/40 p-4 rounded-2xl border border-red-100/80 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium pl-4">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-plum-950 text-white border border-plum-800 text-sm font-medium leading-relaxed flex items-center gap-3 shadow-md">
                <Zap className="w-6 h-6 text-peach-300 shrink-0 stroke-[2.5]" />
                <span>
                  Managing disconnected systems wastes time, increases costs, and creates inconsistent customer experiences. <strong className="text-peach-300 font-extrabold">SilarAI eliminates this complexity.</strong>
                </span>
              </div>
            </section>

            {/* Everything You Need in One Platform */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Unified Solution
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Everything You Need in One Platform
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'AI Commerce',
                    desc: 'Launch and manage a professional online store with product catalogs, pricing, inventory, customers, and orders.',
                    icon: Store,
                    badge: 'Commerce'
                  },
                  {
                    title: 'AI Shopping Assistant',
                    desc: 'Help customers discover products, compare options, receive instant answers, and make confident purchasing decisions.',
                    icon: Bot,
                    badge: 'Shopping'
                  },
                  {
                    title: 'AI Marketing',
                    desc: 'Generate SEO-friendly product descriptions, blogs, social media posts, promotional campaigns, and marketing emails using AI.',
                    icon: Sparkles,
                    badge: 'Content'
                  },
                  {
                    title: 'Social Media Management',
                    desc: 'Create, schedule, and publish content across Instagram, Facebook, and WhatsApp from the same platform that manages your ecommerce business.',
                    icon: Share2,
                    badge: 'Social'
                  },
                  {
                    title: 'Marketing Automation',
                    desc: 'Launch promotions, seasonal campaigns, customer segments, abandoned cart reminders, and personalized marketing journeys.',
                    icon: Megaphone,
                    badge: 'Automation'
                  },
                  {
                    title: 'Analytics & Insights',
                    desc: 'Track sales performance, AI conversations, marketing campaigns, customer engagement, and conversion metrics from one dashboard.',
                    icon: BarChart3,
                    badge: 'Analytics'
                  }
                ].map((card, i) => {
                  const CardIcon = card.icon;
                  return (
                    <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-3 hover:border-plum-300 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-plum-950 text-peach-300 flex items-center justify-center font-bold shadow-xs">
                          <CardIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-peach-200/80 text-plum-950 px-2.5 py-0.5 rounded-md">
                          {card.badge}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">{card.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{card.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Benefits & Industries Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Benefits */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                    Business Benefits
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">Key Advantages</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Increase ecommerce conversions',
                    'Reduce manual marketing work',
                    'Create content faster with AI',
                    'Improve customer engagement',
                    'Manage commerce and marketing from one platform',
                    'Reduce software costs by consolidating multiple tools',
                    'Scale your business with intelligent automation'
                  ].map((ben, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-800">
                      <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3] mt-0.5" />
                      <span>{ben}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div className="lg:col-span-5 bg-plum-950 text-white rounded-3xl p-8 border border-plum-900 shadow-xl space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-peach-300/20 px-3 py-1 rounded-full border border-peach-300/30">
                    Target Markets
                  </span>
                  <h3 className="text-xl font-extrabold text-white">SilarAI is Designed For</h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    'Manufacturers',
                    'Distributors',
                    'Wholesalers',
                    'D2C Brands',
                    'Retailers',
                    'Ecommerce Businesses'
                  ].map((ind, i) => (
                    <div key={i} className="px-3.5 py-3 rounded-xl bg-plum-900 border border-plum-800 text-white font-bold text-xs flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-300 shrink-0" />
                      <span className="truncate">{ind}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Why Choose SilarAI */}
            <section className="bg-gradient-to-r from-plum-900 to-plum-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-800 shadow-xl space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-peach-300/20 px-3 py-1 rounded-full border border-peach-300/30 inline-block">
                The SilarAI Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Why Choose SilarAI</h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                Unlike traditional ecommerce software, SilarAI combines AI-powered commerce, AI shopping assistance, social media marketing, and business automation into one unified platform.
              </p>
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-peach-300 text-base font-extrabold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-peach-300 shrink-0" />
                <span>You don't just sell products—you create intelligent customer experiences that drive growth.</span>
              </div>
            </section>

            {/* FAQ */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Q&amp;A
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    q: 'What is an AI Commerce & Marketing Platform?',
                    a: 'An AI Commerce & Marketing Platform combines ecommerce, AI-powered shopping, content generation, marketing automation, and customer engagement into one solution.'
                  },
                  {
                    q: 'Can SilarAI manage social media?',
                    a: 'Yes. You can create, schedule, and publish AI-generated marketing content across supported social channels from one platform.'
                  },
                  {
                    q: 'Does SilarAI include an AI Shopping Assistant?',
                    a: 'Yes. Customers receive personalized recommendations, instant product answers, and guided shopping experiences.'
                  },
                  {
                    q: 'Who is SilarAI built for?',
                    a: 'Manufacturers, distributors, wholesalers, retailers, and D2C brands looking to modernize commerce and marketing.'
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-plum-700 shrink-0" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Page Summary Banner & Next CTA */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-bold text-peach-300 uppercase tracking-widest">
                  Ready to Grow?
                </div>
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                  Book a personalized demo and discover how SilarAI helps businesses sell smarter, market faster, and grow with AI.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onBookDemo()}
                  className="bg-peach-300 hover:bg-peach-200 text-plum-950 font-black px-5 py-3 rounded-xl transition-all text-xs cursor-pointer shadow-sm"
                >
                  Book a Demo
                </button>
                <button
                  onClick={() => onSelectPage(2)}
                  className="bg-teal-400 hover:bg-teal-300 text-plum-950 font-extrabold px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-xs cursor-pointer shadow-sm"
                >
                  <span>Next: AI Shopping Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ==================== PAGE 2: AI SHOPPING ASSISTANT ==================== */}
        {activePage === 2 && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Overview Intro */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-900 text-xs font-extrabold border border-teal-200">
                <Bot className="w-3.5 h-3.5 text-teal-700" />
                Turn Every Visitor Into a Confident Buyer
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                AI Shopping Assistant
              </h2>

              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 text-base leading-relaxed">
                <p className="text-lg text-slate-700 font-semibold leading-relaxed bg-slate-50 p-6 rounded-2xl border-l-4 border-teal-500">
                  Today's customers expect instant answers, personalized recommendations, and seamless shopping experiences.
                </p>

                <p>
                  SilarAI's AI Shopping Assistant helps businesses deliver intelligent buying experiences that increase customer satisfaction and improve conversion rates.
                </p>

                <p className="font-bold text-slate-900">
                  Available 24/7, the AI Shopping Assistant guides shoppers from product discovery to checkout.
                </p>
              </div>
            </section>

            {/* What Can the AI Shopping Assistant Do? */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Core Capabilities
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  What Can the AI Shopping Assistant Do?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Intelligent Product Discovery',
                    desc: 'Help customers quickly find products using natural language instead of complex filters.',
                    icon: Search,
                    badge: 'Discovery'
                  },
                  {
                    title: 'Personalized Recommendations',
                    desc: 'Recommend relevant products based on customer intent and shopping behavior.',
                    icon: Sparkles,
                    badge: 'Tailored'
                  },
                  {
                    title: 'Product Comparisons',
                    desc: 'Help shoppers compare products, features, specifications, and pricing.',
                    icon: Layers3,
                    badge: 'Comparison'
                  },
                  {
                    title: 'Instant Answers',
                    desc: 'Answer questions about products, shipping, availability, sizing, warranties, and more.',
                    icon: MessageSquare,
                    badge: '24/7 Support'
                  },
                  {
                    title: 'Upselling & Cross-selling',
                    desc: 'Recommend complementary products that increase average order value.',
                    icon: TrendingUp,
                    badge: 'Revenue'
                  },
                  {
                    title: 'AI Product Search',
                    desc: 'Replace traditional keyword search with conversational AI search.',
                    icon: BrainCircuit,
                    badge: 'Smart Search'
                  }
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-3 hover:border-plum-300 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-plum-950 text-peach-300 flex items-center justify-center font-bold shadow-xs">
                          <ItemIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Business Benefits & Integrations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Business Benefits */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                    Proven Impact
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">Business Benefits</h3>
                </div>

                <div className="space-y-2.5">
                  {[
                    'Increase conversion rates',
                    'Reduce cart abandonment',
                    'Improve customer satisfaction',
                    'Reduce support workload',
                    'Deliver 24/7 customer assistance',
                    'Increase average order value'
                  ].map((ben, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-extrabold text-slate-800">
                      <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <span>{ben}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              <div className="lg:col-span-6 bg-plum-950 text-white rounded-3xl p-8 border border-plum-900 shadow-xl space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-peach-300/20 px-3 py-1 rounded-full border border-peach-300/30">
                    Compatibility
                  </span>
                  <h3 className="text-xl font-extrabold text-white">Works With Your Existing Store</h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Integrate SilarAI with your existing ecommerce platform without rebuilding your website.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">Compatible Platforms:</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      'Shopify',
                      'WooCommerce',
                      'Adobe Commerce',
                      'Magento',
                      'Custom Ecommerce'
                    ].map((plat, i) => (
                      <div key={i} className="p-3 rounded-xl bg-plum-900 border border-plum-800 text-white font-bold text-xs flex items-center gap-2">
                        <Store className="w-4 h-4 text-peach-300 shrink-0" />
                        <span>{plat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Industries */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Sectors
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Industries Served</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  'Manufacturing',
                  'Distribution',
                  'Wholesale',
                  'Retail',
                  'Fashion',
                  'Electronics',
                  'Healthcare',
                  'Home & Living'
                ].map((ind, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center font-extrabold text-slate-800 text-xs">
                    {ind}
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Q&amp;A
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    q: 'What is an AI Shopping Assistant?',
                    a: 'An AI Shopping Assistant helps customers discover products, answers questions, and provides personalized recommendations throughout the buying journey.'
                  },
                  {
                    q: 'Can it integrate with my existing ecommerce platform?',
                    a: 'Yes. SilarAI integrates with leading ecommerce platforms and custom websites.'
                  },
                  {
                    q: 'Can it answer product questions?',
                    a: 'Yes. It uses your product information to provide accurate responses and recommendations.'
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Why Choose SilarAI & Call to Action */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-bold text-peach-300 uppercase tracking-widest">
                  Start Selling Smarter
                </div>
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                  Add an AI Shopping Assistant to your online store and deliver exceptional shopping experiences.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onSelectPage(1)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-xl transition-all text-xs cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={() => onSelectPage(3)}
                  className="bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-xs shadow-sm cursor-pointer"
                >
                  <span>Next: Marketing Automation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ==================== PAGE 3: AI COMMERCE MARKETING AUTOMATION ==================== */}
        {activePage === 3 && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Header Intro */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-100 text-plum-950 text-xs font-extrabold border border-peach-300">
                <Share2 className="w-3.5 h-3.5 text-plum-800" />
                Create, Publish, and Grow—Without Leaving Your Commerce Platform
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                AI Commerce Marketing Automation
              </h2>

              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 text-base leading-relaxed">
                <p className="text-lg text-slate-700 font-semibold leading-relaxed bg-slate-50 p-6 rounded-2xl border-l-4 border-plum-800">
                  Marketing should work alongside your ecommerce business—not in separate applications.
                </p>

                <p>
                  SilarAI combines AI-powered content creation, social media publishing, promotions, and customer engagement into one integrated marketing workspace.
                </p>
              </div>
            </section>

            {/* Create Marketing Content with AI & Social Media Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Content Generation */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                    AI Content Creation
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">Create Marketing Content with AI</h3>
                  <p className="text-xs text-slate-600 font-medium">Generate professional marketing content in seconds.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Product descriptions',
                    'SEO content',
                    'Blog articles',
                    'Facebook posts',
                    'Instagram captions',
                    'WhatsApp campaigns',
                    'Promotional offers',
                    'Email marketing content'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-800">
                      <Sparkles className="w-4 h-4 text-plum-700 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div className="lg:col-span-5 bg-plum-950 text-white rounded-3xl p-8 border border-plum-900 shadow-xl space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-peach-300/20 px-3 py-1 rounded-full border border-peach-300/30">
                    Multi-Channel
                  </span>
                  <h3 className="text-xl font-extrabold text-white">Manage Every Marketing Channel</h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Publish and manage campaigns across your digital channels from one platform.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Instagram',
                    'Facebook',
                    'WhatsApp',
                    'Your Ecommerce Store'
                  ].map((ch, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-plum-900 border border-plum-800 text-white font-bold text-xs flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-teal-300 shrink-0" />
                      <span>{ch}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white/10 text-peach-300 text-xs font-extrabold text-center border border-white/10">
                  No switching between multiple applications.
                </div>
              </div>

            </div>

            {/* Campaign Management & Promotions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  AI Campaign Management
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Campaign Execution</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  Launch seasonal promotions, product launches, discount campaigns, and marketing initiatives using AI-assisted content and scheduling.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  AI-Powered Promotions
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Create Compelling Promotions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'New arrivals',
                    'Flash sales',
                    'Holiday campaigns',
                    'Clearance events',
                    'Personalized customer offers'
                  ].map((prom, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-800 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{prom}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Benefits List */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                  Value Creation
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Marketing Benefits</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Reduce content creation time',
                  'Maintain consistent branding',
                  'Publish across multiple channels',
                  'Increase customer engagement',
                  'Improve marketing productivity',
                  'Generate more traffic to your ecommerce store'
                ].map((ben, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{ben}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Why Businesses Choose SilarAI */}
            <section className="bg-plum-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-900 shadow-xl space-y-6 text-center">
              <div className="max-w-3xl mx-auto space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-peach-300/20 px-3 py-1 rounded-full border border-peach-300/30">
                  Consolidated Technology
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Why Businesses Choose SilarAI</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                  Instead of purchasing separate ecommerce, AI writing, social media, and marketing tools, SilarAI provides everything in one intelligent platform.
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-2">
                  <div className="p-4 rounded-2xl bg-plum-900 border border-plum-800 text-peach-300 font-black text-sm">One dashboard.</div>
                  <div className="p-4 rounded-2xl bg-plum-900 border border-plum-800 text-teal-300 font-black text-sm">One AI.</div>
                  <div className="p-4 rounded-2xl bg-plum-900 border border-plum-800 text-white font-black text-sm">One platform.</div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Q&amp;A
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    q: 'Can AI generate marketing content?',
                    a: 'Yes. SilarAI creates product descriptions, promotional campaigns, social media posts, blogs, and marketing copy.'
                  },
                  {
                    q: 'Can I manage Instagram and Facebook?',
                    a: 'Yes. SilarAI helps you create and manage marketing content for supported social channels from a unified workspace.'
                  },
                  {
                    q: 'Does marketing work with my ecommerce store?',
                    a: 'Yes. Products, promotions, campaigns, and AI-generated content are connected to your commerce platform.'
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Grow Faster CTA */}
            <section className="bg-gradient-to-br from-plum-950 via-plum-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-800 shadow-2xl space-y-8 text-center relative overflow-hidden">
              <div className="max-w-3xl mx-auto space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 font-extrabold text-xs uppercase tracking-wider border border-peach-300/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Grow Faster with AI
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Grow Faster with AI
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Transform your ecommerce business into a complete AI-powered commerce and marketing operation with SilarAI.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => onBookDemo()}
                    className="w-full sm:w-auto bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-peach-300/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Book Your Demo</span>
                    <ArrowRight className="w-4 h-4 text-plum-950" />
                  </button>

                  <button
                    onClick={onBackToHome}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-4 rounded-xl transition-all border border-white/20 cursor-pointer"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

      </div>
    </div>
  );
};
