import React, { useState } from 'react';
import { PRODUCTS } from '../data/content';
import { Check, Bot, ShoppingBag, ArrowRight, Sparkles, Layers, Zap, Globe, MessageCircle, ShieldCheck } from 'lucide-react';
import aiBotCommerceImg from '../assets/images/ai_bot_commerce_dashboard_1785403446965.jpg';
import aiCommerceEngineImg from '../assets/images/ai_commerce_platform_engine_1785488597071.jpg';

interface ProductsSectionProps {
  onLearnMoreAssistant: () => void;
  onExplorePlatform: () => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  onLearnMoreAssistant,
  onExplorePlatform,
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
            Deploy them independently or combine them for a unified, end-to-end commerce intelligence stack.
          </p>
        </div>

        {/* Two Equal Width Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: AI Shopping Assistant */}
          <div className="bg-white rounded-saas p-8 border border-slate-200 shadow-sleek hover:shadow-sleek-hover transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            {/* Background subtle accent badge */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-peach-300/20 rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-plum-700 text-peach-300 flex items-center justify-center shadow-md shadow-plum-900/20">
                  <Bot className="w-7 h-7" />
                </div>
                <span className="text-xs font-extrabold text-plum-950 bg-peach-300 px-3 py-1 rounded-full border border-peach-400">
                  {assistant.badge}
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                {assistant.title}
              </h3>

              <p className="text-base font-bold text-plum-700 mb-3">
                {assistant.tagline}
              </p>

              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {assistant.description}
              </p>

              {/* Brand Customized AI Assistant Visual */}
              <div className="mb-6 rounded-2xl overflow-hidden border border-plum-200/90 shadow-md group-hover:shadow-lg transition-all relative">
                <img
                  src={aiBotCommerceImg}
                  alt="SilarAI Bot Assistant & Commerce Integration"
                  className="w-full h-48 object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[11px] font-bold text-teal-200 flex items-center gap-1.5 bg-plum-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md border border-teal-300/40">
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    AI Assistant & Smart Commerce Interface
                  </span>
                </div>
              </div>

              {/* Feature Checklist Grid */}
              <div className="space-y-3 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Included Features (Click section to view details)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {assistant.features.map((feat, idx) => {
                    const isSelected = activeAssistantFeature === feat || activeAssistantFeature.toLowerCase() === feat.toLowerCase();
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveAssistantFeature(feat)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-plum-950 text-white border border-plum-800 shadow-sm ring-2 ring-peach-300/40 font-bold'
                            : 'bg-slate-50 text-slate-700 hover:bg-peach-50/80 border border-slate-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-peach-300 text-plum-950' : 'bg-plum-700 text-peach-300'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="capitalize">{feat}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Feature Short Description Box */}
                {activeAssistantFeature && (
                  <div className="p-3.5 bg-plum-950 text-white rounded-xl border border-plum-800 space-y-1 animate-in fade-in duration-200">
                    <div className="text-xs font-extrabold text-peach-300 flex items-center gap-1.5 capitalize">
                      <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                      <span>{activeAssistantFeature}</span>
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
                          'personalized suggestions': 'Discover products tailored to your shopping history, interests, and buying behavior.'
                        }[activeAssistantFeature.toLowerCase()] || 'Explore feature capabilities.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-900 block">{assistant.highlightStat}</span>
              </div>
              <button
                onClick={onLearnMoreAssistant}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-plum-700 hover:bg-plum-800 rounded-xl shadow-md shadow-plum-900/15 transition-all transform active:scale-95"
              >
                {assistant.buttonText}
                <ArrowRight className="w-4 h-4 text-peach-300" />
              </button>
            </div>
          </div>

          {/* Card 2: Commerce Platform */}
          <div className="bg-white rounded-saas p-8 border border-slate-200 shadow-sleek hover:shadow-sleek-hover transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            {/* Background subtle accent badge */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-plum-700/5 rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-plum-900 text-peach-300 flex items-center justify-center shadow-md shadow-plum-950/20">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <span className="text-xs font-extrabold text-plum-950 bg-peach-300 px-3 py-1 rounded-full border border-peach-400">
                  {platform.badge}
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                {platform.title}
              </h3>

              <p className="text-base font-bold text-plum-700 mb-3">
                {platform.tagline}
              </p>

              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {platform.description}
              </p>

              {/* Brand Customized AI Commerce & Marketing Platform Visual */}
              <div className="mb-6 rounded-2xl overflow-hidden border border-plum-200/90 shadow-md group-hover:shadow-lg transition-all relative">
                <img
                  src={aiCommerceEngineImg}
                  alt="AI Commerce & Marketing Platform"
                  className="w-full h-48 object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[11px] font-bold text-teal-200 flex items-center gap-1.5 bg-plum-900/80 px-2.5 py-1 rounded-lg backdrop-blur-md border border-teal-300/40">
                    <Layers className="w-3.5 h-3.5 text-teal-300" />
                    Ecommerce Store • AI Shopping • Meta Social Marketing
                  </span>
                </div>
              </div>

              {/* Categorized Feature Grid */}
              <div className="space-y-4 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Included Capabilities (Click section to preview)
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
                                onClick={() => setActivePlatformFeature(feat)}
                                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                                  isSelected
                                    ? 'bg-plum-950 text-white border border-plum-800 shadow-sm ring-2 ring-peach-300/40 font-bold'
                                    : 'bg-slate-50 text-slate-700 hover:bg-peach-50/80 border border-slate-200'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-peach-300 text-plum-950' : 'bg-plum-700 text-peach-300'
                                }`}>
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
                      const isSelected = activePlatformFeature === feat || activePlatformFeature.toLowerCase() === feat.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePlatformFeature(feat)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-plum-950 text-white border border-plum-800 shadow-sm ring-2 ring-peach-300/40 font-bold'
                              : 'bg-slate-50 text-slate-700 hover:bg-peach-50/80 border border-slate-200'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-peach-300 text-plum-950' : 'bg-plum-700 text-peach-300'
                          }`}>
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
                  <div className="p-3.5 bg-plum-950 text-white rounded-xl border border-plum-800 space-y-1 animate-in fade-in duration-200">
                    <div className="text-xs font-extrabold text-peach-300 flex items-center gap-1.5 capitalize">
                      <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                      <span>{activePlatformFeature}</span>
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
                          'ai campaigns': 'Publish and optimize multi-channel marketing campaigns across Meta platforms from one dashboard.'
                        }[activePlatformFeature.toLowerCase()] || 'Explore platform capabilities.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-900 block">{platform.highlightStat}</span>
              </div>
              <button
                onClick={onExplorePlatform}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-plum-700 hover:bg-plum-800 rounded-xl shadow-md shadow-plum-900/15 transition-all transform active:scale-95"
              >
                {platform.buttonText}
                <ArrowRight className="w-4 h-4 text-peach-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
