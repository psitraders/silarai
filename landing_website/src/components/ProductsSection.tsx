import React, { useState } from 'react';
import { PRODUCTS } from '../data/content';
import {
  Check,
  Bot,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Layers,
  Globe,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import aiBotCommerceImg from '../assets/images/ai_bot_commerce_dashboard_1785403446965.jpg';
import aiCommerceEngineImg from '../assets/images/ai_commerce_platform_engine_1785488597071.jpg';

interface ProductsSectionProps {
  onLearnMoreAssistant: (subPage?: 1 | 2 | 3) => void;
  onExplorePlatform: (subPage?: 1 | 2 | 3) => void;
  onNavigateShopifyComparison?: () => void;
  onNavigateWoocommerceComparison?: () => void;
  onSelectD2cPage?: (sectionId?: string) => void;
  onSelectManufacturingPage?: (pageId?: number) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  onLearnMoreAssistant,
  onExplorePlatform,
  onNavigateShopifyComparison,
  onNavigateWoocommerceComparison,
  onSelectD2cPage,
  onSelectManufacturingPage,
}) => {
  const [activeAssistantFeature, setActiveAssistantFeature] = useState<string>('Conversational Shopping');
  const [activePlatformFeature, setActivePlatformFeature] = useState<string>('Online Store');

  const assistant = PRODUCTS[0];
  const platform = PRODUCTS[1];

  return (
    <section id="products" className="py-20 bg-slate-50/50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-plum-900 bg-peach-300 px-3.5 py-1.5 rounded-full border border-peach-400/60">
            Core Products
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One Platform. Two Powerful Products.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Deploy them independently or combine them for a unified, end-to-end commerce intelligence stack. Click any card or guide to visit the dedicated product page.
          </p>
        </div>

        {/* Two Equal Width Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Card 1: AI Shopping Assistant */}
          <div
            onClick={() => onLearnMoreAssistant(1)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onLearnMoreAssistant(1);
              }
            }}
            tabIndex={0}
            role="link"
            aria-label="Navigate to AI Shopping Assistant dedicated product page"
            className="bg-white rounded-saas p-8 border border-slate-200 shadow-sleek hover:shadow-2xl hover:border-plum-500 hover:ring-2 hover:ring-plum-300/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-plum-700"
          >
            {/* Background subtle accent decoration */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-peach-300/20 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

            <div>
              {/* Card Header & Page Badges */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-plum-700 text-peach-300 flex items-center justify-center shadow-md shadow-plum-900/20 group-hover:bg-plum-900 group-hover:scale-105 transition-all">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-plum-950 bg-peach-300 px-3 py-1 rounded-full border border-peach-400 flex items-center gap-1 shadow-xs group-hover:bg-peach-200 transition-colors">
                    <span>Dedicated Page</span>
                    <ExternalLink className="w-3 h-3 text-plum-950" />
                  </span>
                  <span className="text-xs font-extrabold text-plum-950 bg-peach-200/80 px-2.5 py-1 rounded-full border border-peach-300">
                    {assistant.badge}
                  </span>
                </div>
              </div>

              {/* Title with Anchor Link */}
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-plum-800 transition-colors">
                <a
                  href="/ai-shopping-assistant"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLearnMoreAssistant(1);
                  }}
                  className="inline-flex items-center gap-2 hover:underline"
                  title="Visit AI Shopping Assistant product page"
                >
                  <span>{assistant.title}</span>
                  <ArrowRight className="w-5 h-5 text-plum-700 opacity-80 group-hover:translate-x-1 transition-transform" />
                </a>
              </h3>

              <p className="text-base font-bold text-plum-700 mb-2">
                {assistant.tagline}
              </p>

              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {assistant.description}
              </p>

              {/* Dedicated 3-Part Guide Quick Navigation */}
              <div className="mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1.5 text-plum-900 font-extrabold">
                    <BookOpen className="w-3.5 h-3.5 text-plum-700" />
                    <span>Dedicated Guide Pages (Click to Jump)</span>
                  </span>
                  <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                    3 In-Depth Guides
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href="/ai-shopping-assistant?subPage=1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onLearnMoreAssistant(1);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-plum-950 text-slate-800 hover:text-white border border-slate-200 hover:border-plum-800 transition-all text-xs font-bold flex items-center gap-2 shadow-2xs group/sublink cursor-pointer"
                    title="Guide 1: What is an AI Shopping Assistant?"
                  >
                    <span className="w-5 h-5 rounded-md bg-teal-100 group-hover/sublink:bg-teal-400 text-teal-900 text-[10px] font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="truncate">What is an AI Assistant?</span>
                  </a>

                  <a
                    href="/ai-shopping-assistant?subPage=2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onLearnMoreAssistant(2);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-plum-950 text-slate-800 hover:text-white border border-slate-200 hover:border-plum-800 transition-all text-xs font-bold flex items-center gap-2 shadow-2xs group/sublink cursor-pointer"
                    title="Guide 2: Features & Benefits"
                  >
                    <span className="w-5 h-5 rounded-md bg-peach-200 group-hover/sublink:bg-peach-300 text-plum-950 text-[10px] font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="truncate">Features &amp; Benefits</span>
                  </a>

                  <a
                    href="/ai-shopping-assistant?subPage=3"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onLearnMoreAssistant(3);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-plum-950 text-slate-800 hover:text-white border border-slate-200 hover:border-plum-800 transition-all text-xs font-bold flex items-center gap-2 shadow-2xs group/sublink cursor-pointer"
                    title="Guide 3: How AI Shopping Assistants Help Businesses Grow"
                  >
                    <span className="w-5 h-5 rounded-md bg-emerald-100 group-hover/sublink:bg-emerald-400 text-emerald-900 text-[10px] font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="truncate">Help Businesses Grow</span>
                  </a>
                </div>
              </div>

              {/* Brand Visual Banner with Click-to-Explore Overlay */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onLearnMoreAssistant(1);
                }}
                className="mb-6 rounded-2xl overflow-hidden border border-plum-200/90 shadow-md group-hover:shadow-lg transition-all relative cursor-pointer"
              >
                <img
                  src={aiBotCommerceImg}
                  alt="SilarAI Bot Assistant & Commerce Integration"
                  className="w-full h-48 object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div
                  data-focus-id="focus-1"
                  className="absolute inset-0 bg-gradient-to-t from-plum-950/90 via-plum-950/40 to-transparent flex items-end justify-between p-3.5 backdrop-blur-[0.5px]"
                >
                  <span className="text-[11px] font-bold text-teal-200 flex items-center gap-1.5 bg-plum-900/90 px-2.5 py-1 rounded-lg backdrop-blur-md border border-teal-300/40 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    AI Assistant &amp; Smart Commerce Interface
                  </span>
                  <span className="text-[11px] font-extrabold text-peach-300 bg-plum-950/95 px-2.5 py-1 rounded-lg border border-plum-700 flex items-center gap-1 shadow-xs hover:border-peach-300 transition-colors">
                    <span>View Page</span>
                    <ArrowRight className="w-3 h-3 text-peach-300" />
                  </span>
                </div>
              </div>

              {/* Feature Checklist Grid */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Included Features (Click to test details)</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLearnMoreAssistant(2);
                    }}
                    className="text-[11px] font-bold text-plum-700 hover:text-plum-950 hover:underline flex items-center gap-1"
                  >
                    <span>Full Feature Specs</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {assistant.features.map((feat, idx) => {
                    const isSelected = activeAssistantFeature.toLowerCase() === feat.toLowerCase();
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAssistantFeature(feat);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-plum-950 text-white border border-plum-800 shadow-sm ring-2 ring-peach-300/40 font-bold'
                            : 'bg-slate-50 text-slate-700 hover:bg-peach-50/80 border border-slate-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-peach-300 text-plum-950' : 'bg-plum-700 text-peach-300'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="capitalize truncate">{feat}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Feature Short Description Box */}
                {activeAssistantFeature && (
                  <div className="p-3.5 bg-plum-950 text-white rounded-xl border border-plum-800 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-peach-300 flex items-center gap-1.5 capitalize">
                        <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                        <span>{activeAssistantFeature}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLearnMoreAssistant(2);
                        }}
                        className="text-[10px] font-bold text-teal-300 hover:underline flex items-center gap-1"
                      >
                        <span>Deep-dive in Guide 2</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {
                        {
                          'conversational shopping': 'Shop naturally by asking questions instead of searching through menus.',
                          'product recommendations': 'Get AI-picked products based on your needs, preferences, and budget.',
                          'product comparison': 'Instantly compare products by features, price, specifications, and benefits.',
                          'faq automation': 'Receive instant answers to product, shipping, returns, warranty, and policy questions 24/7.',
                          'customer memory': 'AI remembers your preferences, past purchases, and conversations for faster assistance.',
                          'whatsapp integration': 'Continue shopping, receive recommendations, and track orders directly through WhatsApp.',
                          'multilingual ai': 'Chat in your preferred language with natural, accurate responses.',
                          'personalized suggestions': 'Discover products tailored to your shopping history, interests, and buying behavior.',
                        }[activeAssistantFeature.toLowerCase()] || 'Explore feature capabilities.'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* SEO Backlinks & Semantic Anchor Network - Visually hidden from UI, active in backend for search engine indexing & organic traffic */}
              <div className="sr-only" aria-label="AI Shopping Assistant SEO Backlinks & Related Architecture Pages">
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-plum-700" />
                    <span>SEO Product Backlinks &amp; Related Pages</span>
                  </span>
                  <span className="text-[10px] font-bold text-teal-700">Indexed &amp; Linked</span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href="/ai-shopping-assistant"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onLearnMoreAssistant(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-plum-50 hover:bg-plum-100 text-plum-800 font-bold border border-plum-200 transition-colors flex items-center gap-1"
                    title="AI Shopping Assistant Core Product Page"
                  >
                    <span>AI Shopping Assistant Hub</span>
                    <ExternalLink className="w-3 h-3 text-plum-600" />
                  </a>

                  <a
                    href="/ai-shopping-assistant?subPage=1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onLearnMoreAssistant(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="Architecture & Workflow of AI Shopping Assistant"
                  >
                    Architecture Guide
                  </a>

                  <a
                    href="/ai-shopping-assistant?subPage=2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onLearnMoreAssistant(2);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="Conversational Search & WhatsApp AI"
                  >
                    Conversational Search &amp; WhatsApp AI
                  </a>

                  <a
                    href="/ai-shopping-assistant?subPage=3"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onLearnMoreAssistant(3);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="Conversion Rate Optimization and +34% Cart Lift"
                  >
                    +34% Cart Lift ROI Engine
                  </a>

                  <a
                    href="/shopify-vs-silarai"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onNavigateShopifyComparison) onNavigateShopifyComparison();
                      else onLearnMoreAssistant(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="Compare Shopify AI Apps vs SilarAI Shopping Assistant"
                  >
                    Shopify AI Alternative
                  </a>

                  <a
                    href="/woocommerce-vs-silarai"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onNavigateWoocommerceComparison) onNavigateWoocommerceComparison();
                      else onLearnMoreAssistant(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="Compare WooCommerce AI Assistant Plugins vs SilarAI"
                  >
                    WooCommerce AI Integration
                  </a>

                  <a
                    href="/industries/d2c-brands/ai-shopping-assistant"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onSelectD2cPage) onSelectD2cPage('shopping-assistant');
                      else onLearnMoreAssistant(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="D2C Brands AI Shopping Assistant"
                  >
                    D2C AI Assistant
                  </a>
                </div>
              </div>
            </div>

            {/* Target Element: Bottom Action Bar (CSS selector 1) */}
            <div className="pt-6 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="text-xs text-slate-500 font-medium">
                <span className="font-extrabold text-slate-900 block text-sm">
                  {assistant.highlightStat}
                </span>
                <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-coral-500" />
                  Click anywhere on card to visit dedicated page
                </span>
              </div>
              <a
                href="/ai-shopping-assistant"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLearnMoreAssistant(1);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-extrabold text-white bg-plum-700 hover:bg-plum-800 rounded-xl shadow-md shadow-plum-900/15 transition-all transform active:scale-95 group/btn cursor-pointer shrink-0"
                title="Open AI Shopping Assistant dedicated page"
              >
                <span>{assistant.buttonText}</span>
                <ArrowRight className="w-4 h-4 text-peach-300 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Card 2: Commerce Platform */}
          <div
            onClick={() => onExplorePlatform(1)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onExplorePlatform(1);
              }
            }}
            tabIndex={0}
            role="link"
            aria-label="Navigate to AI Commerce & Marketing Platform dedicated product page"
            className="bg-white rounded-saas p-8 border border-slate-200 shadow-sleek hover:shadow-2xl hover:border-plum-500 hover:ring-2 hover:ring-plum-300/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-plum-700"
          >
            {/* Background subtle accent decoration */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-plum-700/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

            <div>
              {/* Card Header & Page Badges */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-plum-900 text-peach-300 flex items-center justify-center shadow-md shadow-plum-950/20 group-hover:bg-plum-950 group-hover:scale-105 transition-all">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-plum-950 bg-peach-300 px-3 py-1 rounded-full border border-peach-400 flex items-center gap-1 shadow-xs group-hover:bg-peach-200 transition-colors">
                    <span>Dedicated Page</span>
                    <ExternalLink className="w-3 h-3 text-plum-950" />
                  </span>
                  <span className="text-xs font-extrabold text-plum-950 bg-peach-200/80 px-2.5 py-1 rounded-full border border-peach-300">
                    {platform.badge}
                  </span>
                </div>
              </div>

              {/* Title with Anchor Link */}
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-plum-800 transition-colors">
                <a
                  href="/ai-commerce-platform"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onExplorePlatform(1);
                  }}
                  className="inline-flex items-center gap-2 hover:underline"
                  title="Visit AI Commerce Platform product page"
                >
                  <span>{platform.title}</span>
                  <ArrowRight className="w-5 h-5 text-plum-700 opacity-80 group-hover:translate-x-1 transition-transform" />
                </a>
              </h3>

              <p className="text-base font-bold text-plum-700 mb-2">
                {platform.tagline}
              </p>

              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {platform.description}
              </p>

              {/* Dedicated 3-Part Guide Quick Navigation */}
              <div className="mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1.5 text-plum-900 font-extrabold">
                    <BookOpen className="w-3.5 h-3.5 text-plum-700" />
                    <span>Dedicated Guide Pages (Click to Jump)</span>
                  </span>
                  <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                    3 Platform Modules
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href="/ai-commerce-platform?subPage=1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onExplorePlatform(1);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-plum-950 text-slate-800 hover:text-white border border-slate-200 hover:border-plum-800 transition-all text-xs font-bold flex items-center gap-2 shadow-2xs group/sublink cursor-pointer"
                    title="Module 1: Commerce & Marketing Engine"
                  >
                    <span className="w-5 h-5 rounded-md bg-teal-100 group-hover/sublink:bg-teal-400 text-teal-900 text-[10px] font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="truncate">Commerce &amp; Engine</span>
                  </a>

                  <a
                    href="/ai-commerce-platform?subPage=2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onExplorePlatform(2);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-plum-950 text-slate-800 hover:text-white border border-slate-200 hover:border-plum-800 transition-all text-xs font-bold flex items-center gap-2 shadow-2xs group/sublink cursor-pointer"
                    title="Module 2: AI Shopping Assistant Built-In"
                  >
                    <span className="w-5 h-5 rounded-md bg-peach-200 group-hover/sublink:bg-peach-300 text-plum-950 text-[10px] font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="truncate">Shopping Copilot</span>
                  </a>

                  <a
                    href="/ai-commerce-platform?subPage=3"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onExplorePlatform(3);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-plum-950 text-slate-800 hover:text-white border border-slate-200 hover:border-plum-800 transition-all text-xs font-bold flex items-center gap-2 shadow-2xs group/sublink cursor-pointer"
                    title="Module 3: Meta & Multi-Channel Marketing Automation"
                  >
                    <span className="w-5 h-5 rounded-md bg-emerald-100 group-hover/sublink:bg-emerald-400 text-emerald-900 text-[10px] font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="truncate">Meta Marketing</span>
                  </a>
                </div>
              </div>

              {/* Brand Visual Banner with Click-to-Explore Overlay */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onExplorePlatform(1);
                }}
                className="mb-6 rounded-2xl overflow-hidden border border-plum-200/90 shadow-md group-hover:shadow-lg transition-all relative cursor-pointer"
              >
                <img
                  src={aiCommerceEngineImg}
                  alt="AI Commerce & Marketing Platform"
                  className="w-full h-48 object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-950/85 via-plum-950/20 to-transparent flex items-end justify-between p-3.5">
                  <span className="text-[11px] font-bold text-teal-200 flex items-center gap-1.5 bg-plum-900/85 px-2.5 py-1 rounded-lg backdrop-blur-md border border-teal-300/40">
                    <Layers className="w-3.5 h-3.5 text-teal-300" />
                    Ecommerce Store • AI Shopping • Meta Social Marketing
                  </span>
                  <span className="text-[11px] font-extrabold text-peach-300 bg-plum-950/90 px-2.5 py-1 rounded-lg border border-plum-700 flex items-center gap-1">
                    <span>View Page</span>
                    <ArrowRight className="w-3 h-3 text-peach-300" />
                  </span>
                </div>
              </div>

              {/* Categorized Feature Grid */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Included Capabilities (Click to preview)</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExplorePlatform(1);
                    }}
                    className="text-[11px] font-bold text-plum-700 hover:text-plum-950 hover:underline flex items-center gap-1"
                  >
                    <span>Full Platform Specs</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {platform.featureCategories ? (
                  <div className="space-y-3">
                    {platform.featureCategories.map((cat, cIdx) => (
                      <div key={cIdx} className="space-y-1.5">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-plum-950 bg-peach-300/80 px-2.5 py-0.5 rounded-md inline-block border border-peach-400/60">
                          {cat.category}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {cat.items.map((feat, idx) => {
                            const isSelected = activePlatformFeature.toLowerCase() === feat.toLowerCase();
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePlatformFeature(feat);
                                }}
                                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                                  isSelected
                                    ? 'bg-plum-950 text-white border border-plum-800 shadow-sm ring-2 ring-peach-300/40 font-bold'
                                    : 'bg-slate-50 text-slate-700 hover:bg-peach-50/80 border border-slate-200'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-peach-300 text-plum-950' : 'bg-plum-700 text-peach-300'
                                  }`}
                                >
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                                <span className="truncate">{feat}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {platform.features.map((feat, idx) => {
                      const isSelected = activePlatformFeature.toLowerCase() === feat.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePlatformFeature(feat);
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-plum-950 text-white border border-plum-800 shadow-sm ring-2 ring-peach-300/40 font-bold'
                              : 'bg-slate-50 text-slate-700 hover:bg-peach-50/80 border border-slate-200'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-peach-300 text-plum-950' : 'bg-plum-700 text-peach-300'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="capitalize">{feat}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Platform Feature Short Description Box */}
                {activePlatformFeature && (
                  <div className="p-3.5 bg-plum-950 text-white rounded-xl border border-plum-800 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-extrabold text-peach-300 flex items-center gap-1.5 capitalize">
                        <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                        <span>{activePlatformFeature}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExplorePlatform(1);
                        }}
                        className="text-[10px] font-bold text-teal-300 hover:underline flex items-center gap-1"
                      >
                        <span>Deep-dive in Platform Guide</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {
                        {
                          'online store': 'Launch a fast, customizable online store with mobile optimization and integrated checkout.',
                          'product catalog': 'Manage unlimited products, SKUs, variants, prices, and rich specs in one central catalog.',
                          'orders': 'Process and fulfill online, offline, and multi-channel orders with automated tracking.',
                          'customers': 'Unified customer profiles with order history, preference memory, and CRM segment tags.',
                          'inventory': 'Real-time inventory tracking across locations with low-stock alerts and automatic sync.',
                          'ai shopping assistant': 'Interactive conversational shopping copilot answering buyer questions 24/7.',
                          'product discovery': 'AI vector search and smart recommendations leading buyers straight to the right items.',
                          'product comparison': 'Side-by-side feature, price, and spec comparison to increase buyer checkout confidence.',
                          'recommendations': 'Personalized product cross-sells and upsells based on browsing and order history.',
                          'customer q&a': 'Automated 24/7 responses to product, shipping, warranty, and store policy questions.',
                          'ai product descriptions': 'Generate high-converting SEO-friendly product titles and descriptions in seconds.',
                          'ai social posts': 'Create engaging social media content for Instagram, Facebook, and WhatsApp automatically.',
                          'ai promotions': 'Design targeted promotional offers, discount codes, and flash sale campaigns with AI.',
                          'ai campaigns': 'Publish and optimize multi-channel marketing campaigns across Meta platforms from one dashboard.',
                        }[activePlatformFeature.toLowerCase()] || 'Explore platform capabilities.'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* SEO Backlinks & Semantic Anchor Network - Visually hidden from UI, active in backend for search engine indexing & organic traffic */}
              <div className="sr-only" aria-label="AI Commerce & Marketing Platform SEO Architecture Backlinks">
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-plum-700" />
                    <span>SEO Architecture Backlinks &amp; Related Pages</span>
                  </span>
                  <span className="text-[10px] font-bold text-teal-700">Indexed &amp; Linked</span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href="/ai-commerce-platform"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onExplorePlatform(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-plum-50 hover:bg-plum-100 text-plum-800 font-bold border border-plum-200 transition-colors flex items-center gap-1"
                    title="AI Commerce & Marketing Platform Hub"
                  >
                    <span>AI Commerce Platform Hub</span>
                    <ExternalLink className="w-3 h-3 text-plum-600" />
                  </a>

                  <a
                    href="/ai-commerce-platform?subPage=1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onExplorePlatform(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="Online Store & Catalog Engine"
                  >
                    Store &amp; Catalog Engine
                  </a>

                  <a
                    href="/ai-commerce-platform?subPage=3"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onExplorePlatform(3);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="Meta AI Social Marketing Automation"
                  >
                    Meta Marketing Automation
                  </a>

                  <a
                    href="/retail-ai-platform"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onExplorePlatform(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="Retail AI Commerce Solutions"
                  >
                    Retail AI Engine
                  </a>

                  <a
                    href="/industries/manufacturing/ai-commerce-platform"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onSelectManufacturingPage) onSelectManufacturingPage(1);
                      else onExplorePlatform(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-plum-50 text-slate-700 hover:text-plum-800 font-semibold border border-slate-200 transition-colors"
                    title="Manufacturing B2B Commerce Platform"
                  >
                    B2B &amp; Manufacturing
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="pt-6 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="text-xs text-slate-500 font-medium">
                <span className="font-extrabold text-slate-900 block text-sm">
                  {platform.highlightStat}
                </span>
                <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-coral-500" />
                  Click anywhere on card to visit dedicated page
                </span>
              </div>
              <a
                href="/ai-commerce-platform"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onExplorePlatform(1);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-extrabold text-white bg-plum-700 hover:bg-plum-800 rounded-xl shadow-md shadow-plum-900/15 transition-all transform active:scale-95 group/btn cursor-pointer shrink-0"
                title="Open AI Commerce Platform dedicated page"
              >
                <span>{platform.buttonText}</span>
                <ArrowRight className="w-4 h-4 text-peach-300 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>

        {/* Semantic Comparison Matrix Table - Visually hidden from UI, active in backend for search engine indexing, AI Overviews & organic traffic */}
        <div className="sr-only" aria-label="Autonomous Smart Commerce Architectural Benchmark Comparison Matrix">
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold tracking-wider uppercase text-plum-900 bg-peach-200/80 px-3 py-1 rounded-full">
              Architectural Benchmark
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              SilarAI Autonomous Smart Commerce vs. Traditional Disconnected Apps
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              See why high-growth online retailers and B2B manufacturers replace fragile multi-app stacks with SilarAI’s unified commerce intelligence engine.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50/70">
                  <th scope="col" className="py-3.5 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Core Capability
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-xs font-bold text-plum-900 bg-plum-50/60 uppercase tracking-wider">
                    SilarAI Smart Commerce Engine
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Traditional App Stacks (Shopify / WooCommerce)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">Conversational AI Shopping</td>
                  <td className="py-3.5 px-4 font-semibold text-plum-900 bg-plum-50/30">
                    Autonomous buying agent with voice search in 20+ languages, photo camera search, and 1-click checkout
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    Basic rule-based chat popups with fixed keyword decision trees
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">Dynamic Pricing Latency</td>
                  <td className="py-3.5 px-4 font-semibold text-plum-900 bg-plum-50/30">
                    Sub-50ms cloud-edge recalculation reacting dynamically to competitor feeds and margins
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    Daily or hourly batch jobs that create pricing lag and lost margin
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">Catalog Visual Merchandising</td>
                  <td className="py-3.5 px-4 font-semibold text-plum-900 bg-plum-50/30">
                    Automated AI grid sorting prioritizing high-margin, high-converting SKUs per user session
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    Manual drag-and-drop category sorting requiring constant weekly updates
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">Enterprise ERP Synchronization</td>
                  <td className="py-3.5 px-4 font-semibold text-plum-900 bg-plum-50/30">
                    Bi-directional real-time connectors for SAP, Oracle, Microsoft Dynamics 365, and Odoo
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    Requires third-party sync middleware costing $5,000 to $20,000 annually
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">WhatsApp Commerce Integration</td>
                  <td className="py-3.5 px-4 font-semibold text-plum-900 bg-plum-50/30">
                    Native catalog discovery, product recommendations, and instant checkout within WhatsApp
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    Manual broadcast messaging with external redirect links that drop conversion
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Backend SEO Structured Data (JSON-LD) - Runs in background to attract organic search traffic & AI Overviews */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "ItemList",
                  "name": "AI Shopping Assistant Architecture & Guide Pages",
                  "description": "Guides, architecture blueprints, and ROI documentation for SilarAI Shopping Assistant.",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "AI Shopping Assistant Core Product Hub",
                      "url": "https://silarai.com/ai-shopping-assistant"
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": "Architecture & Workflow Guide",
                      "url": "https://silarai.com/ai-shopping-assistant?subPage=1"
                    },
                    {
                      "@type": "ListItem",
                      "position": 3,
                      "name": "Conversational Search & WhatsApp AI",
                      "url": "https://silarai.com/ai-shopping-assistant?subPage=2"
                    },
                    {
                      "@type": "ListItem",
                      "position": 4,
                      "name": "+34% Cart Lift ROI Engine",
                      "url": "https://silarai.com/ai-shopping-assistant?subPage=3"
                    },
                    {
                      "@type": "ListItem",
                      "position": 5,
                      "name": "Shopify AI Alternative Comparison",
                      "url": "https://silarai.com/shopify-vs-silarai"
                    },
                    {
                      "@type": "ListItem",
                      "position": 6,
                      "name": "WooCommerce AI Integration Guide",
                      "url": "https://silarai.com/woocommerce-vs-silarai"
                    },
                    {
                      "@type": "ListItem",
                      "position": 7,
                      "name": "D2C Brands AI Shopping Assistant",
                      "url": "https://silarai.com/industries/d2c-brands/ai-shopping-assistant"
                    }
                  ]
                },
                {
                  "@type": "ItemList",
                  "name": "AI Commerce & Marketing Platform Architecture Pages",
                  "description": "Architecture blueprints, feature catalogs, and integrations for SilarAI Commerce Engine.",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "AI Commerce Platform Hub",
                      "url": "https://silarai.com/ai-commerce-platform"
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": "Online Store & Catalog Engine",
                      "url": "https://silarai.com/ai-commerce-platform?subPage=1"
                    },
                    {
                      "@type": "ListItem",
                      "position": 3,
                      "name": "Meta AI Social Marketing Automation",
                      "url": "https://silarai.com/ai-commerce-platform?subPage=3"
                    },
                    {
                      "@type": "ListItem",
                      "position": 4,
                      "name": "Retail AI Commerce Platform",
                      "url": "https://silarai.com/retail-ai-platform"
                    },
                    {
                      "@type": "ListItem",
                      "position": 5,
                      "name": "B2B Wholesale & Distributor Commerce",
                      "url": "https://silarai.com/wholesale-distributor-commerce"
                    },
                    {
                      "@type": "ListItem",
                      "position": 6,
                      "name": "Industrial Manufacturing Portal",
                      "url": "https://silarai.com/industries/manufacturing/ai-commerce-platform"
                    }
                  ]
                },
                {
                  "@type": "Table",
                  "name": "SilarAI Autonomous Smart Commerce vs. Traditional Disconnected Apps Benchmark",
                  "about": "Comparative architectural analysis of SilarAI Smart Commerce Engine versus traditional app stacks like Shopify and WooCommerce across Conversational AI, Dynamic Pricing Latency, Visual Merchandising, ERP Sync, and WhatsApp Commerce.",
                  "description": "Benchmark evaluation matrix comparing SilarAI unified intelligence engine against Shopify and WooCommerce."
                }
              ]
            })
          }}
        />
      </div>
    </section>
  );
};
