import React, { useState } from 'react';
import { DASHBOARD_FEATURES } from '../data/content';
import { Bot, Layers, LineChart, Users, Tag, Search, Check, Sparkles, LayoutDashboard, BrainCircuit, ShoppingCart } from 'lucide-react';
import aiBotCommerceImg from '../assets/images/ai_bot_commerce_dashboard_1785403446965.jpg';
import aiCommerceEngineImg from '../assets/images/ai_commerce_platform_engine_1785488597071.jpg';

export const DashboardSection: React.FC = () => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('assistant');

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot':
        return <Bot className="w-5 h-5 text-plum-700" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-plum-700" />;
      case 'LineChart':
        return <LineChart className="w-5 h-5 text-plum-700" />;
      case 'Users':
        return <Users className="w-5 h-5 text-plum-700" />;
      case 'Tag':
        return <Tag className="w-5 h-5 text-plum-700" />;
      case 'Search':
        return <Search className="w-5 h-5 text-plum-700" />;
      case 'BrainCircuit':
        return <BrainCircuit className="w-5 h-5 text-plum-700" />;
      case 'ShoppingCart':
        return <ShoppingCart className="w-5 h-5 text-plum-700" />;
      default:
        return <Bot className="w-5 h-5 text-plum-700" />;
    }
  };

  const selectedFeature = DASHBOARD_FEATURES.find((f) => f.id === selectedFeatureId) || DASHBOARD_FEATURES[0];

  return (
    <section id="dashboard" className="py-20 bg-slate-50/50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-plum-900 bg-peach-300 px-3.5 py-1.5 rounded-full border border-peach-400/60">
            Unified Management Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to grow your business
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            A single enterprise dashboard connecting customer conversations, catalog indexing, analytics, accounts, promotions, and SEO.
          </p>
        </div>

        {/* Feature Cards Grid (6 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {DASHBOARD_FEATURES.map((feature) => {
            const isSelected = selectedFeatureId === feature.id;
            return (
              <div
                key={feature.id}
                onClick={() => setSelectedFeatureId(feature.id)}
                className={`p-6 rounded-saas border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-white border-plum-700 shadow-sleek-hover ring-2 ring-plum-700/20'
                    : 'bg-white border-slate-200 hover:border-plum-300 shadow-sleek'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-plum-50 flex items-center justify-center group-hover:bg-plum-700 group-hover:text-peach-300 transition-colors">
                      {getFeatureIcon(feature.icon)}
                    </div>
                    <span className="text-[11px] font-extrabold text-plum-950 bg-peach-200 px-2.5 py-0.5 rounded-full border border-peach-300">
                      {feature.metricsText}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-1 group-hover:text-plum-700 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs font-bold text-plum-700 mb-2">
                    {feature.subtitle}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-plum-700">
                  <span>View Demo Interface</span>
                  <Sparkles className="w-3.5 h-3.5 text-peach-600" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Large Product Screenshot Mockup Display */}
        <div className="bg-white rounded-saas p-4 sm:p-6 border border-slate-200 shadow-2xl relative overflow-hidden">
          {/* Top Mockup Control Bar */}
          <div className="flex items-center justify-between bg-plum-950 text-white px-4 py-3 rounded-2xl mb-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-peach-300" />
              <div className="text-xs sm:text-sm font-bold">
                SilarAI Dashboard &gt; <span className="text-peach-300">{selectedFeature.title}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-peach-300 text-plum-950 px-2.5 py-1 rounded-md font-extrabold">
              PRO PLATFORM
            </span>
          </div>

          {/* Screenshot Content Simulation */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  {selectedFeature.title} Module
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedFeature.description}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="px-3.5 py-2 text-xs font-bold text-white bg-plum-700 hover:bg-plum-800 rounded-xl shadow-xs">
                  Export Report
                </button>
                <button className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                  Configure Settings
                </button>
              </div>
            </div>

            {/* Feature Specific Mock Visual */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
                <img
                  src={selectedFeatureId === 'meta-marketing' || selectedFeatureId === 'page-builder' || selectedFeatureId === 'b2b-inbox' || selectedFeatureId === 'payment-gateways' ? aiCommerceEngineImg : aiBotCommerceImg}
                  alt="AI Commerce & Marketing Platform Interface"
                  className="w-full h-64 object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-950/80 via-transparent to-transparent flex items-end p-4">
                  <div className="bg-plum-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-teal-300/40 text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-coral-400 animate-pulse" />
                    <span>Live AI Commerce &amp; Marketing Platform: {selectedFeature.title}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs text-slate-500 font-semibold">Active Catalog Status</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">42,500 SKUs</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">100% Vector Embedded</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs text-slate-500 font-semibold">AI Resolution Rate</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">96.8%</div>
                  <div className="text-[11px] text-plum-700 font-bold mt-1">Automated Resolution</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xs text-slate-500 font-semibold">Target Metric</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{selectedFeature.metricsText}</div>
                  <div className="text-[11px] text-plum-900 font-bold mt-1">Optimized by SilarAI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
