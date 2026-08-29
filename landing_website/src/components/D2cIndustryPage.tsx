import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Bot,
  Search,
  TrendingUp,
  Layers,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Users,
  RefreshCw,
  Target,
  ShoppingCart,
  Percent,
  Check,
  Globe,
  Share2,
  Cpu,
  BarChart3,
  HelpCircle,
  ShieldCheck,
  Gift,
  PackageCheck,
  Send,
  Smartphone,
  Eye,
  Store,
  ChevronDown,
  Calculator,
  Sliders,
  DollarSign,
  Award,
  Network,
  GitBranch,
  Workflow,
  ExternalLink,
  Link,
  Compass,
  CornerDownRight,
  Activity
} from 'lucide-react';

export interface D2cIndustryPageProps {
  onBackToHome: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
  onNavigateAiShoppingAssistant?: (subPage?: number) => void;
  onNavigateAiCommercePlatform?: (subPage?: number) => void;
  onNavigateD2cSection?: (sectionIdOrPage: string | number) => void;
  initialSection?: string;
}

export const D2cIndustryPage: React.FC<D2cIndustryPageProps> = ({
  onBackToHome,
  onBookDemo,
  onNavigateAiShoppingAssistant,
  onNavigateAiCommercePlatform,
  onNavigateD2cSection,
  initialSection,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'shopping-assistant' | 'commerce-platform' | 'increase-sales' | 'roi-calculator'>('all');
  const [selectedArchitectureNode, setSelectedArchitectureNode] = useState<string>('ai-shopping-assistant');

  // 9 Semantic Topic Hubs in the D2C Interlinking Architecture Tree
  const architectureTreeNodes = [
    {
      id: 'ai-shopping-assistant',
      name: 'AI Shopping Assistant',
      badge: 'Discovery & Consultation',
      icon: Bot,
      category: 'Conversational Guided Shopping',
      tagline: 'Natural Language Search & Multi-Attribute Intent Parsing',
      role: 'Eliminates keyword search dead-ends by guiding shoppers through natural dialogue, skin/fit parameters, and real-time SKU matching.',
      upstream: 'Inbound Paid Ads (Meta/Google) & Direct Store Visitors',
      downstream: 'AI Product Recommendations & Frictionless 1-Click Cart Addition',
      metric: '+35% Conversion Lift',
      connectedNodes: ['AI Product Recommendations', 'AI Sales Assistant', 'Conversational Commerce'],
      anchor: 'shopping-assistant',
      externalType: 'assistant' as const,
      externalId: 1,
    },
    {
      id: 'ai-commerce-platform',
      name: 'AI Commerce Platform',
      badge: 'Core Infrastructure',
      icon: Layers,
      category: 'Full-Stack Commerce & Knowledge Engine',
      tagline: 'End-to-End Customer Journey & Storefront Integration',
      role: 'Unifies your storefront catalog, vector embeddings, real-time inventory states, and checkout APIs across all D2C touchpoints.',
      upstream: 'Product Catalog Feeds (Shopify, WooCommerce, Custom REST APIs)',
      downstream: 'D2C Industry Page, WhatsApp Sales, & Analytics Layer',
      metric: '15-Min 1-Click Setup',
      connectedNodes: ['Ecommerce AI', 'D2C Industry Page', 'AI Shopping Assistant'],
      anchor: 'commerce-platform',
      externalType: 'commerce' as const,
      externalId: 1,
    },
    {
      id: 'ai-sales-assistant',
      name: 'AI Sales Assistant',
      badge: 'Objection Handling',
      icon: Users,
      category: '24/7 Digital Sales Consultation',
      tagline: 'Real-Time Objection Resolution & Spec Comparisons',
      role: 'Acts as an expert 24/7 brand sales associate, comparing specifications, answering warranty questions, and building buyer confidence.',
      upstream: 'On-Page Hesitation Signals & Product Questions',
      downstream: 'Confident Checkout & Reduced Return Rates',
      metric: '<3s Instant Resolution',
      connectedNodes: ['AI Shopping Assistant', 'Conversational Commerce', 'Increase D2C Sales With AI'],
      anchor: 'shopping-assistant',
      externalType: 'assistant' as const,
      externalId: 2,
    },
    {
      id: 'conversational-commerce',
      name: 'Conversational Commerce',
      badge: 'Engagement Channel',
      icon: MessageSquare,
      category: 'Two-Way Interactive Shopping',
      tagline: 'Interactive Buying on Web & Messaging Apps',
      role: 'Replaces passive grid browsing with high-touch conversational interaction, answering multi-part questions directly.',
      upstream: 'Customer Inquiries & Natural Language Queries',
      downstream: 'Instant SKU Selection & Seamless Payment Links',
      metric: '3.8x Higher Engagement',
      connectedNodes: ['WhatsApp AI Sales', 'AI Product Recommendations', 'AI Cart Recovery'],
      anchor: 'shopping-assistant',
      externalType: 'assistant' as const,
      externalId: 3,
    },
    {
      id: 'ai-product-recommendations',
      name: 'AI Product Recommendations',
      badge: 'Merchandising AI',
      icon: Target,
      category: 'Hyper-Personalized Bundles & Cross-Sells',
      tagline: 'Contextual Bundles & Smart Upselling',
      role: 'Analyzes user needs, previous behaviors, and catalog pairings to generate dynamic routines and high-converting cross-sells.',
      upstream: 'AI Shopping Assistant & Customer Intent Embeddings',
      downstream: 'AI Commerce Platform & Expanded Basket Size',
      metric: '+28% Higher AOV',
      connectedNodes: ['AI Commerce Platform', 'AI Shopping Assistant', 'Increase D2C Sales With AI'],
      anchor: 'shopping-assistant',
      externalType: 'commerce' as const,
      externalId: 2,
    },
    {
      id: 'ai-cart-recovery',
      name: 'AI Cart Recovery',
      badge: 'Retention Engine',
      icon: ShoppingCart,
      category: 'Proactive Cart Abandonment Recovery',
      tagline: 'Exit-Intent Resolution & WhatsApp Cart Revivals',
      role: 'Detects exit intent on-site to address doubts in real time, and triggers automated WhatsApp reminder flows with single-tap checkout.',
      upstream: 'Abandoned Checkout Sessions & Incomplete Carts',
      downstream: 'Recovered Revenue & Higher Marketing ROAS',
      metric: '4.2x Recovery vs Email',
      connectedNodes: ['WhatsApp AI Sales', 'Conversational Commerce', 'D2C Industry Page'],
      anchor: 'increase-sales',
      externalType: 'commerce' as const,
      externalId: 3,
    },
    {
      id: 'whatsapp-ai-sales',
      name: 'WhatsApp AI Sales',
      badge: 'Mobile Commerce',
      icon: Smartphone,
      category: 'Omnichannel WhatsApp Commerce',
      tagline: 'Direct WhatsApp Sales & Automated Reorders',
      role: 'Allows customers to browse products, receive personalized recommendations, and complete orders directly inside WhatsApp.',
      upstream: 'Conversational Commerce & Re-engagement Triggers',
      downstream: 'Frictionless Repeat Orders & Instant UPI Payments',
      metric: '85%+ Message Open Rate',
      connectedNodes: ['AI Cart Recovery', 'Conversational Commerce', 'Increase D2C Sales With AI'],
      anchor: 'increase-sales',
    },
    {
      id: 'ecommerce-ai',
      name: 'Ecommerce AI',
      badge: 'Intelligence Layer',
      icon: Cpu,
      category: 'Semantic Ingestion & Zero-Hallucination AI',
      tagline: 'Grounded Catalog Vectors & Real-Time Sync',
      role: 'Extracts deep semantic vectors from SKU specifications, variant matrices, and reviews with zero hallucinations.',
      upstream: 'Shopify / WooCommerce / Custom REST APIs',
      downstream: 'AI Commerce Platform & Grounded Product Matching',
      metric: '100% SKU Accuracy',
      connectedNodes: ['AI Commerce Platform', 'AI Shopping Assistant', 'D2C Industry Page'],
      anchor: 'commerce-platform',
    },
    {
      id: 'increase-d2c-sales',
      name: 'Increase D2C Sales With AI',
      badge: 'Growth Playbook',
      icon: TrendingUp,
      category: '9 Strategic Revenue Levers',
      tagline: 'Compounding Revenue Growth & ROI Model',
      role: 'Applies 9 data-backed levers across discovery, conversion rate, basket size, and retention to scale monthly recurring revenue.',
      upstream: 'Full-Funnel Commerce Intelligence & Connected Architecture',
      downstream: 'D2C Industry Page → Book Demo & Rapid Implementation',
      metric: '+₹4.5L+ Monthly Uplift',
      connectedNodes: ['D2C Industry Page', 'Book Demo', 'AI Shopping Assistant'],
      anchor: 'increase-sales',
    },
  ];

  // Interactive states for Live Shopping Assistant Demo
  const [demoQuery, setDemoQuery] = useState<string>('Which moisturizer is best for dry, sensitive skin?');
  const [demoResponse, setDemoResponse] = useState<{
    userText: string;
    intent: string;
    productRecommendation: string;
    price: string;
    rating: string;
    explanation: string;
    bundleSuggestion: string;
  }>({
    userText: 'Which moisturizer is best for dry, sensitive skin?',
    intent: 'Dry Skin Hydration & Barrier Repair (Fragrance-Free)',
    productRecommendation: 'Hydra-Barrier 5X Ceramide Cream (50ml)',
    price: '₹1,299',
    rating: '4.9 ★ (1,420 reviews)',
    explanation:
      'Formulated with 5 essential skin-identical ceramides, centella asiatica, and hyaluronic acid to replenish lipid moisture for 48 hours without clogging pores. 100% fragrance-free and clinically dermatologically tested.',
    bundleSuggestion: 'Pair with Gentle Oat Hydrating Cleanser for 15% bundle savings (Total: ₹1,899)',
  });

  const demoPresets = [
    {
      query: 'Which moisturizer is best for dry, sensitive skin?',
      intent: 'Dry Skin Hydration & Barrier Repair (Fragrance-Free)',
      productRecommendation: 'Hydra-Barrier 5X Ceramide Cream (50ml)',
      price: '₹1,299',
      rating: '4.9 ★ (1,420 reviews)',
      explanation:
        'Formulated with 5 essential skin-identical ceramides, centella asiatica, and hyaluronic acid to replenish lipid moisture for 48 hours without clogging pores. 100% fragrance-free and dermatologically tested.',
      bundleSuggestion: 'Pair with Gentle Oat Hydrating Cleanser for 15% bundle savings (Total: ₹1,899)',
    },
    {
      query: 'I need a lightweight daily sunscreen that does not leave a white cast or feel greasy.',
      intent: 'Daily UV Protection & Matte/Invisible Finish',
      productRecommendation: 'Invisible Fluid Sunscreen SPF 50+ PA++++ (50g)',
      price: '₹849',
      rating: '4.8 ★ (2,850 reviews)',
      explanation:
        'Water-light gel formulation with new-gen UV filters and niacinamide. Blends transparently on all skin tones with zero white cast and controls midday shine for 8+ hours.',
      bundleSuggestion: 'Pair with Vitamin C Brightening Serum for complete photo-aging defense (Save ₹350)',
    },
    {
      query: 'I am looking for a thoughtful anniversary gift under ₹3,000 for coffee lovers.',
      intent: 'Curated Gifting & Specialty Coffee Set',
      productRecommendation: 'Artisan Pour-Over Barista Gift Box',
      price: '₹2,699',
      rating: '5.0 ★ (890 reviews)',
      explanation:
        'Includes double-wall borosilicate dripper, hand-crank conical burr grinder, and 250g estate single-origin beans in custom gold-foiled luxury gift packaging with a handwritten note option.',
      bundleSuggestion: 'Add insulated ceramic travel mug for just ₹499 (Standard price: ₹899)',
    },
    {
      query: 'I run 5km daily on pavement. What shoes offer the best knee cushioning?',
      intent: 'Road Running & Joint Shock Absorption',
      productRecommendation: 'CloudStride Pro Max Road Cushion (Size 9-11 in stock)',
      price: '₹4,499',
      rating: '4.9 ★ (3,120 reviews)',
      explanation:
        'Engineered with dual-density nitrogen-infused foam and anatomical arch support to absorb 42% more pavement impact, protecting knees and Achilles tendons over daily 5K–10K runs.',
      bundleSuggestion: 'Add 3-pack anti-blister technical running socks for ₹599',
    },
  ];

  // Interactive ROI Calculator State
  const [monthlyVisitors, setMonthlyVisitors] = useState<number>(45000);
  const [currentConversionRate, setCurrentConversionRate] = useState<number>(1.8);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(2200);

  // Computed ROI
  const currentOrders = Math.round((monthlyVisitors * currentConversionRate) / 100);
  const currentMonthlyRevenue = currentOrders * avgOrderValue;

  // With SilarAI uplift (+35% conversion lift, +25% AOV with intelligent discovery & bundles)
  const aiConversionRate = +(currentConversionRate * 1.35).toFixed(2);
  const aiAOV = Math.round(avgOrderValue * 1.22);
  const aiOrders = Math.round((monthlyVisitors * aiConversionRate) / 100);
  const aiMonthlyRevenue = aiOrders * aiAOV;
  const monthlyRevenueGain = aiMonthlyRevenue - currentMonthlyRevenue;
  const annualRevenueGain = monthlyRevenueGain * 12;

  // FAQ Accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How can AI increase D2C ecommerce sales?',
      a: 'AI increases D2C ecommerce sales by transforming static store browsing into dynamic, conversational shopping journeys. SilarAI guides shoppers to the right products in seconds (+35% conversion lift), suggests hyper-contextual bundle recommendations (+28% higher AOV), resolves pre-purchase doubts instantaneously (<3s response), and triggers automated WhatsApp cart recovery workflows with 1-click checkout links.',
    },
    {
      q: 'What is an AI shopping assistant?',
      a: 'An AI shopping assistant is an intelligent conversational agent integrated directly into your D2C ecommerce store. Unlike simplistic rule-based bots, SilarAI understands complex multi-attribute natural language queries (e.g., "gentle niacinamide serum for oily acne-prone skin under $35"), compares product specifications, answers ingredient and sizing questions, and assists shoppers all the way through payment.',
    },
    {
      q: 'How does AI product recommendation work?',
      a: 'SilarAI uses semantic vector search and real-time behavioral embeddings rather than generic static popularity filters. It analyzes customer intent, preferences, skin/fit parameters, previous purchases, and catalog metadata to recommend the exact SKUs in stock that match the customer’s precise needs.',
    },
    {
      q: 'How can D2C brands use AI for ecommerce?',
      a: 'D2C brands can deploy AI across the entire sales funnel: 1) AI-powered search and guided product discovery on the website, 2) 24/7 conversational sales assistance that overcomes buyer hesitation, 3) automated cross-selling and bundle recommendations at cart, 4) omnichannel WhatsApp conversational commerce, and 5) post-purchase order tracking and automated replenishment reminders.',
    },
    {
      q: 'How does conversational commerce improve conversion?',
      a: 'Conversational commerce eliminates the paradox of choice. When shoppers are faced with 50+ similar products and complex filters, bounce rates skyrocket. An AI sales assistant actively asks clarifying questions, narrows choices down to 2-3 tailored options, and explains why each product fits, increasing checkout completion rates by up to 35%.',
    },
    {
      q: 'What is the best AI shopping assistant for D2C brands?',
      a: 'SilarAI is purpose-built as the leading AI Shopping Assistant and Commerce Platform for D2C brands. It features 15-minute 1-click integrations for Shopify and WooCommerce, zero-hallucination grounded catalog ingestion, 20+ language support, real-time inventory synchronization, and native WhatsApp commerce workflows.',
    },
    {
      q: 'How can AI reduce ecommerce cart abandonment?',
      a: 'AI reduces cart abandonment in two ways: On-site, it detects hesitation or exit intent and proactively answers doubts about shipping, sizing, or returns before the visitor leaves. Post-abandonment, it sends personalized, conversational WhatsApp and SMS reminders featuring the exact items in their cart with single-tap instant checkout.',
    },
    {
      q: 'How does SilarAI integrate with my current Shopify or WooCommerce store?',
      a: 'SilarAI connects in under 15 minutes via our native Shopify App, WooCommerce plugin, or custom REST/GraphQL APIs. It automatically ingests your product catalog, real-time inventory, variants, prices, and reviews without requiring any code changes to your theme or storefront.',
    },
    {
      q: 'Does SilarAI replace my existing website or checkout?',
      a: 'No, SilarAI acts as an intelligent commerce overlay on your existing website and WhatsApp channel. It enhances your current store with conversational discovery, intelligent search, instant Q&A, and direct add-to-cart actions, while your existing payment gateway (Razorpay, Stripe, Cashfree, PayPal) processes orders securely.',
    },
  ];

  const [activeSection, setActiveSection] = useState<string>('shopping-assistant');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['shopping-assistant', 'commerce-platform', 'increase-sales', 'interlinking-architecture', 'roi-calculator'];
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAnchor = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-peach-300 selection:text-plum-950">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-plum-950 text-white border-b border-plum-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-plum-300">
            <button
              onClick={onBackToHome}
              className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-plum-400">Industries</span>
            <span>/</span>
            <span className="text-peach-300 font-bold">D2C Brands</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum-800/80 border border-peach-300/30 text-[11px] font-bold text-peach-300">
              <Sparkles className="w-3 h-3 text-peach-300" />
              <span>Complete D2C Commerce &amp; Growth Guide</span>
            </span>
            <button
              onClick={() => onBookDemo('D2C Master Experience Header')}
              className="px-4 py-1.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-lg transition-colors cursor-pointer"
            >
              Book Demo
            </button>
          </div>
        </div>
      </div>

      {/* TOP OF PAGE: Primary 3-Chapter Navigation & Exploration Switcher */}
      <div className="bg-plum-900/95 text-white border-b border-plum-700/80 shadow-lg sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 text-xs font-bold shrink-0">
            <span className="text-peach-300 font-black text-[11px] uppercase tracking-wider mr-1 hidden lg:inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guide Navigation:</span>
            </span>
            
            <button
              onClick={() => scrollToAnchor('shopping-assistant')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                activeSection === 'shopping-assistant'
                  ? 'bg-peach-300 text-plum-950 font-black shadow-md ring-2 ring-peach-200'
                  : 'bg-plum-800/80 text-slate-200 hover:bg-plum-700 hover:text-white border border-plum-700/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${activeSection === 'shopping-assistant' ? 'bg-plum-950 text-peach-300' : 'bg-plum-950/60 text-slate-300'}`}>
                1
              </span>
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span>AI Shopping Assistant</span>
            </button>

            <button
              onClick={() => scrollToAnchor('commerce-platform')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                activeSection === 'commerce-platform'
                  ? 'bg-peach-300 text-plum-950 font-black shadow-md ring-2 ring-peach-200'
                  : 'bg-plum-800/80 text-slate-200 hover:bg-plum-700 hover:text-white border border-plum-700/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${activeSection === 'commerce-platform' ? 'bg-plum-950 text-peach-300' : 'bg-plum-950/60 text-slate-300'}`}>
                2
              </span>
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>AI Commerce Platform</span>
            </button>

            <button
              onClick={() => scrollToAnchor('increase-sales')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                activeSection === 'increase-sales'
                  ? 'bg-peach-300 text-plum-950 font-black shadow-md ring-2 ring-peach-200'
                  : 'bg-plum-800/80 text-slate-200 hover:bg-plum-700 hover:text-white border border-plum-700/60'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${activeSection === 'increase-sales' ? 'bg-plum-950 text-peach-300' : 'bg-plum-950/60 text-slate-300'}`}>
                3
              </span>
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Increase Sales (9 Levers)</span>
            </button>

            <button
              onClick={() => scrollToAnchor('roi-calculator')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeSection === 'roi-calculator'
                  ? 'bg-emerald-400 text-slate-950 font-black shadow-md ring-2 ring-emerald-300'
                  : 'bg-plum-950/60 text-peach-200 hover:bg-plum-800 border border-peach-300/30'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span>ROI Calculator</span>
            </button>

            <button
              onClick={() => scrollToAnchor('interlinking-architecture')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeSection === 'interlinking-architecture'
                  ? 'bg-peach-300 text-plum-950 font-black shadow-md ring-2 ring-peach-200'
                  : 'bg-plum-950/60 text-peach-200 hover:bg-plum-800 border border-peach-300/30'
              }`}
            >
              <Network className="w-3.5 h-3.5 shrink-0" />
              <span>Architecture Map</span>
            </button>
          </div>

          <button
            onClick={() => onBookDemo('D2C Top Navigation Bar')}
            className="shrink-0 px-4 py-1.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl transition-all cursor-pointer hidden sm:flex items-center gap-1.5 shadow-sm"
          >
            <span>Book Demo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Hero Master Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-plum-950 via-plum-900 to-slate-900 text-white py-12 sm:py-20">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-peach-300/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-300/10 border border-peach-300/30 text-peach-300 text-xs font-black uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Direct-to-Consumer Commerce Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              AI Commerce Platform <br />
              <span className="text-peach-300">for D2C Brands</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
              From conversational shopping assistants and intelligent storefronts to 9 proven AI growth levers — explore the complete blueprint for high-growth direct-to-consumer brands to guide visitors, increase conversions, and maximize customer lifetime value.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onBookDemo('D2C Hero CTA')}
                className="px-8 py-4 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-xl shadow-peach-300/10 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Request Custom D2C Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToAnchor('shopping-assistant')}
                className="px-6 py-4 bg-plum-800/80 hover:bg-plum-700/80 text-white font-bold text-sm rounded-xl border border-plum-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore 3-Part Guide Below</span>
                <ChevronDown className="w-4 h-4 text-peach-300" />
              </button>
            </div>
          </div>

          {/* Interactive 3-Chapter Clickable Exploration Cards at Top of Page */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-black uppercase tracking-wider text-peach-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Click to Navigate Any Chapter Instantly</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <button
                onClick={() => scrollToAnchor('shopping-assistant')}
                className="p-5 rounded-2xl bg-plum-900/60 hover:bg-plum-800/90 border border-plum-700/80 hover:border-peach-300/80 text-left transition-all group cursor-pointer space-y-3 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-peach-300 text-plum-950 font-black text-xs flex items-center justify-center shadow-xs">
                      01
                    </span>
                    <span className="text-[11px] font-bold text-peach-300 bg-plum-950/80 px-2 py-0.5 rounded-md border border-plum-800">
                      Guided Shopping
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-peach-300 transition-colors flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-peach-300" />
                    <span>AI Shopping Assistant</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Interactive live discovery demo, multi-attribute parsing, SKU matching, and instant technical Q&amp;A.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-peach-300 group-hover:translate-x-1 transition-transform">
                  <span>Read Chapter 1</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 2 */}
              <button
                onClick={() => scrollToAnchor('commerce-platform')}
                className="p-5 rounded-2xl bg-plum-900/60 hover:bg-plum-800/90 border border-plum-700/80 hover:border-peach-300/80 text-left transition-all group cursor-pointer space-y-3 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-peach-300 text-plum-950 font-black text-xs flex items-center justify-center shadow-xs">
                      02
                    </span>
                    <span className="text-[11px] font-bold text-peach-300 bg-plum-950/80 px-2 py-0.5 rounded-md border border-plum-800">
                      Full Platform
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-peach-300 transition-colors flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-peach-300" />
                    <span>AI Commerce Platform</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Full-funnel customer journey, vector catalog knowledge layer, and 15-minute Shopify/WooCommerce sync.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-peach-300 group-hover:translate-x-1 transition-transform">
                  <span>Read Chapter 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 3 */}
              <button
                onClick={() => scrollToAnchor('increase-sales')}
                className="p-5 rounded-2xl bg-plum-900/60 hover:bg-plum-800/90 border border-plum-700/80 hover:border-peach-300/80 text-left transition-all group cursor-pointer space-y-3 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-peach-300 text-plum-950 font-black text-xs flex items-center justify-center shadow-xs">
                      03
                    </span>
                    <span className="text-[11px] font-bold text-peach-300 bg-plum-950/80 px-2 py-0.5 rounded-md border border-plum-800">
                      Growth Levers
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-peach-300 transition-colors flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-peach-300" />
                    <span>Increase Sales (9 Levers)</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    9 strategic growth levers including cart recovery, dynamic upselling, WhatsApp commerce, and ROI model.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-peach-300 group-hover:translate-x-1 transition-transform">
                  <span>Read Chapter 3</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-plum-800/80">
            <div className="bg-plum-900/40 border border-plum-800/60 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-peach-300">+35%</div>
              <div className="text-xs font-bold text-white mt-1">Conversion Uplift</div>
              <div className="text-[11px] text-plum-300">Guided shopping vs. static browse</div>
            </div>

            <div className="bg-plum-900/40 border border-plum-800/60 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-peach-300">+28%</div>
              <div className="text-xs font-bold text-white mt-1">Higher AOV</div>
              <div className="text-[11px] text-plum-300">Contextual bundling &amp; cross-sells</div>
            </div>

            <div className="bg-plum-900/40 border border-plum-800/60 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-peach-300">&lt; 3s</div>
              <div className="text-xs font-bold text-white mt-1">Instant Q&amp;A</div>
              <div className="text-[11px] text-plum-300">Grounded catalog specifications</div>
            </div>

            <div className="bg-plum-900/40 border border-plum-800/60 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-peach-300">4.2x</div>
              <div className="text-xs font-bold text-white mt-1">WhatsApp ROAS</div>
              <div className="text-[11px] text-plum-300">Conversational recovery workflows</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Flow Container */}
      <main className="space-y-24 py-8">
        {/* ========================================================================= */}
        {/* CHAPTER 1: AI Shopping Assistant for D2C Brands                           */}
        {/* ========================================================================= */}
        <section id="shopping-assistant" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Chapter Header */}
          <div className="space-y-4 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-100 text-plum-950 text-xs font-black uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-plum-900" />
              <span>Chapter 01 • Conversational Guided Shopping</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              AI Shopping Assistant for D2C Brands
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
              Turn every website visitor into a guided shopper. Move beyond passive catalogs to an active AI assistant that understands buyer requirements, compares products, answers questions, and guides checkouts.
            </p>
          </div>

          {/* Interactive Live Shopping Demo */}
          <div className="bg-gradient-to-br from-plum-950 via-plum-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-8 border border-plum-800">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-plum-800 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-peach-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Shopping Experience Demo</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  See How Customers Shop With SilarAI
                </h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-plum-800 text-plum-200 font-medium">
                Live Simulation
              </span>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Choose a customer scenario:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {demoPresets.map((preset, idx) => {
                  const isSelected = demoQuery === preset.query;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setDemoQuery(preset.query);
                        setDemoResponse({ ...preset, userText: preset.query });
                      }}
                      className={`p-3 rounded-xl text-left text-xs font-semibold transition-all border cursor-pointer space-y-1 ${
                        isSelected
                          ? 'bg-peach-300 text-plum-950 border-peach-300 shadow-md font-bold'
                          : 'bg-plum-900/60 text-slate-200 border-plum-800 hover:bg-plum-800'
                      }`}
                    >
                      <div className="line-clamp-2">{preset.query}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live Dialogue Box */}
            <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6">
              {/* User Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  You
                </div>
                <div className="bg-slate-800 text-white rounded-2xl rounded-tl-none p-4 text-sm max-w-xl shadow-xs">
                  "{demoResponse.userText}"
                </div>
              </div>

              {/* AI Bubble with rich commerce card */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-peach-300 flex items-center justify-center text-xs font-black text-plum-950 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="bg-plum-950 border border-plum-800 rounded-2xl rounded-tl-none p-5 text-sm space-y-4 max-w-2xl shadow-lg">
                  <div className="flex items-center justify-between border-b border-plum-800/80 pb-2">
                    <span className="text-xs font-extrabold text-peach-300 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Identified Intent: {demoResponse.intent}</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
                      In Stock • Ready to Ship
                    </span>
                  </div>

                  <p className="text-slate-200 leading-relaxed font-normal">
                    {demoResponse.explanation}
                  </p>

                  {/* SKU Card */}
                  <div className="bg-plum-900/80 border border-plum-700/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-black text-white text-base">
                        {demoResponse.productRecommendation}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-peach-300 font-extrabold text-sm">{demoResponse.price}</span>
                        <span className="text-slate-300">{demoResponse.rating}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onBookDemo('D2C Shopping Assistant Demo Click')}
                      className="px-4 py-2 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart (1-Click)</span>
                    </button>
                  </div>

                  {/* Contextual Bundle suggestion */}
                  <div className="p-3 bg-plum-900/40 rounded-xl border border-peach-300/30 text-xs text-peach-200 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-peach-300 shrink-0" />
                    <span><strong>Proactive Cross-Sell:</strong> {demoResponse.bundleSuggestion}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities Grid: AI That Understands How Customers Shop */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">
                AI That Understands How Modern Customers Shop
              </h3>
              <p className="text-sm sm:text-base text-slate-600">
                SilarAI combines your catalog attributes, inventory statuses, pricing rules, formulas, and reviews into an active knowledge layer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'Natural Language Understanding',
                  desc: 'Parses complex multi-attribute requests like "non-greasy SPF 50 sunscreen for humid weather under ₹1,000".',
                },
                {
                  title: 'Deep Intent Detection',
                  desc: 'Detects lifestyle goals, skin sensitivities, budget ceilings, and specific sizing constraints automatically.',
                },
                {
                  title: 'Grounded SKU Matching',
                  desc: 'Matches exact in-stock variants, preventing customer disappointment and out-of-stock drop-offs.',
                },
                {
                  title: 'Instant Technical Q&A',
                  desc: 'Answers questions on ingredients, fabric weights, battery life, warranties, and return policies in seconds.',
                },
                {
                  title: 'Side-by-Side Comparisons',
                  desc: 'Clarifies why one product variant fits a specific use-case better than another without marketing fluff.',
                },
                {
                  title: 'Frictionless Cart Guidance',
                  desc: 'Reduces hesitation by presenting social proof, warranty guarantees, and immediate 1-click checkout options.',
                },
              ].map((cap, cIdx) => (
                <div
                  key={cIdx}
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 hover:border-plum-400 hover:bg-white transition-all shadow-xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">{cap.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side: Traditional vs. Conversational Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Traditional Ecommerce Funnel (Low Conversion)
              </span>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs font-bold text-slate-700">
                <div className="flex items-center justify-between">
                  <span>1. Visitor Lands</span> → <span>2. Keyword Search</span> → <span>3. Browse Catalog</span> → <span>4. Drop-off</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers get overwhelmed by filters and lack answers for specific concerns, causing 97%+ of visitors to bounce without buying.
              </p>
            </div>

            <div className="bg-plum-950 text-white rounded-3xl p-6 sm:p-8 space-y-4 border border-plum-800 shadow-lg">
              <span className="text-xs font-black uppercase text-peach-300 tracking-wider">
                SilarAI Conversational Commerce (High Conversion)
              </span>
              <div className="p-4 bg-plum-900 rounded-2xl border border-plum-700 space-y-2 text-xs font-black text-peach-200">
                <div className="flex items-center justify-between">
                  <span className="text-white">1. Ask Intent</span> → <span className="text-peach-300">2. Grounded AI</span> → <span className="text-peach-300">3. Match SKU</span> → <span className="text-emerald-400">4. Direct Buy</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct conversational guidance removes doubt, provides tailored recommendations, and boosts conversions by up to 35%.
              </p>
            </div>
          </div>
        </section>

        {/* CONNECTING BRIDGE: AI Shopping Assistant → AI Product Recommendations → AI Commerce Platform */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="bg-gradient-to-r from-plum-950 via-plum-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-plum-800 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-plum-800 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-300/10 border border-peach-300/30 text-[11px] font-black uppercase text-peach-300 tracking-wider">
                  <Target className="w-3 h-3" />
                  <span>Contextual Interlink Flow • Step 01 ➔ Step 02</span>
                </span>
                <h4 className="text-lg sm:text-2xl font-black text-white">
                  AI Shopping Assistant <span className="text-peach-300">→</span> AI Product Recommendations
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onNavigateAiShoppingAssistant) {
                      onNavigateAiShoppingAssistant(1);
                    } else {
                      scrollToAnchor('shopping-assistant');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-plum-800 hover:bg-plum-700 text-xs font-bold text-slate-200 rounded-lg border border-plum-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 text-peach-300" />
                  <span>Deep Dive: Shopping Assistant</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  As the AI Shopping Assistant extracts buyer preferences in natural language (e.g. <em>"night routine for oily skin prone to hyperpigmentation"</em>), it triggers the <strong>AI Product Recommendations</strong> engine to construct custom bundles, complementary cross-sells, and variant pairings in real time.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400">Contextual Keywords &amp; Sub-modules:</span>
                  <button
                    onClick={() => scrollToAnchor('shopping-assistant')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #AI-Sales-Assistant
                  </button>
                  <button
                    onClick={() => scrollToAnchor('shopping-assistant')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #Conversational-Commerce
                  </button>
                  <button
                    onClick={() => scrollToAnchor('commerce-platform')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #AI-Product-Recommendations
                  </button>
                  <button
                    onClick={() => scrollToAnchor('commerce-platform')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #Ecommerce-AI
                  </button>
                </div>
              </div>

              <div className="md:col-span-4 bg-plum-950/90 p-4 rounded-2xl border border-plum-700 space-y-3">
                <div className="text-xs font-black text-peach-300 uppercase tracking-wider">
                  Next Step in Commerce Chain:
                </div>
                <div className="text-xs text-slate-300 leading-snug">
                  Connect recommended SKUs directly to the vector catalog knowledge graph in Chapter 2.
                </div>
                <button
                  onClick={() => scrollToAnchor('commerce-platform')}
                  className="w-full py-2.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Explore AI Commerce Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHAPTER 2: AI-Powered Commerce Platform for D2C Brands                     */}
        {/* ========================================================================= */}
        <section id="commerce-platform" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Chapter Header */}
          <div className="space-y-4 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-100 text-plum-950 text-xs font-black uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-plum-900" />
              <span>Chapter 02 • Full-Stack Commerce Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              AI-Powered Commerce Platform for D2C Brands
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
              Build, sell, and scale across every direct-to-consumer channel. SilarAI unifies your ecommerce storefront, WhatsApp commerce, vector catalog knowledge, and marketing intelligence into a single high-converting platform.
            </p>
          </div>

          {/* 6 Full-Funnel Stages of the Customer Journey */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">
                Full-Funnel AI Across Every Stage of the Customer Journey
              </h3>
              <p className="text-sm text-slate-600">
                Deliver intelligent assistance from initial discovery all the way to post-purchase retention.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  step: '01',
                  title: 'Discover',
                  desc: 'Help customers discover exact product matches through natural conversational queries and visual suggestions.',
                },
                {
                  step: '02',
                  title: 'Explore',
                  desc: 'Answer in-depth questions regarding formulations, materials, sizing charts, and brand certifications.',
                },
                {
                  step: '03',
                  title: 'Compare',
                  desc: 'Provide side-by-side spec and value comparisons between your brand and legacy alternatives.',
                },
                {
                  step: '04',
                  title: 'Decide',
                  desc: 'Overcome objections with social proof, customer ratings, return policy assurances, and warranty details.',
                },
                {
                  step: '05',
                  title: 'Purchase',
                  desc: 'Execute seamless 1-click cart additions, dynamic bundle discounts, and fast checkout redirections.',
                },
                {
                  step: '06',
                  title: 'Re-engage',
                  desc: 'Recover abandoned carts and drive repeat subscriptions via personalized WhatsApp and email workflows.',
                },
              ].map((stage, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-plum-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-plum-950 text-peach-300 font-black text-xs flex items-center justify-center">
                      {stage.step}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stage {stage.step}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{stage.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product Catalog to AI Knowledge Layer Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6 border border-slate-800 shadow-xl">
            <div className="space-y-3 max-w-3xl">
              <span className="text-xs font-black uppercase tracking-wider text-peach-300 bg-plum-900 px-3 py-1 rounded-full border border-plum-700">
                Vector Catalog Intelligence
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Turn Your Product Catalog Into an AI Knowledge Layer
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Traditional ecommerce stores store static database fields. SilarAI transforms your product descriptions, ingredients, sizing matrices, usage manuals, and customer reviews into a real-time semantic knowledge graph.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs text-center font-bold text-slate-200">
              {['Formulations & Specs', 'Ingredients & Fabrics', 'Real-Time Inventory', 'Variant Matrices', 'Usage & Tutorials', 'Customer Reviews'].map((item, i) => (
                <div key={i} className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  {item}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-2xl space-y-1.5 border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Conventional Keyword Search:</span>
                <p className="text-slate-300 font-mono text-xs">"running shoes size 10"</p>
                <p className="text-[11px] text-slate-400">
                  Returns generic 200+ list without understanding running surface or cushion requirements.
                </p>
              </div>

              <div className="bg-plum-950 p-4 rounded-2xl space-y-1.5 border border-plum-700 shadow-md">
                <span className="text-[10px] font-bold text-peach-300 uppercase">SilarAI Semantic Understanding:</span>
                <p className="text-peach-200 font-bold text-xs">
                  "I have flat feet and run on road pavement. What provides the best stability?"
                </p>
                <p className="text-emerald-400 text-[11px] font-semibold">
                  Understands biomechanical intent + matches stability foam SKUs in size 10 immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Integration Ecosystem: Shopify, WooCommerce, Custom APIs */}
          <div className="bg-plum-50/70 border border-plum-200 rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-plum-950 bg-peach-300 px-3 py-1 rounded-full">
                  Zero Infrastructure Replacement
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  Connects Natively With Your Existing Tech Stack
                </h3>
              </div>
              <span className="text-xs font-bold text-plum-900 bg-white px-3.5 py-1.5 rounded-full border border-plum-200 shadow-2xs">
                15-Minute One-Click Setup
              </span>
            </div>

            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              You do not have to rebuild your storefront or migrate databases. SilarAI connects seamlessly as an intelligence layer on top of your existing ecommerce platform and tools:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-800">
              <div className="p-3.5 bg-white rounded-2xl border border-plum-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Shopify &amp; Shopify Plus</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-plum-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>WooCommerce</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-plum-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Custom Headless APIs</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-plum-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>WhatsApp Business API</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-plum-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Razorpay &amp; Stripe</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-plum-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Shiprocket &amp; Delhivery</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-plum-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Klaviyo &amp; Omnisend</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-plum-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Meta Ads &amp; Google Feed</span>
              </div>
            </div>
          </div>
        </section>

        {/* CONNECTING BRIDGE: AI Product Recommendations → AI Commerce Platform → D2C Industry Page */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="bg-gradient-to-r from-plum-950 via-slate-900 to-plum-950 text-white rounded-3xl p-6 sm:p-8 border border-plum-800 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-plum-800 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-300/10 border border-peach-300/30 text-[11px] font-black uppercase text-peach-300 tracking-wider">
                  <Layers className="w-3 h-3" />
                  <span>Contextual Interlink Flow • Step 02 ➔ Step 03 ➔ Step 04</span>
                </span>
                <h4 className="text-lg sm:text-2xl font-black text-white">
                  AI Product Recommendations <span className="text-peach-300">→</span> AI Commerce Platform <span className="text-peach-300">→</span> D2C Industry Page
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onNavigateAiCommercePlatform) {
                      onNavigateAiCommercePlatform(1);
                    } else {
                      scrollToAnchor('commerce-platform');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-plum-800 hover:bg-plum-700 text-xs font-bold text-slate-200 rounded-lg border border-plum-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 text-peach-300" />
                  <span>Deep Dive: Commerce Platform</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  The recommendations engine links seamlessly into the <strong>AI Commerce Platform</strong> layer, synchronizing variant matrices, stock buffers, and Shopify/WooCommerce webhooks in 15 minutes. This foundation enables D2C brands to deploy the <strong>9 strategic growth levers</strong> outlined in Chapter 3.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400">Contextual Keywords &amp; Levers:</span>
                  <button
                    onClick={() => scrollToAnchor('commerce-platform')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #AI-Commerce-Platform
                  </button>
                  <button
                    onClick={() => scrollToAnchor('increase-sales')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #AI-Cart-Recovery
                  </button>
                  <button
                    onClick={() => scrollToAnchor('increase-sales')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #WhatsApp-AI-Sales
                  </button>
                  <button
                    onClick={() => scrollToAnchor('roi-calculator')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #Increase-D2C-Sales-With-AI
                  </button>
                </div>
              </div>

              <div className="md:col-span-4 bg-plum-950/90 p-4 rounded-2xl border border-plum-700 space-y-3">
                <div className="text-xs font-black text-peach-300 uppercase tracking-wider">
                  Next Step in Commerce Chain:
                </div>
                <div className="text-xs text-slate-300 leading-snug">
                  Unlock the 9 strategic growth levers including cart recovery and WhatsApp selling workflows.
                </div>
                <button
                  onClick={() => scrollToAnchor('increase-sales')}
                  className="w-full py-2.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Explore 9 Growth Levers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHAPTER 3: How D2C Brands Can Increase Sales With AI (9 Levers)           */}
        {/* ========================================================================= */}
        <section id="increase-sales" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Chapter Header */}
          <div className="space-y-4 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-100 text-plum-950 text-xs font-black uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-plum-900" />
              <span>Chapter 03 • Growth &amp; CRO Blueprint</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How D2C Brands Can Increase Sales With AI
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
              Acquiring paid traffic through Meta and Google Ads is only half the battle. The real revenue multiplier happens after the customer arrives on your store. Here are the 9 strategic growth levers.
            </p>
          </div>

          {/* 9 In-Depth Strategic Levers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Lever 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-plum-100 text-plum-950 font-black text-xs flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[10px] font-extrabold text-plum-700 uppercase bg-plum-50 px-2 py-0.5 rounded-md">Discovery</span>
                </div>
                <h4 className="text-base font-black text-slate-900">1. Instant Product Discovery</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instead of forcing visitors to guess categories or scroll endless pagination, natural conversational search leads them directly to the exact SKU matching their needs.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] font-semibold text-slate-700 border border-slate-200">
                <strong>Impact:</strong> Reduces bounce rate from catalog overwhelm by 32%.
              </div>
            </div>

            {/* Lever 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-plum-100 text-plum-950 font-black text-xs flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">Conversion</span>
                </div>
                <h4 className="text-base font-black text-slate-900">2. Conversion Rate Optimization</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instant answers to "Will this suit my dry skin?", "Is this true to size?", or "What is your return policy?" eliminate purchase hesitation right on the product page.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] font-semibold text-emerald-950 border border-emerald-200">
                <strong>Impact:</strong> Up to +35% direct conversion lift for guided sessions.
              </div>
            </div>

            {/* Lever 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-plum-100 text-plum-950 font-black text-xs flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[10px] font-extrabold text-peach-700 uppercase bg-peach-50 px-2 py-0.5 rounded-md">Basket Size</span>
                </div>
                <h4 className="text-base font-black text-slate-900">3. Contextual Upselling &amp; Bundling</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Recommends complete routines and complementary accessories (e.g., matching cleaner + moisturizer, or camera + tripod) when intent is highest.
                </p>
              </div>
              <div className="p-3 bg-peach-50 rounded-xl text-[11px] font-semibold text-plum-950 border border-peach-200">
                <strong>Impact:</strong> +28% Average Order Value (AOV) increase.
              </div>
            </div>

            {/* Lever 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-plum-100 text-plum-950 font-black text-xs flex items-center justify-center">
                    04
                  </span>
                  <span className="text-[10px] font-extrabold text-red-700 uppercase bg-red-50 px-2 py-0.5 rounded-md">Retention</span>
                </div>
                <h4 className="text-base font-black text-slate-900">4. Intelligent Cart Recovery</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Replaces boring "You left an item" emails with contextual dialogue on WhatsApp addressing the specific sizing or formulation questions that caused the drop-off.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] font-semibold text-slate-700 border border-slate-200">
                <strong>Impact:</strong> 4.2x higher recovery rate compared to generic email blasts.
              </div>
            </div>

            {/* Lever 5 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-plum-100 text-plum-950 font-black text-xs flex items-center justify-center">
                    05
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">Omnichannel</span>
                </div>
                <h4 className="text-base font-black text-slate-900">5. Conversational WhatsApp Selling</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Extend your entire product discovery, recommendations, and payment links directly into WhatsApp where high-intent repeat buyers spend their time.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] font-semibold text-emerald-950 border border-emerald-200">
                <strong>Impact:</strong> 85%+ open rates and friction-free direct reorders.
              </div>
            </div>

            {/* Lever 6 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-plum-100 text-plum-950 font-black text-xs flex items-center justify-center">
                    06
                  </span>
                  <span className="text-[10px] font-extrabold text-plum-700 uppercase bg-plum-50 px-2 py-0.5 rounded-md">Catalog Asset</span>
                </div>
                <h4 className="text-base font-black text-slate-900">6. High-Value Product Knowledge</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unlock the full value of your ingredient certifications, technical specs, and customer reviews by presenting them contextually in answer to buyer doubts.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] font-semibold text-slate-700 border border-slate-200">
                <strong>Impact:</strong> Decreases product returns caused by mismatched expectations.
              </div>
            </div>

            {/* Lever 7 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-plum-100 text-plum-950 font-black text-xs flex items-center justify-center">
                    07
                  </span>
                  <span className="text-[10px] font-extrabold text-plum-700 uppercase bg-plum-50 px-2 py-0.5 rounded-md">Intent Signals</span>
                </div>
                <h4 className="text-base font-black text-slate-900">7. Granular Intent Analytics</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Capture unstructured customer signals ("looking for gifts under ₹2,000", "need fragrance-free") to inform inventory planning and paid ad targeting.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] font-semibold text-slate-700 border border-slate-200">
                <strong>Impact:</strong> Actionable merchandising intelligence for growth leaders.
              </div>
            </div>

            {/* Lever 8 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-plum-100 text-plum-950 font-black text-xs flex items-center justify-center">
                    08
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">Efficiency</span>
                </div>
                <h4 className="text-base font-black text-slate-900">8. Human + AI Support Harmony</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automates 85% of repetitive pre-purchase queries, allowing your human support and sales specialists to focus on VIP clients and custom enterprise orders.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] font-semibold text-emerald-950 border border-emerald-200">
                <strong>Impact:</strong> 24/7 instant response with zero staff burnout.
              </div>
            </div>

            {/* Lever 9 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-plum-100 text-plum-950 font-black text-xs flex items-center justify-center">
                    09
                  </span>
                  <span className="text-[10px] font-extrabold text-peach-700 uppercase bg-peach-50 px-2 py-0.5 rounded-md">Feedback Loop</span>
                </div>
                <h4 className="text-base font-black text-slate-900">9. Continuous Commerce Intelligence</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every conversation refines your recommendation engine, pinpointing emerging consumer trends and high-converting product pairings over time.
                </p>
              </div>
              <div className="p-3 bg-peach-50 rounded-xl text-[11px] font-semibold text-plum-950 border border-peach-200">
                <strong>Impact:</strong> Compounding revenue gains month over month.
              </div>
            </div>
          </div>
        </section>

        {/* CONNECTING BRIDGE: AI Commerce Platform → D2C Industry Page → Book Demo */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="bg-gradient-to-r from-plum-950 via-slate-900 to-plum-950 text-white rounded-3xl p-6 sm:p-8 border border-plum-800 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-plum-800 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-300/10 border border-peach-300/30 text-[11px] font-black uppercase text-peach-300 tracking-wider">
                  <TrendingUp className="w-3 h-3" />
                  <span>Contextual Interlink Flow • Step 03 ➔ Step 04 ➔ Step 05</span>
                </span>
                <h4 className="text-lg sm:text-2xl font-black text-white">
                  AI Commerce Platform <span className="text-peach-300">→</span> D2C Industry Page <span className="text-peach-300">→</span> Book Demo
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollToAnchor('roi-calculator')}
                  className="px-3.5 py-1.5 bg-plum-800 hover:bg-plum-700 text-xs font-bold text-slate-200 rounded-lg border border-plum-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Calculator className="w-3 h-3 text-peach-300" />
                  <span>Calculate Custom ROI</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  With your store connected and 9 growth levers active, your D2C brand experiences up to <strong>+35% conversion lift</strong>, <strong>+28% higher AOV</strong>, and <strong>4.2x WhatsApp ROAS</strong>. Schedule a 15-minute live store trial to test SilarAI directly on your brand's SKU catalog.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400">Contextual Link Targets:</span>
                  <button
                    onClick={() => scrollToAnchor('shopping-assistant')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #AI-Shopping-Assistant
                  </button>
                  <button
                    onClick={() => scrollToAnchor('commerce-platform')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #AI-Commerce-Platform
                  </button>
                  <button
                    onClick={() => scrollToAnchor('interlinking-architecture')}
                    className="px-2.5 py-1 rounded-md bg-plum-800/80 hover:bg-plum-700 text-peach-300 text-[11px] font-bold border border-plum-700 transition-colors cursor-pointer"
                  >
                    #Interlinking-Architecture-Map
                  </button>
                  <button
                    onClick={() => onBookDemo('D2C Chapter 3 Connecting Bridge CTA')}
                    className="px-2.5 py-1 rounded-md bg-peach-300 hover:bg-peach-200 text-plum-950 text-[11px] font-black transition-colors cursor-pointer"
                  >
                    #Book-Demo-Trial
                  </button>
                </div>
              </div>

              <div className="md:col-span-4 bg-plum-950/90 p-4 rounded-2xl border border-plum-700 space-y-3">
                <div className="text-xs font-black text-peach-300 uppercase tracking-wider">
                  Final Step in Journey:
                </div>
                <div className="text-xs text-slate-300 leading-snug">
                  Experience SilarAI configured with your brand's live inventory and store theme in 15 minutes.
                </div>
                <button
                  onClick={() => onBookDemo('D2C Bridge to Demo Booking')}
                  className="w-full py-2.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Book 15-Minute Custom Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DEDICATED SECTION: D2C AI INTERLINKING ARCHITECTURE & SEMANTIC GRAPH      */}
        {/* ========================================================================= */}
        <section id="interlinking-architecture" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-4 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-100 text-plum-950 text-xs font-black uppercase tracking-wider">
              <Network className="w-3.5 h-3.5 text-plum-900" />
              <span>Full Semantic Knowledge Graph &amp; Interlinking</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              D2C Brands AI Interlinking Architecture
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Explore how all 9 core capabilities, conversational touchpoints, vector data flows, and growth modules connect contextually to power high-performing D2C commerce operations.
            </p>
          </div>

          {/* Interactive Semantic Tree Visualizer & Node Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Tree Column */}
            <div className="lg:col-span-5 bg-gradient-to-br from-plum-950 via-slate-900 to-plum-950 rounded-3xl p-6 sm:p-8 text-white border border-plum-800 shadow-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-plum-800 pb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-peach-300" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Interactive Architecture Tree
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-peach-300 bg-plum-900 px-2 py-0.5 rounded border border-plum-700">
                    9 Connected Nodes
                  </span>
                </div>

                <div className="font-mono text-xs text-slate-300 bg-plum-900/60 p-4 rounded-2xl border border-plum-800 space-y-2 select-none">
                  <div className="text-peach-300 font-bold flex items-center gap-1.5 pb-1">
                    <Store className="w-3.5 h-3.5 text-peach-300" />
                    <span>D2C Brands Industry Architecture</span>
                  </div>
                  <div className="text-slate-500 font-semibold pl-2">│</div>

                  {architectureTreeNodes.map((node, index) => {
                    const isSelected = selectedArchitectureNode === node.id;
                    const isLast = index === architectureTreeNodes.length - 1;
                    const IconComp = node.icon;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedArchitectureNode(node.id)}
                        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-peach-300 text-plum-950 font-black shadow-md'
                            : 'hover:bg-plum-800/80 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className={isSelected ? 'text-plum-950 font-black' : 'text-slate-500'}>
                          {isLast ? '└──' : '├──'}
                        </span>
                        <IconComp className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-plum-950' : 'text-peach-300'}`} />
                        <span className="text-xs truncate">{node.name}</span>
                        {isSelected && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-plum-950 animate-pulse shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-plum-800">
                <span>Click any node in tree to inspect links</span>
                <span className="text-peach-300 font-bold">100% Contextual Sync</span>
              </div>
            </div>

            {/* Selected Node Inspector Detail Column */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 flex flex-col justify-between">
              {(() => {
                const activeNodeData =
                  architectureTreeNodes.find((n) => n.id === selectedArchitectureNode) ||
                  architectureTreeNodes[0];
                const IconComp = activeNodeData.icon;

                return (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-plum-100 text-plum-950 flex items-center justify-center font-bold shadow-xs">
                          <IconComp className="w-5 h-5 text-plum-900" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-plum-700 bg-peach-100 px-2 py-0.5 rounded-md">
                            {activeNodeData.badge}
                          </span>
                          <h3 className="text-xl font-black text-slate-900 mt-1">
                            {activeNodeData.name}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Impact Metric</span>
                        <div className="text-sm font-black text-emerald-600">
                          {activeNodeData.metric}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Category:</span>
                        <p className="text-slate-800 font-semibold text-xs mt-0.5">{activeNodeData.category}</p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Functional Role:</span>
                        <p className="text-slate-700 leading-relaxed text-xs mt-0.5">{activeNodeData.role}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-plum-700" />
                            <span>Upstream Data Feed:</span>
                          </span>
                          <p className="text-slate-800 font-medium text-[11px]">{activeNodeData.upstream}</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            <span>Downstream Impact:</span>
                          </span>
                          <p className="text-slate-800 font-medium text-[11px]">{activeNodeData.downstream}</p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Contextually Linked Modules:</span>
                        <div className="flex flex-wrap gap-2">
                          {activeNodeData.connectedNodes.map((cName, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => {
                                const matchNode = architectureTreeNodes.find((n) => n.name === cName);
                                if (matchNode) {
                                  setSelectedArchitectureNode(matchNode.id);
                                }
                              }}
                              className="px-3 py-1 rounded-lg bg-plum-50 hover:bg-plum-100 text-plum-950 font-bold text-xs border border-plum-200 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Link className="w-3 h-3 text-plum-700" />
                              <span>{cName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => scrollToAnchor(activeNodeData.anchor)}
                        className="px-4 py-2 bg-plum-950 hover:bg-plum-900 text-white font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Jump to Section in Guide</span>
                        <ArrowRight className="w-3.5 h-3.5 text-peach-300" />
                      </button>

                      <button
                        onClick={() => onBookDemo(`Architecture Node: ${activeNodeData.name}`)}
                        className="px-4 py-2 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Test in Live Store Trial</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 9-Hub Semantic Matrix Cards */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">
                All 9 D2C Commerce Modules &amp; Interlinks
              </h3>
              <span className="text-xs text-slate-500 font-bold">
                Click any card to inspect and navigate
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {architectureTreeNodes.map((node) => {
                const IconComp = node.icon;
                const isSelected = selectedArchitectureNode === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedArchitectureNode(node.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between shadow-xs ${
                      isSelected
                        ? 'bg-plum-950 text-white border-peach-300 ring-2 ring-peach-300/40 shadow-md'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-plum-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          isSelected ? 'bg-plum-900 text-peach-300' : 'bg-plum-100 text-plum-950'
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-peach-300/20 text-peach-300 border border-peach-300/30' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {node.badge}
                        </span>
                      </div>

                      <h4 className={`text-sm font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {node.name}
                      </h4>

                      <p className={`text-xs leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                        {node.role}
                      </p>
                    </div>

                    <div className={`pt-2 border-t text-[11px] font-bold flex items-center justify-between ${
                      isSelected ? 'border-plum-800 text-peach-300' : 'border-slate-100 text-plum-950'
                    }`}>
                      <span>{node.metric}</span>
                      <span className="flex items-center gap-1">
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE ROI & REVENUE CALCULATOR                                      */}
        {/* ========================================================================= */}
        <section id="roi-calculator" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-gradient-to-br from-plum-950 via-slate-900 to-plum-950 text-white rounded-3xl p-6 sm:p-10 border border-plum-800 shadow-2xl space-y-8">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/10 border border-peach-300/30 text-peach-300 text-xs font-black uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5" />
                <span>Interactive Growth Model</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Estimate Your D2C Revenue Uplift With SilarAI
              </h3>
              <p className="text-sm text-slate-300">
                Adjust your current monthly traffic, conversion rate, and average order value to see the projected commercial impact.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sliders Column */}
              <div className="lg:col-span-7 space-y-6 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
                {/* Slider 1: Monthly Visitors */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Monthly Store Visitors</span>
                    <span className="text-peach-300 text-sm font-black">{monthlyVisitors.toLocaleString()} visits</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="500000"
                    step="5000"
                    value={monthlyVisitors}
                    onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-peach-300"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>5,000</span>
                    <span>250,000</span>
                    <span>500,000+</span>
                  </div>
                </div>

                {/* Slider 2: Conversion Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Current Conversion Rate</span>
                    <span className="text-peach-300 text-sm font-black">{currentConversionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={currentConversionRate}
                    onChange={(e) => setCurrentConversionRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-peach-300"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.5% (Benchmark low)</span>
                    <span>2.0% (Average)</span>
                    <span>5.0% (High)</span>
                  </div>
                </div>

                {/* Slider 3: Average Order Value */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Average Order Value (AOV)</span>
                    <span className="text-peach-300 text-sm font-black">₹{avgOrderValue.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="100"
                    value={avgOrderValue}
                    onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-peach-300"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>₹500</span>
                    <span>₹7,500</span>
                    <span>₹15,000</span>
                  </div>
                </div>
              </div>

              {/* Results Column */}
              <div className="lg:col-span-5 bg-plum-950 p-6 rounded-2xl border border-plum-800 space-y-5">
                <div className="border-b border-plum-800 pb-3">
                  <span className="text-[10px] uppercase font-black text-peach-300 tracking-wider">
                    Projected Commercial Lift
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                    +₹{monthlyRevenueGain.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">/ month</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-plum-900 text-slate-300">
                    <span>Projected Annual Growth:</span>
                    <span className="font-black text-emerald-400 text-sm">+₹{annualRevenueGain.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-plum-900 text-slate-300">
                    <span>New Conversion Rate:</span>
                    <span className="font-bold text-peach-300">{aiConversionRate}% (from {currentConversionRate}%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-plum-900 text-slate-300">
                    <span>New Average Order Value:</span>
                    <span className="font-bold text-peach-300">₹{aiAOV.toLocaleString()} (from ₹{avgOrderValue.toLocaleString()})</span>
                  </div>
                </div>

                <button
                  onClick={() => onBookDemo(`D2C ROI Estimate: +₹${monthlyRevenueGain.toLocaleString()}/mo`)}
                  className="w-full py-3 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Unlock This Revenue With SilarAI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* UNIFIED D2C FAQS                                                          */}
        {/* ========================================================================= */}
        <section id="faqs" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase text-plum-950 bg-peach-300 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h3>
            <p className="text-sm text-slate-600">
              Everything you need to know about implementing SilarAI on your direct-to-consumer store.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, fIdx) => {
              const isExpanded = expandedFaq === fIdx;
              return (
                <div
                  key={fIdx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : fIdx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-plum-950 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-plum-700 transition-transform duration-200 shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL MASTER CTA SECTION                                                  */}
        {/* ========================================================================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-plum-950 to-slate-900 text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden border border-plum-800">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-300/10 border border-peach-300/30 text-peach-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready to Elevate Your D2C Brand?</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Turn Your D2C Store Into an <br className="hidden sm:inline" />
                <span className="text-peach-300">Intelligent Sales Channel</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Empower every visitor with an AI assistant that understands what they need, resolves doubts, and completes checkouts. Connect your store in 15 minutes.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => onBookDemo('D2C Master Experience Bottom CTA')}
                className="px-8 py-4 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-sm rounded-xl shadow-xl shadow-peach-300/10 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Schedule Live D2C Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onBackToHome}
                className="px-6 py-4 bg-plum-900/80 hover:bg-plum-800 text-white font-bold text-sm rounded-xl border border-plum-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-peach-300" />
                <span>Back to All Solutions</span>
              </button>
            </div>

            <div className="pt-4 text-xs font-bold text-plum-400 tracking-wider">
              14-Day Free Evaluation • Zero Code Replacement • Dedicated Onboarding Support
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
