import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Zap,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Bot,
  ShoppingBag,
  Building2,
  Globe,
  Layers,
  Search,
  Check,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Users,
  Compass,
  Cpu,
  Star,
  BrainCircuit,
  Share2
} from 'lucide-react';

export type AiShoppingPageId = 1 | 2 | 3;

interface AiShoppingAssistantPagesProps {
  activePage: AiShoppingPageId;
  onSelectPage: (pageId: AiShoppingPageId) => void;
  onBackToHome: () => void;
  onBookDemo: (plan?: string) => void;
}

export const AI_SHOPPING_PAGES_META = {
  1: {
    id: 1 as AiShoppingPageId,
    slug: 'what-is-an-ai-shopping-assistant',
    title: 'What is an AI Shopping Assistant?',
    navTitle: '1. What is an AI Shopping Assistant?',
    shortTitle: 'What is it?',
    metaTitle: 'What Is an AI Shopping Assistant? Complete Guide for Modern Commerce | SilarAI',
    metaDescription:
      'Learn how AI Shopping Assistants help businesses improve product discovery, personalize customer experiences, increase conversions, and support both B2B and B2C commerce.',
    icon: BookOpen,
    badgeText: 'Complete Guide'
  },
  2: {
    id: 2 as AiShoppingPageId,
    slug: 'ai-shopping-assistant-features-and-benefits',
    title: 'AI Shopping Assistant Features & Benefits',
    navTitle: '2. Features & Benefits',
    shortTitle: 'Features & Benefits',
    metaTitle: 'AI Shopping Assistant Features That Improve Customer Experience | SilarAI',
    metaDescription:
      'Explore the key features of an AI Shopping Assistant, including product recommendations, conversational search, multilingual support, product comparison, and intelligent customer engagement.',
    icon: Zap,
    badgeText: 'Capabilities & Impact'
  },
  3: {
    id: 3 as AiShoppingPageId,
    slug: 'how-ai-shopping-assistants-help-businesses-grow',
    title: 'How AI Shopping Assistants Help Businesses Grow',
    navTitle: '3. Help Businesses Grow',
    shortTitle: 'Business Growth',
    metaTitle: 'How AI Shopping Assistants Increase Sales and Customer Engagement | SilarAI',
    metaDescription:
      'Discover how AI Shopping Assistants help businesses improve customer engagement, increase conversions, reduce support costs, and deliver personalized commerce experiences.',
    icon: TrendingUp,
    badgeText: 'ROI & Conversion Engine'
  }
};

export const AiShoppingAssistantPages: React.FC<AiShoppingAssistantPagesProps> = ({
  activePage,
  onSelectPage,
  onBackToHome,
  onBookDemo
}) => {
  const currentMeta = AI_SHOPPING_PAGES_META[activePage];
  const [selectedFeature, setSelectedFeature] = useState<string>('Conversational Shopping');

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
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

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
              <span>Footer Knowledge Base</span>
              <ChevronRight className="w-3.5 h-3.5 text-plum-500" />
              <span className="text-peach-300 font-bold">AI Shopping Assistant</span>
              <ChevronRight className="w-3.5 h-3.5 text-plum-500" />
              <span className="text-white font-bold">Page {activePage} of 3</span>
            </div>
          </div>

          {/* Title Area */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 font-extrabold text-xs tracking-wider uppercase border border-peach-300/30">
              <Sparkles className="w-3.5 h-3.5" />
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
            {([1, 2, 3] as AiShoppingPageId[]).map((pageId) => {
              const meta = AI_SHOPPING_PAGES_META[pageId];
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
        
        {/* ==================== PAGE 1: WHAT IS AN AI SHOPPING ASSISTANT? ==================== */}
        {activePage === 1 && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Overview Box */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                <Bot className="w-3.5 h-3.5 text-teal-600" />
                Definition & Concept
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                What is an AI Shopping Assistant?
              </h2>

              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 text-base leading-relaxed">
                <p className="text-lg text-slate-700 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border-l-4 border-plum-800">
                  An <strong>AI Shopping Assistant</strong> is an intelligent software solution that helps customers discover, compare, and purchase products through natural, conversational interactions. Instead of relying on keyword searches and complex navigation, customers can simply describe what they need and receive personalized recommendations based on their intent.
                </p>

                <p>
                  Modern AI Shopping Assistants combine conversational AI, product knowledge, business rules, and commerce capabilities to guide customers throughout their buying journey. They can answer product questions, recommend suitable products, compare alternatives, explain technical specifications, and assist customers from discovery to checkout.
                </p>
              </div>
            </section>

            {/* Why Businesses Need AI Shopping Assistants */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Business Value
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Why Businesses Need AI Shopping Assistants
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Traditional ecommerce websites often rely on menus, filters, and search boxes. While these tools are useful, they may not always help customers who are unsure what they need or who are comparing multiple products.
                </p>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  An AI Shopping Assistant creates a guided buying experience by understanding customer intent and providing relevant recommendations in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    title: 'Improve Product Discovery',
                    desc: 'Help customers easily surface hard-to-find items in large catalogs without guessing filter combinations.',
                    icon: Search
                  },
                  {
                    title: 'Personalized Recommendations',
                    desc: 'Deliver real-time tailored product suggestions based on customer requirements and intent.',
                    icon: Sparkles
                  },
                  {
                    title: 'Reduce Support Requests',
                    desc: 'Instantly resolve routine customer questions about dimensions, compatibility, or policies 24/7.',
                    icon: ShieldCheck
                  },
                  {
                    title: 'Increase Conversion Rates',
                    desc: 'Guide buyers smoothly from initial question to confident add-to-cart or quote request.',
                    icon: TrendingUp
                  },
                  {
                    title: 'Support Customers 24/7',
                    desc: 'Never miss an inquiry during off-hours, ensuring global round-the-clock sales support.',
                    icon: Globe
                  },
                  {
                    title: 'Simplify Decisions',
                    desc: 'Explain complex specs and differences simply so buyers feel confident moving forward.',
                    icon: Layers
                  }
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 hover:border-plum-300 transition-all hover:shadow-sm space-y-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-plum-950 text-teal-300 flex items-center justify-center font-bold">
                        <ItemIcon className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* How an AI Shopping Assistant Works */}
            <section className="bg-plum-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-900 shadow-xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-peach-300/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2 relative z-10">
                <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-peach-300/20 px-3 py-1 rounded-full border border-peach-300/30">
                  Step-by-Step Mechanism
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  How an AI Shopping Assistant Works
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                {[
                  { step: '1', title: 'Connect Catalog', desc: 'Connects to your product catalog.' },
                  { step: '2', title: 'Understand Intent', desc: 'Understands customer questions using natural language.' },
                  { step: '3', title: 'Match Products', desc: 'Matches customer intent with relevant products.' },
                  { step: '4', title: 'Explain Specs', desc: 'Explains product differences and recommendations.' },
                  { step: '5', title: 'Guide Purchase', desc: 'Guides customers toward inquiry or purchase.' }
                ].map((st, i) => (
                  <div key={i} className="bg-plum-900/80 rounded-2xl p-5 border border-plum-800 space-y-2 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-lg bg-teal-400 text-plum-950 text-xs font-black flex items-center justify-center">
                      {st.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm mt-2">{st.title}</h3>
                      <p className="text-xs text-plum-200 mt-1 leading-relaxed">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Benefits & FAQ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Benefits Checklist */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                    Key Outcomes
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">Core Benefits</h3>
                </div>

                <ul className="space-y-3.5">
                  {[
                    'Faster product discovery',
                    'Better customer engagement',
                    'Higher conversion potential',
                    'Reduced support workload',
                    'Improved shopping experience',
                    'Scalable customer assistance'
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Frequently Asked Questions */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                    Q&A
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: 'What is an AI Shopping Assistant?',
                      a: 'An AI Shopping Assistant is conversational software that helps customers discover and purchase products using natural language.'
                    },
                    {
                      q: 'How is it different from a chatbot?',
                      a: 'Unlike traditional chatbots that follow predefined scripts, AI Shopping Assistants understand customer intent and provide personalized product guidance.'
                    },
                    {
                      q: 'Can it work for B2B businesses?',
                      a: 'Yes. AI Shopping Assistants are valuable for manufacturers, distributors, wholesalers, and retailers where products are often complex and buying journeys involve multiple decision-makers.'
                    }
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-plum-700 shrink-0" />
                        <span>{faq.q}</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Summary Banner */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-bold text-peach-300 uppercase tracking-widest">
                  Page Summary
                </div>
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                  An AI Shopping Assistant transforms traditional online shopping into an intelligent buying experience by helping customers discover products, compare options, and make confident purchasing decisions.
                </p>
              </div>

              <button
                onClick={() => onSelectPage(2)}
                className="bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-xs shrink-0 shadow-sm cursor-pointer"
              >
                <span>Next: Features & Benefits</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ==================== PAGE 2: FEATURES & BENEFITS ==================== */}
        {activePage === 2 && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Overview Intro */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-100 text-plum-950 text-xs font-extrabold border border-peach-300">
                <Zap className="w-3.5 h-3.5 text-plum-800" />
                Capabilities & Technology
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                AI Shopping Assistant Features
              </h2>

              <p className="text-lg text-slate-700 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border-l-4 border-teal-500">
                An AI Shopping Assistant combines artificial intelligence with commerce technology to create a smarter shopping experience for customers and a more efficient sales process for businesses.
              </p>
            </section>

            {/* Core Features */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                    Platform Capabilities
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Included Features & Short Descriptions
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-semibold max-w-xs">
                  Click any feature section below to view its short description and capability details.
                </p>
              </div>

              {/* Active Selected Feature Banner */}
              {selectedFeature && (
                <div className="bg-plum-950 text-white p-6 rounded-2xl border border-plum-800 shadow-lg space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-peach-300 text-plum-950 text-xs font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Active Feature Spotlight</span>
                    </div>
                    <span className="text-[10px] text-plum-300 font-mono">
                      Selected: {selectedFeature}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-peach-300">
                    {selectedFeature}
                  </h3>
                  <p className="text-sm text-slate-100 font-medium leading-relaxed bg-plum-900/80 p-4 rounded-xl border border-plum-800">
                    {
                      {
                        'Conversational Shopping': 'Shop naturally by asking questions instead of searching through menus.',
                        'Product Recommendations': 'Get AI-picked products based on your needs, preferences, and budget.',
                        'Product Comparison': 'Instantly compare products by features, price, specifications, and benefits.',
                        'FAQ Automation': 'Receive instant answers to product, shipping, returns, warranty, and policy questions 24/7.',
                        'Customer Memory': 'AI remembers your preferences, past purchases, and conversations for faster assistance.',
                        'WhatsApp Integration': 'Continue shopping, receive recommendations, and track orders directly through WhatsApp.',
                        'Multilingual AI': 'Chat in your preferred language with natural, accurate responses.',
                        'Personalized Suggestions': 'Discover products tailored to your shopping history, interests, and buying behavior.'
                      }[selectedFeature] || 'Explore conversational features.'
                    }
                  </p>
                </div>
              )}

              {/* 8 Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    title: 'Conversational Shopping',
                    shortDesc: 'Shop naturally by asking questions instead of searching through menus.',
                    icon: MessageSquare,
                    badge: 'Natural Search'
                  },
                  {
                    title: 'Product Recommendations',
                    shortDesc: 'Get AI-picked products based on your needs, preferences, and budget.',
                    icon: Sparkles,
                    badge: 'Smart Curation'
                  },
                  {
                    title: 'Product Comparison',
                    shortDesc: 'Instantly compare products by features, price, specifications, and benefits.',
                    icon: Layers,
                    badge: 'Spec Matrix'
                  },
                  {
                    title: 'FAQ Automation',
                    shortDesc: 'Receive instant answers to product, shipping, returns, warranty, and policy questions 24/7.',
                    icon: HelpCircle,
                    badge: '24/7 Instant'
                  },
                  {
                    title: 'Customer Memory',
                    shortDesc: 'AI remembers your preferences, past purchases, and conversations for faster assistance.',
                    icon: BrainCircuit,
                    badge: 'Context AI'
                  },
                  {
                    title: 'WhatsApp Integration',
                    shortDesc: 'Continue shopping, receive recommendations, and track orders directly through WhatsApp.',
                    icon: Share2,
                    badge: 'Omnichannel'
                  },
                  {
                    title: 'Multilingual AI',
                    shortDesc: 'Chat in your preferred language with natural, accurate responses.',
                    icon: Globe,
                    badge: 'Global'
                  },
                  {
                    title: 'Personalized Suggestions',
                    shortDesc: 'Discover products tailored to your shopping history, interests, and buying behavior.',
                    icon: Compass,
                    badge: 'Tailored'
                  }
                ].map((feat, idx) => {
                  const FeatIcon = feat.icon;
                  const isSelected = selectedFeature === feat.title;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedFeature(feat.title)}
                      className={`text-left rounded-2xl p-5 border transition-all duration-200 cursor-pointer space-y-3 flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-plum-900 text-white border-plum-700 shadow-md ring-2 ring-peach-300'
                          : 'bg-slate-50/90 text-slate-900 hover:bg-peach-50/60 border-slate-200 hover:border-plum-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs transition-colors ${
                            isSelected ? 'bg-peach-300 text-plum-950' : 'bg-plum-950 text-teal-300'
                          }`}>
                            <FeatIcon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-plum-950 text-peach-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {feat.badge}
                          </span>
                        </div>

                        <h3 className={`font-extrabold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {feat.title}
                        </h3>

                        <p className={`text-xs leading-relaxed font-medium ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                          {feat.shortDesc}
                        </p>
                      </div>

                      <div className={`pt-2 border-t text-[11px] font-extrabold flex items-center gap-1 ${
                        isSelected ? 'border-plum-800 text-peach-300' : 'border-slate-200/80 text-plum-700 group-hover:text-plum-900'
                      }`}>
                        <span>{isSelected ? 'Currently Viewing' : 'Click to Select'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Business Benefits & Best Industries */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Business Benefits */}
              <div className="lg:col-span-6 bg-plum-950 text-white rounded-3xl p-8 border border-plum-900 shadow-xl space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-peach-300/20 px-3 py-1 rounded-full border border-peach-300/30">
                    Impact
                  </span>
                  <h3 className="text-xl font-extrabold text-white">Business Benefits</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Increase customer engagement',
                    'Improve conversion rates',
                    'Reduce support costs',
                    'Increase average order value',
                    'Improve product discoverability',
                    'Deliver consistent experiences'
                  ].map((ben, i) => (
                    <div key={i} className="bg-plum-900/80 p-3.5 rounded-xl border border-plum-800 flex items-center gap-2.5 text-xs text-slate-200 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{ben}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Industries */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                    Sectors
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">Best Industries</h3>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {[
                    'Manufacturing',
                    'Distribution',
                    'Wholesale',
                    'Retail',
                    'Medical Devices',
                    'Consumer Electronics',
                    'Automotive Components'
                  ].map((ind, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-xs border border-slate-200 flex items-center gap-2"
                    >
                      <Building2 className="w-3.5 h-3.5 text-plum-700" />
                      <span>{ind}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Q&A
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    q: 'Can AI recommend products?',
                    a: 'Yes. Recommendations are based on customer intent, product information, and business rules.'
                  },
                  {
                    q: 'Can AI answer technical questions?',
                    a: 'Yes. When connected to product documentation and knowledge bases, AI can provide detailed, context-aware responses.'
                  },
                  {
                    q: 'Does AI replace sales teams?',
                    a: 'No. AI complements sales teams by handling routine inquiries and qualifying leads before human engagement.'
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Page Summary Banner */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-bold text-teal-300 uppercase tracking-widest">
                  Page Summary
                </div>
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                  An AI Shopping Assistant combines conversational AI, intelligent search, and personalized recommendations to improve customer experiences and support business growth.
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
                  <span>Next: Business Growth</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ==================== PAGE 3: HOW AI SHOPPING ASSISTANTS HELP BUSINESSES GROW ==================== */}
        {activePage === 3 && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Overview Header */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-extrabold border border-teal-200">
                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                Growth Engine & Conversion
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                AI Shopping Assistants for Business Growth
              </h2>

              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 text-base leading-relaxed">
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                  Today's customers expect immediate answers, personalized recommendations, and a seamless buying experience. Businesses that deliver these experiences are better positioned to build trust, improve customer satisfaction, and increase sales.
                </p>

                <p className="text-slate-700 bg-slate-50 p-5 rounded-2xl border-l-4 border-plum-800 font-medium">
                  An AI Shopping Assistant helps organizations meet these expectations by combining conversational AI with intelligent commerce capabilities.
                </p>
              </div>
            </section>

            {/* Business Challenges vs How SilarAI Helps */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Challenges */}
              <div className="lg:col-span-6 bg-red-50/40 rounded-3xl p-8 border border-red-100 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full">
                    Current Obstacles
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">Business Challenges</h3>
                </div>

                <ul className="space-y-3 text-sm text-slate-700">
                  {[
                    'Large product catalogs that are difficult to navigate',
                    'Customers abandoning purchases before checkout',
                    'High volumes of repetitive support questions',
                    'Difficulty guiding customers to the right products',
                    'Limited sales support outside business hours'
                  ].map((ch, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-red-100 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">✕</span>
                      <span className="font-medium">{ch}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* How SilarAI Helps */}
              <div className="lg:col-span-6 bg-teal-50/40 rounded-3xl p-8 border border-teal-100 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
                    SilarAI Solution
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">How SilarAI Helps</h3>
                </div>

                <ul className="space-y-3 text-sm text-slate-700">
                  {[
                    'Provide 24/7 customer assistance',
                    'Recommend relevant products based on customer intent',
                    'Simplify complex buying journeys',
                    'Improve online engagement',
                    'Support both B2B and B2C commerce',
                    'Scale customer interactions without increasing support costs'
                  ].map((sol, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">✓</span>
                      <span className="font-semibold">{sol}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Real World Example Use Case */}
            <section className="bg-plum-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-900 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-peach-300/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2 relative z-10">
                <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-peach-300/20 px-3 py-1 rounded-full border border-peach-300/30">
                  Real-World Scenario
                </span>
                <h3 className="text-2xl font-extrabold text-white">Example Use Case</h3>
              </div>

              <div className="bg-plum-900/90 rounded-2xl p-6 sm:p-8 border border-plum-800 space-y-4 relative z-10">
                <p className="text-sm sm:text-base text-plum-100 leading-relaxed">
                  A manufacturing company offers thousands of industrial products. Instead of browsing multiple categories, a customer asks:
                </p>

                <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-teal-400/40 font-mono text-xs sm:text-sm text-teal-300 flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-peach-300 shrink-0" />
                  <span>"I need a corrosion-resistant valve for chemical processing."</span>
                </div>

                <p className="text-sm text-plum-200 leading-relaxed">
                  The AI Shopping Assistant understands the request, identifies suitable products, explains key differences, and suggests the best options based on the customer's requirements.
                </p>
              </div>
            </section>

            {/* Why Choose SilarAI */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Competitive Advantage
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Why Choose SilarAI</h3>
              </div>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200">
                SilarAI combines an AI Shopping Assistant with a modern Commerce Platform, enabling businesses to deliver intelligent buying experiences without replacing their existing commerce systems.
              </p>
            </section>

            {/* FAQ */}
            <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700 bg-plum-50 px-3 py-1 rounded-full">
                  Q&A
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    q: 'Is an AI Shopping Assistant suitable for small businesses?',
                    a: 'Yes. Businesses of all sizes can improve customer engagement and streamline product discovery using AI.'
                  },
                  {
                    q: 'Can it integrate with existing ecommerce platforms?',
                    a: 'Yes. AI Shopping Assistants can complement existing ecommerce websites and commerce platforms.'
                  },
                  {
                    q: 'How does it improve customer experience?',
                    a: 'By providing instant, personalized, and context-aware assistance throughout the buying journey.'
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-plum-700 shrink-0" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Final Call to Action */}
            <section className="bg-gradient-to-br from-plum-950 via-plum-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-800 shadow-2xl space-y-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-1/3 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-3xl mx-auto space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 font-extrabold text-xs uppercase tracking-wider border border-peach-300/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ready to Grow
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Final Call to Action
                </h2>

                <p className="text-lg text-teal-200 font-semibold">
                  Ready to transform your online shopping experience?
                </p>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Discover how SilarAI helps businesses build smarter commerce experiences with AI-powered product discovery, conversational shopping, and personalized customer engagement.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => onBookDemo()}
                    className="w-full sm:w-auto bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-peach-300/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Book a Demo</span>
                    <ArrowRight className="w-4 h-4 text-plum-950" />
                  </button>

                  <button
                    onClick={onBackToHome}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-4 rounded-xl transition-all border border-white/20 cursor-pointer"
                  >
                    Explore Main Site
                  </button>
                </div>
              </div>
            </section>

            {/* Page Summary Banner */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs font-bold text-teal-300 uppercase tracking-widest">
                  Page Summary
                </div>
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                  AI Shopping Assistants help businesses improve customer engagement, simplify purchasing decisions, and create personalized commerce experiences that support sustainable business growth.
                </p>
              </div>

              <button
                onClick={() => onSelectPage(2)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-xl transition-all text-xs shrink-0 cursor-pointer"
              >
                Prev: Features & Benefits
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
