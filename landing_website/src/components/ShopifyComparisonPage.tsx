import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Search,
  Zap,
  ShoppingBag,
  Bot,
  Layers,
  BarChart3,
  MessageSquare,
  Globe,
  Database,
  Users,
  Layout,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ShopifyComparisonPageProps {
  onBackToHome: () => void;
  onBookDemo: (plan?: string) => void;
}

export interface ComparisonItem {
  capability: string;
  shopify: string;
  silarAi: string;
  category?: string;
}

export const SHOPIFY_COMPARISON_DATA: ComparisonItem[] = [
  {
    capability: 'AI-Powered Ecommerce',
    shopify: 'Online store with AI features and app ecosystem',
    silarAi: 'AI-first commerce platform with AI built into core workflows',
  },
  {
    capability: 'AI Shopping Assistant',
    shopify: 'Available through apps or custom integrations',
    silarAi: 'Built-in AI Shopping Assistant with product discovery, recommendations, and customer Q&A',
  },
  {
    capability: 'AI Product Discovery',
    shopify: 'Search and filtering with optional AI apps',
    silarAi: 'Conversational AI product discovery built into the platform',
  },
  {
    capability: 'AI Product Recommendations',
    shopify: 'Available through themes and apps',
    silarAi: 'Native AI-powered recommendations and cross-selling',
  },
  {
    capability: 'AI Product Descriptions',
    shopify: 'Available using Shopify AI features',
    silarAi: 'AI-generated product descriptions, blogs, promotions, and marketing content',
  },
  {
    capability: 'Social Media Management',
    shopify: 'Integrates with marketing channels and third-party tools',
    silarAi: 'Built-in dashboard to create, manage, and publish marketing campaigns',
  },
  {
    capability: 'Facebook & Instagram Publishing',
    shopify: 'Supported through integrations',
    silarAi: 'Native publishing and campaign management from one platform',
  },
  {
    capability: 'WhatsApp Commerce',
    shopify: 'Typically requires third-party integrations',
    silarAi: 'Built-in WhatsApp engagement, shopping assistance, and customer communication',
  },
  {
    capability: 'Marketing Campaigns',
    shopify: 'Uses Shopify features plus third-party marketing apps',
    silarAi: 'AI-assisted campaign creation, scheduling, and publishing',
  },
  {
    capability: 'AI Content Generation',
    shopify: 'Limited to supported AI features',
    silarAi: 'Generate blogs, product pages, ads, emails, promotions, and social posts using AI',
  },
  {
    capability: 'Customer Conversations',
    shopify: 'Multiple apps may be needed depending on channels',
    silarAi: 'Unified conversations across website, Facebook, Instagram, and WhatsApp',
  },
  {
    capability: 'Marketing Automation',
    shopify: 'Available through Shopify and third-party apps',
    silarAi: 'Built-in AI marketing automation and customer journeys',
  },
  {
    capability: 'Lead Management',
    shopify: 'Apps or CRM integrations',
    silarAi: 'Integrated lead capture and customer management',
  },
  {
    capability: 'Analytics',
    shopify: 'Ecommerce analytics with additional apps for expanded reporting',
    silarAi: 'Unified dashboard for commerce, AI, marketing, customer engagement, and campaign performance',
  },
  {
    capability: 'Commerce & Marketing',
    shopify: 'Multiple applications may be used depending on business needs',
    silarAi: 'One unified platform for selling, marketing, customer engagement, and AI automation',
  }
];

export const ShopifyComparisonPage: React.FC<ShopifyComparisonPageProps> = ({
  onBackToHome,
  onBookDemo
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = SHOPIFY_COMPARISON_DATA.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.capability.toLowerCase().includes(q) ||
      item.shopify.toLowerCase().includes(q) ||
      item.silarAi.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pt-24 pb-20">
      {/* Top Breadcrumb & Hero Header */}
      <div className="bg-plum-950 text-white relative overflow-hidden border-b border-plum-800 py-16 lg:py-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-plum-800/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back Navigation Button */}
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-teal-300 text-xs font-bold transition-all mb-8 border border-white/10 hover:border-white/20 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 font-extrabold text-xs tracking-wider uppercase border border-peach-300/30">
              <Sparkles className="w-3.5 h-3.5" />
              Platform Comparison
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Shopify <span className="text-slate-400 font-light">vs</span> <span className="text-peach-300">SilarAI</span>
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-teal-200">
              More Than an Ecommerce Platform
            </p>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal pt-2">
              Shopify is an excellent ecommerce platform. SilarAI is designed for businesses that want to manage ecommerce, AI-powered shopping, marketing, and customer engagement from one intelligent platform.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Core Value Pillars Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-plum-50 text-plum-700 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Native AI vs App Plugins</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Shopify relies heavily on paid third-party apps for AI chatbots, marketing, and CRM. SilarAI includes these natively out-of-the-box with deep catalog memory.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-plum-50 text-plum-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Intent-Driven Conversational Commerce</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instead of static filter trees and rigid collection pages, SilarAI guides customers naturally through voice, text, WhatsApp, and social messaging in any language.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-plum-50 text-plum-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Built-in B2B & Meta Hub</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Shopify restricts advanced B2B features to Shopify Plus ($2,000+/mo). SilarAI includes dealer management, custom pricing tiers, and full Meta Marketing natively.
            </p>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Detailed Capability Breakdown
              </h2>
              <p className="text-sm text-slate-600">
                A side-by-side comparison of core ecommerce & AI functionality.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search capabilities..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-700 font-medium"
              />
            </div>
          </div>

          <div className="bg-white rounded-saas border border-slate-200 shadow-sleek overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-plum-950 text-white">
                    <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-plum-200 w-1/4">
                      Capability
                    </th>
                    <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-300 w-3/8 bg-plum-900/80">
                      Shopify
                    </th>
                    <th className="p-4 sm:p-5 text-xs font-extrabold uppercase tracking-wider text-peach-300 w-3/8 bg-plum-900">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-peach-300" />
                        <span>SilarAI AI Commerce &amp; Marketing Platform</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/50'}
                    >
                      <td className="p-4 sm:p-5 font-extrabold text-slate-900 border-r border-slate-200">
                        <div>{item.capability}</div>
                        {item.category && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                            {item.category}
                          </span>
                        )}
                      </td>

                      <td className="p-4 sm:p-5 text-slate-600 border-r border-slate-200 bg-slate-50/30">
                        <div className="flex items-start gap-2.5">
                          <X className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-600">{item.shopify}</span>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 font-semibold text-slate-900 bg-peach-100/40">
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-plum-700 text-peach-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-plum-950 font-extrabold leading-snug">{item.silarAi}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500 text-sm font-medium">
                        No capability matches "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why Businesses Choose SilarAI Section */}
        <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Businesses Choose SilarAI
            </h2>
            <p className="text-base text-slate-700 font-semibold">
              Businesses choose SilarAI when they want more than an online store.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              Instead of managing separate tools for ecommerce, AI content creation, social media publishing, WhatsApp engagement, and marketing automation, SilarAI brings everything together in one AI-powered platform.
            </p>
          </div>

          <div className="pt-2 space-y-4">
            <h3 className="text-lg font-extrabold text-plum-950">
              With SilarAI You Can
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Build and manage your ecommerce store',
                'Help customers shop with AI',
                'Generate marketing content using AI',
                'Publish campaigns to Facebook and Instagram',
                'Engage customers through WhatsApp',
                'Manage marketing and commerce from one dashboard',
                'Reduce reliance on multiple third-party tools',
                'Grow your business with AI-powered automation',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Which Platform Is Right for You? Section */}
        <section className="bg-gradient-to-b from-slate-900 to-plum-950 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Which Platform Is Right for You?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-lg font-extrabold text-peach-300">
                Choose Shopify if you want:
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-peach-300 shrink-0 mt-0.5" />
                  <span>A mature ecommerce platform with a large app ecosystem</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-peach-300 shrink-0 mt-0.5" />
                  <span>Extensive third-party integrations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-peach-300 shrink-0 mt-0.5" />
                  <span>Flexibility to assemble your own software stack</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-4">
              <h3 className="text-lg font-extrabold text-teal-300">
                Choose SilarAI if you want:
              </h3>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>An AI-first commerce experience</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>Built-in AI shopping assistance</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>Unified commerce and marketing workflows</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>AI-generated content and campaigns</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>One platform to sell, market, and grow your business</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xl sm:text-2xl font-black text-peach-300 tracking-wider">
              Sell. Market. Grow. Powered by AI.
            </p>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-sm font-black text-slate-900">Can I keep my existing Shopify store while using SilarAi?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes. SilarAi offers a 1-line script embed tag that embeds our AI Shopping Assistant and dynamic pricing engine directly onto your live Shopify storefront without migrating host systems.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-sm font-black text-slate-900">How does SilarAi compare to Shopify Sidekick or Shopify Magic?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Shopify Magic focuses primarily on backend merchant copy generation. SilarAi is a consumer-facing agentic AI platform that conducts multimodal voice, camera photo search, and automated 1-click cart checkouts directly for buyers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-sm font-black text-slate-900">Does SilarAi require Shopify Plus for B2B portal features?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                No. B2B net terms, dealer pricing tiers, custom bulk price schedules, and wholesale registration forms are built into all SilarAi core plans without upgrading to $2,000/mo Shopify Plus tiers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-sm font-black text-slate-900">How long does catalog vectorization and setup take?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                SilarAi automatically syncs and indexes your Shopify product catalog, metadata, and FAQ spec sheets in under 5 minutes using automated API connectors.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white p-8 sm:p-12 rounded-3xl border border-plum-800 shadow-xl text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade from Shopify to SilarAI?
            </h2>
            <p className="text-xs sm:text-sm text-plum-200 leading-relaxed">
              Book a live 1-on-1 walkthrough to see how easily you can migrate your catalog and launch conversational AI shopping in days.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onBookDemo()}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4 text-plum-950" />
            </button>

            <button
              onClick={() => onBookDemo('Enterprise')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-plum-800 hover:bg-plum-700 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all cursor-pointer"
            >
              <span>Talk to Migration Specialist</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
