import React, { useState } from 'react';
import { INTEGRATIONS } from '../data/content';
import { CheckCircle2, ArrowUpRight, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';
import { IntegrationTool } from '../types';

interface TrustedIntegrationsProps {
  onBookDemo?: (plan?: string) => void;
}

export const TrustedIntegrations: React.FC<TrustedIntegrationsProps> = ({ onBookDemo }) => {
  const [selectedTool, setSelectedTool] = useState<IntegrationTool | null>(INTEGRATIONS[0]);

  return (
    <section className="py-16 md:py-24 bg-plum-50/40 border-y border-plum-100/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-peach-300/90 text-plum-950 font-black text-xs uppercase tracking-wider border border-peach-400/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-plum-900" />
            Ecosystem Integrations
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Deployed AI Shopping Assistant Across All Major E-Commerce Platforms
          </h2>

          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Easily connect SilarAI to your existing storefront. Deploy instantly via a simple script embed across Shopify, Wix, BigCommerce, Adobe Commerce, WooCommerce, Squarespace, Big Cartel, Square Online, Shift4Shop, Volusion, and OpenCart.
          </p>
        </div>

        {/* Integration Grid Cards (11 Platforms) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {INTEGRATIONS.map((tool) => {
            const isSelected = selectedTool?.id === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className={`p-4 rounded-2xl border transition-all duration-200 text-center flex flex-col items-center justify-between gap-3 group relative cursor-pointer ${
                  isSelected
                    ? 'bg-white border-plum-700 shadow-md ring-2 ring-plum-700/20'
                    : 'bg-white/90 hover:bg-white border-slate-200 hover:border-plum-300 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center gap-2 w-full">
                  {/* Platform Logo Badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-plum-700 text-peach-300 shadow-md'
                        : 'bg-plum-50 text-plum-900 group-hover:bg-plum-100'
                    }`}
                  >
                    {tool.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-plum-800 line-clamp-1 w-full">
                    {tool.name}
                  </div>
                </div>

                <div className="w-full pt-1">
                  <span
                    className={`inline-block w-full text-[10px] font-bold px-2 py-0.5 rounded-full text-center ${
                      isSelected
                        ? 'bg-coral-400 text-plum-950'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {tool.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Platform Details Preview Banner */}
        {selectedTool && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-md max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-plum-950 text-teal-300 font-black text-xl flex items-center justify-center shadow-md shrink-0 border border-plum-800">
                {selectedTool.name.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    SilarAI for {selectedTool.name}
                  </h3>
                  <span className="text-xs font-extrabold text-plum-950 bg-peach-300 px-2.5 py-0.5 rounded-full border border-peach-400">
                    {selectedTool.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                  {selectedTool.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-plum-900 flex items-center gap-1.5 justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Catalog Vectorized
                </div>
                <div className="text-[11px] text-slate-500 font-medium">1-Click Automated Sync</div>
              </div>

              <button
                onClick={() =>
                  onBookDemo ? onBookDemo(`${selectedTool.name} Script Embed Integration`) : alert(`Book a demo to get your ${selectedTool.name} Script Embed Tag!`)
                }
                className="w-full sm:w-auto px-5 py-3 text-xs font-extrabold text-plum-950 bg-coral-400 hover:bg-coral-500 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-coral-500/20 active:scale-98 cursor-pointer"
              >
                <span>Get {selectedTool.name} Script Embed</span>
                <ArrowUpRight className="w-4 h-4 text-plum-950" />
              </button>
            </div>
          </div>
        )}

        {/* Footer Brand Badges Row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-extrabold text-slate-600 border-t border-plum-100/80 pt-8 max-w-3xl mx-auto">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-plum-700" /> Zero Code Required
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-coral-500" /> Sub-100ms Response Latency
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-600" /> 2-Way Live Inventory Sync
          </span>
        </div>
      </div>
    </section>
  );
};

