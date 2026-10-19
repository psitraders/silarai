import React, { useState } from 'react';
import {
  ShoppingBag,
  Bot,
  Sparkles,
  ArrowRight,
  Clock,
  Search,
  CheckCircle2,
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
  Laptop,
  Check,
  Flame,
  BarChart3,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  Smartphone,
  RefreshCw,
  ShoppingBag as CartIcon,
  Tag,
  HeartHandshake
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface ShopifyAiShoppingAssistantPageProps {
  onBackToHome: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
  onNavigateShopifyComparison?: () => void;
}

export const ShopifyAiShoppingAssistantPage: React.FC<ShopifyAiShoppingAssistantPageProps> = ({
  onBackToHome,
  onBookDemo,
  onNavigateShopifyComparison,
}) => {
  const [activeIntentTab, setActiveIntentTab] = useState<number>(0);
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const intentExamples = [
    {
      query: 'I need a lightweight laptop for programming and occasional gaming.',
      category: 'Electronics & Workstations',
      intent: 'Understands: Form factor (lightweight/portable), primary workload (code compilation/IDE), secondary GPU requirement for 1080p gaming.',
      response: 'Identified 3 ultrabooks with 16GB+ RAM, fast multi-core CPUs, and discrete graphics with high battery efficiency.',
      matchedItems: ['ApexBook Pro 14" (RTX 4050, 32GB RAM)', 'Volt Ultra 15 (Ryzen 7, 16GB RAM)'],
      tags: ['Lightweight', '16GB RAM', 'Dedicated GPU']
    },
    {
      query: 'Find me a skincare product for dry skin.',
      category: 'Beauty & Personal Care',
      intent: 'Understands: Skin barrier hydration needs, non-comedogenic formulas, hyaluronic acid / ceramide ingredients, avoids drying alcohols.',
      response: 'Retrieved 2 barrier-repair moisturizers and 1 gentle hydrating serum tailored for dry skin.',
      matchedItems: ['HydraCeramide Deep Moisture Balm', 'Pure Botanical Barrier Dew'],
      tags: ['Barrier Repair', 'Fragrance-Free', 'Deep Hydration']
    },
    {
      query: 'I need a gift for someone who loves coffee.',
      category: 'Lifestyle & Specialty',
      intent: 'Understands: Gifting context (packaged bundles), recipient passion (coffee enthusiast), grinding / pour-over / espresso accessories.',
      response: 'Curated 3 curated gift packs: precision manual burr grinder kit, single-origin tasting bundle, and double-wall thermal carafe.',
      matchedItems: ['Artisan Single-Origin Flight Set', 'Precision Conical Burr Grinder'],
      tags: ['Gift Ready', 'Single-Origin', 'Barista Grade']
    },
    {
      query: 'Which shoes are good for long-distance running?',
      category: 'Athletic Footwear',
      intent: 'Understands: Marathon/half-marathon endurance, high shock absorption heel foam, responsive toe-off, durable outsole rubber.',
      response: 'Matched 3 top road-running shoes engineered for high mileage, plush cushioning, and breathable mesh uppers.',
      matchedItems: ['Stratus Endurance Pro (Carbon Plate)', 'AeroGlide 4 Max Cushion'],
      tags: ['Endurance', 'Max Cushion', 'Road Running']
    }
  ];

  const shoppingJourneySteps = [
    {
      step: 'Understand',
      num: '01',
      title: '1. Understand',
      desc: 'Understand what the customer needs.',
      details: 'Interprets conversational descriptions, budgets, technical requirements, and intent in 20+ languages with sub-second accuracy.'
    },
    {
      step: 'Discover',
      num: '02',
      title: '2. Discover',
      desc: 'Find relevant products from the catalog.',
      details: 'Leverages vector neural embeddings connected to your Shopify store to pinpoint exact matches and relevant alternatives.'
    },
    {
      step: 'Refine',
      num: '03',
      title: '3. Refine',
      desc: 'Ask additional questions when needed.',
      details: 'Proactively clarifies preferences such as sizing, skin types, use case, or color variants to narrow down choices effortlessly.'
    },
    {
      step: 'Compare',
      num: '04',
      title: '4. Compare',
      desc: 'Help customers understand product differences.',
      details: 'Generates concise side-by-side specification breakdowns so shoppers do not have to open multiple tabs.'
    },
    {
      step: 'Select',
      num: '05',
      title: '5. Select',
      desc: 'Help the shopper choose a relevant product.',
      details: 'Explains why a specific item fits their exact criteria, highlighting customer reviews, warranty, and availability.'
    },
    {
      step: 'Cart & Checkout',
      num: '06',
      title: '6. Cart & Checkout',
      desc: 'Guide the customer toward your existing Shopify purchase flow.',
      details: 'Seamlessly adds items to the active Shopify cart or redirects directly to the native Shopify checkout with discount codes intact.'
    }
  ];

  const catalogAttributes = [
    { title: 'Product titles', desc: 'Exact naming, brand lines & model numbers' },
    { title: 'Descriptions', desc: 'Rich narrative copy & manufacturer details' },
    { title: 'Categories', desc: 'Collections, taxonomy & hierarchical tags' },
    { title: 'Attributes', desc: 'Color, sizing, materials, finish & volume' },
    { title: 'Specifications', desc: 'Dimensions, battery, ingredients & technical specs' },
    { title: 'Variants', desc: 'SKU options, bundle configurations & sizes' },
    { title: 'Pricing', desc: 'Live pricing, tiered discounts & compare-at rates' },
    { title: 'Availability', desc: 'Real-time stock status across warehouse locations' },
    { title: 'Use cases', desc: 'Application matching, lifestyle contexts & suitability' },
    { title: 'Other catalog information', desc: 'Care instructions, compatibility & warranties' }
  ];

  const shopifyMerchantTypes = [
    {
      title: 'D2C Brands',
      desc: 'Help customers discover products and make purchase decisions through guided conversational shopping.',
      icon: Flame,
      stat: '+35% Conversion Lift (tested benchmark)'
    },
    {
      title: 'Retail Stores',
      desc: 'Make large product catalogs easier to navigate with sub-second vector search across thousands of SKUs.',
      icon: Store,
      stat: 'Zero Search Friction'
    },
    {
      title: 'Fashion & Lifestyle',
      desc: 'Help shoppers find products based on personal style preferences, seasonal fit, and specific use cases.',
      icon: ShoppingBag,
      stat: 'Dynamic Outfit Pairing'
    },
    {
      title: 'Electronics',
      desc: 'Help customers compare technical specifications, compatibility, and features side-by-side in chat.',
      icon: Laptop,
      stat: 'Side-by-Side Spec Deltas'
    },
    {
      title: 'Beauty & Personal Care',
      desc: 'Help customers navigate products based on ingredient sensitivities, routines, and specific skin needs.',
      icon: HeartHandshake,
      stat: 'Routine Recommendations'
    },
    {
      title: 'Specialty Products',
      desc: 'Help customers understand technical, custom, or complex product information with verified catalog answers.',
      icon: Package,
      stat: 'Technical Catalog Q&A'
    }
  ];

  const whyAddReasons = [
    {
      title: '24/7 Shopping Assistance',
      desc: 'Help customers whenever they visit your store—day, night, weekends, or during flash holidays.',
      icon: Clock
    },
    {
      title: 'Conversational Product Discovery',
      desc: 'Let customers describe what they need naturally without forcing them to guess exact search keywords.',
      icon: MessageSquare
    },
    {
      title: 'Better Catalog Navigation',
      desc: 'Make large product catalogs easier to explore, reducing drop-off across deep multi-level categories.',
      icon: Layers
    },
    {
      title: 'Product Recommendations',
      desc: 'Help shoppers identify relevant products tailored to their budget, taste, and functional requirements.',
      icon: Sparkles
    },
    {
      title: 'Product Comparison',
      desc: 'Make purchasing decisions easier by breaking down key differences in price, specs, and performance.',
      icon: Sliders
    },
    {
      title: 'Scalable Customer Assistance',
      desc: 'Help multiple shoppers simultaneously without requiring a live salesperson for every conversation.',
      icon: Users
    }
  ];

  const shopifyFaqs = [
    {
      q: 'What is a Shopify AI Shopping Assistant?',
      a: 'A Shopify AI Shopping Assistant is a conversational AI experience that helps shoppers discover products, ask questions, compare options and navigate toward purchase using information from a Shopify store’s product catalog.'
    },
    {
      q: 'Can I add an AI Shopping Assistant to my Shopify store?',
      a: 'Yes. SilarAI is designed to add a conversational shopping experience to an existing Shopify store rather than requiring merchants to rebuild their storefront.'
    },
    {
      q: 'Can SilarAI use my Shopify product catalog?',
      a: 'SilarAI can use connected product catalog information to help customers discover and understand relevant products. The exact data available depends on the integration.'
    },
    {
      q: 'Can Shopify customers search using natural language?',
      a: 'Yes. Customers can describe what they need conversationally instead of relying exclusively on exact product names or keywords.'
    },
    {
      q: 'Can SilarAI recommend Shopify products?',
      a: 'Yes. The assistant can use product information and customer requirements to help identify relevant products.'
    },
    {
      q: 'Can customers compare Shopify products using AI?',
      a: 'Yes. Customers can ask the assistant to explain differences between products using available product information.'
    },
    {
      q: 'Can the Shopify AI Shopping Assistant work 24/7?',
      a: 'Yes. Once deployed, the assistant can provide shopping assistance whenever customers visit your store.'
    },
    {
      q: 'Can the AI assistant help customers reach checkout?',
      a: 'The experience can be integrated with the Shopify shopping journey to guide customers from product discovery toward cart and checkout, depending on the implementation.'
    },
    {
      q: 'Do I need to replace Shopify Search?',
      a: 'No. AI shopping can complement traditional search, filters and navigation.'
    },
    {
      q: 'Is an AI Shopping Assistant the same as a Shopify chatbot?',
      a: 'Not necessarily. A general chatbot focuses primarily on conversations and support. An AI Shopping Assistant is designed specifically around product discovery, recommendations, comparison and the shopping journey.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-peach-200 selection:text-plum-950 font-sans">
      {/* Breadcrumbs Navigation */}
      <div className="bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs
            items={[
              { label: 'Home', onClick: onBackToHome },
              { label: 'Integrations', onClick: onNavigateShopifyComparison ? onNavigateShopifyComparison : onBackToHome },
              { label: 'Shopify AI Shopping Assistant', isCurrent: true }
            ]}
          />
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-100 text-plum-950 text-xs font-black uppercase tracking-wider border border-peach-200 shadow-2xs">
                <Store className="w-3.5 h-3.5 text-plum-900" />
                <span>Shopify Store Integration • 24/7 AI Shopping</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Turn Your Shopify Store Into a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-plum-950 via-[#F47A38] to-[#E97A52]">
                  24/7 AI Shopping Experience
                </span>
              </h1>

              <div className="space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                <p>
                  Your customers shouldn&apos;t have to search through hundreds or thousands of products to find what they need.
                </p>
                <p>
                  <strong className="text-slate-900">SilarAI AI Shopping Assistant</strong> helps Shopify shoppers discover products, ask questions, compare options and make purchase decisions through natural conversation.
                </p>
                <p className="font-semibold text-plum-950">
                  Give every customer a shopping assistant that&apos;s available <span className="underline decoration-[#F47A38] decoration-2">24/7</span>.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => onBookDemo('Add AI Shopping Assistant to Shopify')}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#F48C68] via-[#F47A38] to-[#E97A52] hover:from-[#F47A38] hover:to-[#DE6B44] text-white font-black text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Store className="w-5 h-5" />
                  <span>Add AI Shopping Assistant to Shopify</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onBookDemo('Shopify AI Shopping Assistant Demo')}
                  className="px-7 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-base border-2 border-slate-200 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-5 h-5 text-plum-900" />
                  <span>Book a Demo</span>
                </button>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Works with Existing Shopify Themes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No Theme Overhauls Required</span>
                </div>
              </div>
            </div>

            {/* Right Visual: Interactive Shopify AI Assistant Mockup */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-3xl bg-slate-900 p-1 shadow-2xl ring-1 ring-slate-800">
                <div className="rounded-[22px] bg-slate-950 p-5 space-y-4 text-left">
                  {/* Assistant Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-peach-300 flex items-center justify-center text-plum-950 font-black text-sm shadow-sm">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>SilarAI Shopping Assistant</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>
                        <div className="text-[10px] text-slate-400">Connected to Shopify Catalog (Live)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-peach-300 bg-plum-900/90 px-2.5 py-1 rounded-full border border-plum-800">
                      24/7 Online
                    </span>
                  </div>

                  {/* Message Bubble: Customer query */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Shopify Customer (11:42 PM)</span>
                    </div>
                    <div className="bg-slate-800/90 text-white text-xs sm:text-sm p-3.5 rounded-2xl rounded-tr-none border border-slate-700/60 leading-relaxed">
                      &ldquo;I need running shoes for long-distance running under $100.&rdquo;
                    </div>
                  </div>

                  {/* AI Response Card */}
                  <div className="space-y-2 bg-gradient-to-b from-plum-950/80 to-slate-900/90 p-4 rounded-2xl border border-plum-900/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-peach-300 tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Assistant Reasoning</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">140ms catalog match</span>
                    </div>

                    <div className="text-xs text-slate-200 leading-relaxed">
                      Found 2 top models in your Shopify catalog matching long-distance cushioning and road durability under $100:
                    </div>

                    {/* Product Card Inside Chat */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/70 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-xs">Stratus Road Endurance Max</div>
                        <div className="text-xs font-black text-peach-300">$89.00</div>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-200">Plush Heel Cushion</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-[10px] font-bold text-emerald-400">In Stock • 4.9★</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onBookDemo('Shopify 1-Click Cart Action')}
                          className="w-full py-2 rounded-lg bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CartIcon className="w-3.5 h-3.5" />
                          <span>Add to Shopify Cart</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      Understands requirement → finds relevant products → compares options → guides toward checkout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Help Shopify Customers Shop by Simply Asking */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-plum-900" />
              Natural Conversation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Help Shopify Customers Shop by Simply Asking
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Traditional ecommerce makes customers search, filter and browse.
              With SilarAI, customers can simply tell your AI shopping assistant what they&apos;re looking for.
            </p>
          </div>

          {/* Interactive Dialogue Highlight */}
          <div className="max-w-3xl mx-auto rounded-3xl bg-slate-50 p-6 sm:p-8 border border-slate-200 shadow-sm text-left space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Customer</div>
                <blockquote className="text-base sm:text-lg font-bold text-slate-900 italic bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  &ldquo;I need running shoes for long-distance running under $100.&rdquo;
                </blockquote>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-peach-200 text-plum-950 font-bold flex items-center justify-center shrink-0 border border-peach-300">
                <Bot className="w-5 h-5 text-plum-900" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="text-xs font-black text-plum-900 uppercase tracking-wider">AI Shopping Assistant</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-bold text-slate-800">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-peach-100 text-plum-950 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>Understands requirement</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-peach-100 text-plum-950 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>Finds relevant products</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-peach-100 text-plum-950 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <span>Helps compare them</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-peach-100 text-plum-950 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                    <span>Guides toward purchase</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center sm:text-right border-t border-slate-200 text-xs sm:text-sm font-black text-plum-950">
              ✓ No complicated search query required.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Your Shopify Store Is Open 24/7. Your AI Shopping Assistant Should Be Too. */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-plum-900" />
              Continuous Availability
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Your Shopify Store Is Open 24/7. Your AI Shopping Assistant Should Be Too.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Customers shop at all hours. SilarAI provides conversational shopping assistance whenever customers need it.
            </p>
            {/* Hour pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {['Before work', 'During lunch', 'Late at night', 'On weekends', 'During holidays'].map((time) => (
                <span key={time} className="px-3.5 py-1.5 rounded-full bg-white text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs">
                  • {time}
                </span>
              ))}
            </div>
          </div>

          {/* 5 Feature Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {[
              {
                title: '24/7 Product Assistance',
                desc: 'Answer product questions even when your team isn’t online.',
                icon: Clock
              },
              {
                title: 'AI Product Discovery',
                desc: 'Help customers find relevant products from your Shopify catalog.',
                icon: Search
              },
              {
                title: 'Product Recommendations',
                desc: 'Guide shoppers toward products matching their requirements.',
                icon: Sparkles
              },
              {
                title: 'Product Comparison',
                desc: 'Help customers understand differences between products.',
                icon: Sliders
              },
              {
                title: 'Shopping Guidance',
                desc: 'Move customers from discovery toward cart and checkout.',
                icon: ArrowRight
              }
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-peach-300 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-peach-100 text-plum-950 font-bold flex items-center justify-center border border-peach-200">
                      <Icon className="w-5 h-5 text-plum-900" />
                    </div>
                    <h3 className="text-base font-bold text-slate-950 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-black text-plum-950 flex items-center gap-1">
                    <span>Pillar {idx + 1}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#F47A38]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Already Have a Shopify Store? You Don't Need to Start Over. */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-plum-900" />
              Seamless Extension
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Already Have a Shopify Store? You Don&apos;t Need to Start Over.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              SilarAI is designed to work with your existing Shopify ecommerce experience.
            </p>
          </div>

          {/* Side-by-side Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">You Keep Your Existing</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">100% Retained</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Shopify Store → Products → Pricing → Cart → Checkout
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your inventory records, order fulfillments, payment gateways, apps, and Shopify analytics remain your single source of truth.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-peach-50 to-white border-2 border-peach-300 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-plum-950">SilarAI Seamlessly Adds</span>
                <span className="text-xs font-bold text-plum-950 bg-peach-200 px-2 py-0.5 rounded-full">Conversational AI Layer</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                AI Conversation → Product Discovery → Recommendations → Comparison
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Shoppers interact conversationally on top of your live catalog with instant answers and tailored recommendations.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-2 max-w-3xl mx-auto">
            <h4 className="text-base sm:text-lg font-bold text-peach-300">
              Your existing store becomes more conversational.
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You don&apos;t need to replace your Shopify storefront just to give customers an AI shopping experience.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Let Customers Search by Intent — Not Just Keywords */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-plum-900" />
              Intent-Driven Search
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Let Customers Search by Intent — Not Just Keywords
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              A customer may not know the exact product name. They may simply know what they want to accomplish.
            </p>
          </div>

          {/* Interactive Examples Switcher */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 4 Example Tabs */}
            <div className="lg:col-span-5 space-y-2.5">
              {intentExamples.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIntentTab(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    activeIntentTab === idx
                      ? 'bg-plum-950 text-white border-plum-900 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider block ${activeIntentTab === idx ? 'text-peach-300' : 'text-slate-500'}`}>
                      {item.category}
                    </span>
                    <div className="text-xs sm:text-sm font-bold leading-snug">
                      &ldquo;{item.query}&rdquo;
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-transform ${activeIntentTab === idx ? 'text-peach-300 rotate-90 sm:rotate-0' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>

            {/* Right: Simulated Breakdown */}
            <div className="lg:col-span-7">
              {(() => {
                const current = intentExamples[activeIntentTab];
                return (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-left h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-black uppercase tracking-wider text-plum-950 bg-peach-100 px-3 py-1 rounded-full">
                          AI Semantic Interpretation
                        </span>
                        <span className="text-xs text-slate-500 font-mono">Catalog Match Latency: 42ms</span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Customer Inquiry</div>
                        <div className="text-lg font-extrabold text-slate-950 italic">
                          &ldquo;{current.query}&rdquo;
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="text-xs font-black text-plum-950">Underlying Intent Resolution</div>
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {current.intent}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-black text-slate-500 uppercase">AI Recommendation Action</div>
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {current.response}
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-500 mb-2">Matched Shopify Catalog SKUs:</div>
                        <div className="flex flex-wrap gap-2">
                          {current.matchedItems.map((prod, i) => (
                            <div key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-bold border border-slate-200 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{prod}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 italic">
                      SilarAI helps turn these natural-language requirements into relevant product discovery.
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Make Large Shopify Catalogs Easier to Shop */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-plum-900" />
              High-SKU Catalog Navigation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Make Large Shopify Catalogs Easier to Shop
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              As your product catalog grows, product discovery can become harder. Customers struggle with deep hierarchies and endless filters.
            </p>
          </div>

          {/* Journey Comparison */}
          <div className="space-y-6 max-w-3xl mx-auto text-left">
            {/* The Complex Way */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-rose-800">
                Traditional Complex Customer Journey
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-700 flex flex-wrap items-center gap-2">
                <span>Categories</span>
                <span className="text-slate-400">→</span>
                <span>Filters</span>
                <span className="text-slate-400">→</span>
                <span>Search</span>
                <span className="text-slate-400">→</span>
                <span>Product Pages</span>
                <span className="text-slate-400">→</span>
                <span>Specifications</span>
                <span className="text-slate-400">→</span>
                <span className="text-slate-500">Manual Comparison</span>
              </div>
              <div className="text-xs text-slate-500">
                High friction, high bounce rates, and cart abandonment when customers cannot quickly verify compatibility.
              </div>
            </div>

            {/* The SilarAI Conversational Way */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-peach-100 to-peach-50 border-2 border-peach-300 space-y-3 shadow-sm">
              <div className="text-xs font-black uppercase tracking-wider text-plum-950">
                SilarAI Conversational Shopping Journey
              </div>
              <div className="text-base sm:text-lg font-black text-plum-950 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="px-2.5 py-1 rounded-md bg-white border border-peach-200">Ask</span>
                <span className="text-plum-900">→</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-peach-200">Understand</span>
                <span className="text-plum-900">→</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-peach-200">Discover</span>
                <span className="text-plum-900">→</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-peach-200">Compare</span>
                <span className="text-plum-900">→</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-peach-200 text-[#DE6B44]">Choose</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-700 font-medium">
                This can be particularly useful for Shopify stores with large or technically complex catalogs.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AI That Understands Your Products */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-plum-900" />
              Deep Product Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              AI That Understands Your Products
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              SilarAI can use all available product information from your Shopify store:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {catalogAttributes.map((attr, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-peach-300 hover:shadow-xs transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-peach-100 text-plum-950 font-bold flex items-center justify-center text-xs">
                  {idx + 1}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{attr.title}</h3>
                <p className="text-[11px] text-slate-500 leading-snug">{attr.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-peach-100/70 border border-peach-200 text-center max-w-3xl mx-auto">
            <p className="text-sm sm:text-base font-bold text-plum-950">
              The result is a shopping experience where customers can ask questions about your products instead of simply searching for product names.
            </p>
          </div>
        </div>
      </section>

      {/* 8. From Product Discovery to Purchase */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-plum-900" />
              Full-Funnel Commerce
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              From Product Discovery to Purchase
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              The shopping journey doesn&apos;t have to stop at product discovery.
              SilarAI can be designed around the complete shopping journey:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shoppingJourneySteps.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3 text-left hover:border-peach-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-plum-950 bg-peach-200 px-2.5 py-1 rounded-full">
                      Step {step.num}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Stage {idx + 1}/6</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">{step.title}</h3>
                  <div className="text-sm font-semibold text-slate-800">{step.desc}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.details}</p>
                </div>
                <div className="pt-3 border-t border-slate-200/80 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Shopify Native Flow Integration</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            * Guide the customer toward your existing Shopify purchase flow, subject to the store integration and configuration.
          </p>
        </div>
      </section>

      {/* 9. Shopify Search + AI Shopping */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-plum-900" />
              Complementary Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Shopify Search + AI Shopping
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              SilarAI doesn&apos;t have to replace your existing Shopify search. Use both.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Traditional Search</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Exact Match</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Best when customers know exactly what they&apos;re looking for.
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-50 font-mono text-xs text-slate-800 border border-slate-200">
                &ldquo;Nike Air Max 270&rdquo;
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Effective for repeat buyers and direct product code lookups.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-peach-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-plum-950">AI Shopping</span>
                <span className="text-[10px] font-bold bg-peach-200 text-plum-950 px-2 py-0.5 rounded-full">Intent Match</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Useful when customers describe what they need.
              </h3>
              <div className="p-3.5 rounded-xl bg-peach-50 font-mono text-xs text-plum-950 border border-peach-200">
                &ldquo;I need comfortable shoes for walking all day.&rdquo;
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interprets ergonomics, foot support requirements, and lifestyle use cases.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-plum-950 text-white max-w-2xl mx-auto space-y-1">
            <div className="text-sm font-bold text-peach-300">
              Together: Search + Filters + AI Shopping Assistant
            </div>
            <div className="text-xs text-slate-300">
              give customers multiple convenient ways to discover and buy products on your Shopify store.
            </div>
          </div>
        </div>
      </section>

      {/* 10. Built for Shopify Merchants */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-plum-900" />
              Merchant Segments
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Built for Shopify Merchants
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              SilarAI can support different types of Shopify businesses across verticals:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopifyMerchantTypes.map((merchant, idx) => {
              const Icon = merchant.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs space-y-3.5 text-left hover:border-peach-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-peach-100 text-plum-950 font-bold flex items-center justify-center border border-peach-200">
                        <Icon className="w-5 h-5 text-plum-900" />
                      </div>
                      <span className="text-[10px] font-black text-plum-950 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {merchant.stat}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-950">{merchant.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {merchant.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => onBookDemo(`Shopify ${merchant.title} Solution`)}
                    className="pt-2 text-xs font-bold text-plum-900 hover:text-plum-950 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Explore for {merchant.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. Why Add an AI Shopping Assistant to Shopify? */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-plum-900" />
              Core ROI & Value
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Why Add an AI Shopping Assistant to Shopify?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Transform passive storefront traffic into guided sales conversations with continuous customer assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyAddReasons.map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 text-left hover:border-peach-300 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-2xl bg-peach-100 text-plum-950 font-bold flex items-center justify-center border border-peach-200">
                    <Icon className="w-5 h-5 text-plum-900" />
                  </div>
                  <h3 className="text-base font-bold text-slate-950">{reason.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {reason.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. Shopify AI Shopping vs Traditional Chatbots */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-plum-900" />
              Chatbot vs Shopping Assistant
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
              Shopify AI Shopping vs Traditional Chatbots
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Traditional bots answer canned support FAQs. SilarAI drives autonomous shopping discovery and revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Traditional Chatbot</span>
              <div className="text-lg font-bold text-slate-800">
                Question → Answer
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Generally designed for order tracking status or returns policy lookups without understanding product attributes, sizes, or purchase intent.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-peach-50 to-white border-2 border-peach-300 space-y-3 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-plum-950">AI Shopping Assistant</span>
              <div className="text-lg font-black text-plum-950">
                Need → Discovery → Recommendation → Comparison → Purchase
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Designed specifically around product catalogs, understanding customer requirements, and guiding the purchase decision.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-peach-100 border border-peach-200 text-center max-w-xl mx-auto space-y-1">
            <div className="text-sm font-extrabold text-plum-950">
              The goal isn&apos;t simply to answer a customer&apos;s question.
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800">
              The goal is to <strong className="text-plum-950">help the customer shop.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Integration Deep-Dive & Clarification Cards */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-plum-900" />
              Implementation &amp; Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Frequently Clarified Integration Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Clear, transparent details on how SilarAI integrates with your live Shopify store.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: How Quickly */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-950">
                  How Quickly Can I Add an AI Shopping Assistant to Shopify?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  SilarAI is designed to make the integration lightweight for Shopify merchants.
                  The objective is to connect your product catalog, configure the shopping experience and add the assistant to your storefront without rebuilding your ecommerce website.
                </p>
              </div>
              <button
                onClick={() => onBookDemo('Shopify Integration Demo')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-plum-950 hover:bg-plum-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>See How It Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Do I Need to Rebuild */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 text-left">
              <h3 className="text-lg font-bold text-slate-950">
                Do I Need to Rebuild My Shopify Store?
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-900 text-base">No.</p>
                <p>
                  Your existing Shopify storefront can remain the foundation of your ecommerce experience.
                  SilarAI adds a conversational shopping layer that helps customers interact with your catalog.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 font-bold text-plum-950 border border-slate-200">
                  Shopify remains your store. SilarAI becomes your AI shopping assistant.
                </div>
              </div>
            </div>

            {/* Card 3: Can Customers Add to Cart */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 text-left">
              <h3 className="text-lg font-bold text-slate-950">
                Can Customers Add Products to Their Cart?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The assistant can be integrated with your Shopify shopping flow so customers can move from product discovery toward cart and checkout, depending on the integration and permissions available.
              </p>
              <div className="p-3 rounded-xl bg-peach-50 text-plum-950 text-xs font-bold border border-peach-200">
                Goal: Conversation → Product → Cart → Checkout rather than forcing the customer to restart their shopping journey.
              </div>
            </div>

            {/* Card 4: Can Customers Ask Questions */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 text-left">
              <h3 className="text-lg font-bold text-slate-950">
                Can Shopify Customers Ask Product Questions?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Yes. Customers can ask questions about available product information, such as:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-peach-400"></span>
                  <span>&ldquo;What is the difference between these products?&rdquo;</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-peach-400"></span>
                  <span>&ldquo;Which one is suitable for outdoor use?&rdquo;</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-peach-400"></span>
                  <span>&ldquo;Does this product come in another size?&rdquo;</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-peach-400"></span>
                  <span>&ldquo;Which option is better for beginners?&rdquo;</span>
                </li>
              </ul>
              <p className="text-[11px] text-slate-500 pt-1">
                The assistant uses your connected Shopify product information to help answer accurately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 14. Shopify AI Shopping Assistant FAQ (10 Q&As) */}
      <section
        id="shopify-faq"
        className="py-20 bg-white border-b border-slate-200 scroll-mt-20"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black tracking-wider uppercase text-plum-950 bg-peach-200 px-3.5 py-1 rounded-full border border-peach-300 inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-plum-900" />
              Verified Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Shopify AI Shopping Assistant FAQ
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Everything Shopify merchants need to know about conversational shopping, catalog synchronization, and 24/7 sales guidance.
            </p>
          </div>

          <div className="space-y-3.5">
            {shopifyFaqs.map((faq, idx) => {
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
                      <h3
                        itemProp="name"
                        className="text-base sm:text-lg font-bold text-slate-950 leading-snug"
                      >
                        {faq.q}
                      </h3>
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

          {/* Quick Demo Consultation Callout */}
          <div className="mt-10 p-6 rounded-3xl bg-gradient-to-r from-peach-100/80 via-peach-50 to-white border border-peach-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-base font-extrabold text-plum-950">
                Want to see how SilarAI works on your specific Shopify theme?
              </div>
              <div className="text-xs sm:text-sm text-slate-600">
                We can preview conversational catalog discovery on your store in under 15 minutes.
              </div>
            </div>
            <button
              onClick={() => onBookDemo('Shopify Store Live Consultation')}
              className="px-6 py-3 rounded-full bg-plum-950 hover:bg-plum-900 text-white text-xs font-black tracking-wide shrink-0 transition-all shadow-md cursor-pointer"
            >
              Request Theme Preview
            </button>
          </div>
        </div>
      </section>

      {/* 15. Final Call to Action */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-peach-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-200 text-plum-950 text-xs font-extrabold border border-peach-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-plum-900" />
            <span>Make Your Shopify Store Conversational</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-3xl mx-auto">
            Your customers already know how to talk. Now let them <span className="text-[#DE6B44]">shop that way</span>.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Turn your Shopify store into a <strong className="text-slate-900">24/7 AI shopping experience</strong> that helps customers discover, understand, compare and choose products.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onBookDemo('Add SilarAI to Your Shopify Store')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#F48C68] via-[#F47A38] to-[#E97A52] hover:from-[#F47A38] hover:to-[#DE6B44] text-white font-extrabold text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Store className="w-5 h-5" />
              <span>Add SilarAI to Your Shopify Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onBookDemo('Shopify AI Shopping Assistant Final Demo')}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base border-2 border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Bot className="w-5 h-5 text-plum-900" />
              <span>Book a Demo</span>
            </button>
          </div>

          <div className="pt-4">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SilarAI Home</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
