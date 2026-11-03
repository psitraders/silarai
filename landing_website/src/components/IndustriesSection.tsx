import React, { useState } from 'react';
import { INDUSTRIES } from '../data/content';
import {
  Factory,
  Truck,
  Boxes,
  ShoppingBag,
  Store,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  X,
  AlertTriangle,
  Zap,
  Sparkles,
  Bot,
  TrendingUp,
  Users,
  Target,
  ShieldCheck,
  Package,
  MessageSquare
} from 'lucide-react';
import { IndustrySolution } from '../types';

interface IndustriesSectionProps {
  onBookDemo?: (industryTitle?: string) => void;
  activeIndustryId?: string | null;
  onSelectIndustry?: (industryId: string | null) => void;
  onNavigateRetailerOrdering?: () => void;
}

export const IndustriesSection: React.FC<IndustriesSectionProps> = ({
  onBookDemo,
  activeIndustryId,
  onSelectIndustry,
  onNavigateRetailerOrdering,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [internalModalIndustry, setInternalModalIndustry] = useState<IndustrySolution | null>(null);
  const [fmcgModalTab, setFmcgModalTab] = useState<'brands' | 'retailer-ordering'>('brands');

  // Active industry resolves from prop or internal state
  const activeModalIndustry =
    (activeIndustryId ? INDUSTRIES.find((ind) => ind.id === activeIndustryId) : null) ||
    internalModalIndustry;

  const handleOpenIndustry = (ind: IndustrySolution, tab: 'brands' | 'retailer-ordering' = 'brands') => {
    setFmcgModalTab(tab);
    setInternalModalIndustry(ind);
  };

  const handleCloseIndustry = () => {
    setInternalModalIndustry(null);
    if (onSelectIndustry) {
      onSelectIndustry(null);
    }
  };

  const getIndustryIcon = (iconName: string, className = 'w-6 h-6 text-plum-700') => {
    switch (iconName) {
      case 'Factory':
        return <Factory className={className} />;
      case 'Truck':
        return <Truck className={className} />;
      case 'Boxes':
        return <Boxes className={className} />;
      case 'ShoppingBag':
        return <ShoppingBag className={className} />;
      case 'Store':
        return <Store className={className} />;
      default:
        return <Factory className={className} />;
    }
  };

  const filteredIndustries =
    selectedFilter === 'all'
      ? INDUSTRIES
      : INDUSTRIES.filter((ind) => ind.id === selectedFilter);

  return (
    <section id="industries" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full border border-peach-400 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-plum-900" />
            Tailored Industry Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Commerce Intelligence for Every Industry
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Purpose-built AI models, custom customer engagement engines, and revenue analytics mapped specifically to your business model.
          </p>

          {/* Quick Industry Filter Tabs */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-plum-950 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Industries ({INDUSTRIES.length})
            </button>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                onClick={() => setSelectedFilter(ind.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  selectedFilter === ind.id
                    ? 'bg-plum-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {getIndustryIcon(ind.icon, 'w-3.5 h-3.5')}
                <span>{ind.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5 Primary Industry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIndustries.map((ind) => (
            <div
              key={ind.id}
              onClick={() => handleOpenIndustry(ind)}
              className="bg-white rounded-saas p-6 border border-slate-200 shadow-sleek hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group hover:border-plum-400 cursor-pointer relative"
            >
              <div className="space-y-4">
                {/* Header Icon + Metric Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-plum-50 flex items-center justify-center group-hover:bg-plum-700 group-hover:text-peach-300 transition-colors border border-plum-100">
                    {getIndustryIcon(ind.icon, 'w-6 h-6 text-plum-700 group-hover:text-peach-300 transition-colors')}
                  </div>
                  <span className="text-xs font-extrabold text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
                    {ind.stat} {ind.statLabel}
                  </span>
                </div>

                {/* Title & Headline */}
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-plum-800 transition-colors flex items-center justify-between">
                    <span>{ind.title}</span>
                    <span className="text-xs font-bold text-plum-600 group-hover:text-plum-800 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Page <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </h3>
                  <p className="text-xs font-bold text-plum-700 mt-0.5">
                    {ind.headline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {ind.description}
                </p>

                {/* Challenges Highlight */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Top Challenges Solved</span>
                  </div>
                  <ul className="text-xs text-amber-950 space-y-1 pl-1">
                    {ind.challenges.slice(0, 3).map((ch, cIdx) => (
                      <li key={cIdx} className="flex items-center gap-1.5 text-[11px] font-medium">
                        <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                        <span className="truncate">{ch}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How SilarAI Helps */}
                <div className="bg-plum-50/60 p-3 rounded-xl border border-plum-100 space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase text-plum-950 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-plum-700 shrink-0" />
                    <span>How SilarAI Helps</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ind.howSilarAiHelps.slice(0, 3).map((h, hIdx) => (
                      <span key={hIdx} className="text-[10px] bg-white text-plum-900 px-2 py-0.5 rounded-md border border-plum-200 font-bold">
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ideal For Segments */}
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ideal For</div>
                  <div className="flex flex-wrap gap-1">
                    {ind.idealFor.slice(0, 4).map((seg, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        {seg}
                      </span>
                    ))}
                    {ind.idealFor.length > 4 && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">
                        +{ind.idealFor.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* FMCG Connected Solution Callout */}
                {ind.id === 'fmcg' && (
                  <div className="bg-peach-50/90 p-3 rounded-xl border border-peach-200/90 space-y-1 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-plum-950 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-plum-800" />
                        Connected Solution Included
                      </span>
                      <span className="text-[9px] font-bold bg-peach-300 text-plum-950 px-1.5 py-0.2 rounded">AI B2B</span>
                    </div>
                    <div className="text-xs font-bold text-plum-900">
                      AI-Powered FMCG Retailer Ordering Solution
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      Conversational WhatsApp/Voice ordering, 3-min reorders &amp; ERP sync.
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer Button */}
              <div className="pt-4 mt-3 border-t border-slate-100">
                {ind.id === 'fmcg' ? (
                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenIndustry(ind, 'brands');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-plum-700 hover:bg-plum-800 text-white font-black text-xs transition-all flex items-center justify-between shadow-2xs cursor-pointer group"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-peach-300" />
                        <span>View &amp; Read FMCG Contents</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-peach-300 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectIndustry) onSelectIndustry('fmcg');
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-plum-50 hover:bg-plum-100 text-plum-950 font-bold text-[11px] transition-colors flex items-center justify-center gap-1 border border-plum-200 cursor-pointer"
                      >
                        <span>Brands Page</span>
                        <ArrowRight className="w-3 h-3 text-plum-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateRetailerOrdering) onNavigateRetailerOrdering();
                          else if (onSelectIndustry) onSelectIndustry('fmcg-retailer-ordering-solution');
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-peach-100 hover:bg-peach-200 text-plum-950 font-bold text-[11px] transition-colors flex items-center justify-center gap-1 border border-peach-300 cursor-pointer"
                      >
                        <span>Retailer Ordering</span>
                        <ArrowRight className="w-3 h-3 text-plum-700" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenIndustry(ind);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-plum-50 group-hover:bg-plum-700 text-plum-900 group-hover:text-white font-extrabold text-xs transition-all flex items-center justify-between border border-plum-200/80 group-hover:border-plum-700 shadow-2xs cursor-pointer"
                  >
                    <span>Open {ind.title} Solution Page</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-plum-700 group-hover:text-peach-300" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ________________________________________ */}
        {/* Full Interactive SEO Landing Page Modal / Drawer */}
        {activeModalIndustry && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-saas max-w-4xl w-full border border-slate-200 shadow-2xl relative my-auto overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Sticky Top Header */}
              <div className="bg-plum-950 text-white p-5 sm:p-6 flex items-start justify-between border-b border-plum-900 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-plum-700 text-peach-300 flex items-center justify-center shadow-md border border-plum-600 shrink-0">
                    {activeModalIndustry.id === 'fmcg' && fmcgModalTab === 'retailer-ordering' ? (
                      <Store className="w-6 h-6 text-peach-300" />
                    ) : (
                      getIndustryIcon(activeModalIndustry.icon, 'w-6 h-6 text-peach-300')
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-peach-300 bg-plum-900/80 px-2.5 py-0.5 rounded-md border border-plum-800">
                      {activeModalIndustry.id === 'fmcg'
                        ? fmcgModalTab === 'retailer-ordering'
                          ? 'AI-Powered Retailer Ordering Solution'
                          : 'AI Commerce Platform for FMCG Brands'
                        : `AI Commerce Intelligence for ${activeModalIndustry.title}`}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                      {activeModalIndustry.id === 'fmcg'
                        ? fmcgModalTab === 'retailer-ordering'
                          ? 'Make FMCG ordering as simple as having a conversation'
                          : activeModalIndustry.headline
                        : activeModalIndustry.headline}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={handleCloseIndustry}
                  className="p-2 text-plum-300 hover:text-white rounded-xl hover:bg-plum-900 transition-colors shrink-0 cursor-pointer"
                  aria-label="Close page"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* FMCG Tab Switcher Bar (when FMCG is selected) */}
              {activeModalIndustry.id === 'fmcg' && (
                <div className="bg-plum-900/95 px-5 sm:px-6 py-3 border-b border-plum-800 flex flex-wrap items-center justify-between gap-3 sticky top-[88px] z-10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-plum-200">Select Solution to Read:</span>
                    <div className="inline-flex p-1 bg-plum-950 rounded-xl border border-plum-800">
                      <button
                        onClick={() => setFmcgModalTab('brands')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                          fmcgModalTab === 'brands'
                            ? 'bg-peach-300 text-plum-950 shadow-xs'
                            : 'text-plum-200 hover:text-white'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>FMCG Brands Platform</span>
                      </button>
                      <button
                        onClick={() => setFmcgModalTab('retailer-ordering')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                          fmcgModalTab === 'retailer-ordering'
                            ? 'bg-peach-300 text-plum-950 shadow-xs'
                            : 'text-plum-200 hover:text-white'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Retailer Ordering Solution</span>
                        <span className="text-[9px] bg-plum-900 text-peach-200 px-1 py-0.2 rounded font-black">AI</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {fmcgModalTab === 'brands' ? (
                      <button
                        onClick={() => {
                          handleCloseIndustry();
                          if (onSelectIndustry) onSelectIndustry('fmcg');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-peach-300 hover:bg-peach-200 text-plum-950 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Full FMCG Page</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleCloseIndustry();
                          if (onNavigateRetailerOrdering) onNavigateRetailerOrdering();
                          else if (onSelectIndustry) onSelectIndustry('fmcg-retailer-ordering-solution');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-peach-300 hover:bg-peach-200 text-plum-950 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Full Retailer Ordering Page</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Scrollable SEO Landing Page Content Body */}
              <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">

                {/* FMCG RETAILER ORDERING SOLUTION TAB VIEW */}
                {activeModalIndustry.id === 'fmcg' && fmcgModalTab === 'retailer-ordering' ? (
                  <div className="space-y-8">
                    {/* Hero Banner for Retailer Ordering */}
                    <div className="bg-peach-50/80 p-5 rounded-2xl border border-peach-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-peach-200 text-plum-950 text-[11px] font-black uppercase tracking-wider">
                          <Store className="w-3.5 h-3.5 text-plum-900" />
                          <span>Conversational B2B Commerce for FMCG</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-plum-950">
                          Make FMCG Ordering as Simple as Having a Conversation
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                          Help retailers discover products, find the right SKUs, build bulk orders and reorder faster with an AI-powered B2B ordering assistant across 1,000+ catalog SKUs—without forcing retailers to browse complex catalog matrices.
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-peach-200 shadow-sm shrink-0 text-center min-w-[200px]">
                        <div className="text-[10px] font-extrabold uppercase text-plum-700">Verified Impact</div>
                        <div className="text-2xl font-black text-slate-900 mt-0.5">3 Minutes</div>
                        <div className="text-xs font-bold text-slate-600">Average Reorder Completion</div>
                      </div>
                    </div>

                    {/* Top 5 Retailer Ordering Challenges */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-extrabold text-slate-900">
                          Top 5 Retailer Ordering Challenges Solved
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          {
                            title: 'Manual Phone & WhatsApp Orders',
                            desc: 'Ambiguous texts and scribbled voice notes cause order entry mistakes and missed deliveries.'
                          },
                          {
                            title: 'Large & Confusing SKU Portfolios',
                            desc: 'Hundreds of packaging sizes, flavor variants, and case counts overwhelm retail store owners.'
                          },
                          {
                            title: 'Slow Ordering Cycles',
                            desc: 'Retailers wait days for field sales reps to visit, creating shelf stockouts and lost revenue.'
                          },
                          {
                            title: 'Trade Promotion Complexity',
                            desc: 'Volume tier breaks, promotional bundles, and dealer credits are often miscalculated.'
                          },
                          {
                            title: 'Stock Visibility Blindspots',
                            desc: 'Retailers order out-of-stock items without real-time warehouse inventory visibility.'
                          }
                        ].map((ch, idx) => (
                          <div
                            key={idx}
                            className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80 flex items-start gap-2.5"
                          >
                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              0{idx + 1}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{ch.title}</div>
                              <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{ch.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* How SilarAI Solves Retailer Ordering */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Zap className="w-5 h-5 text-plum-700" />
                        <h3 className="text-lg font-extrabold text-slate-900">
                          How SilarAI Powers Conversational Retailer Ordering
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2 text-plum-800 font-extrabold text-xs">
                            <Bot className="w-4 h-4 text-plum-700" />
                            <span>Natural Language Intent Ordering</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Retailers type or voice: &quot;I need 20 cases of 500ml beverage and 10 cases of family pack.&quot; AI parses intent, matches exact SKUs, and builds bulk carts in seconds.
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2 text-plum-800 font-extrabold text-xs">
                            <MessageSquare className="w-4 h-4 text-plum-700" />
                            <span>WhatsApp &amp; Multi-Channel Commerce</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Enables retailers to place orders directly on WhatsApp, Mobile Web, or Voice without installing heavy apps or remembering complex passwords.
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2 text-plum-800 font-extrabold text-xs">
                            <TrendingUp className="w-4 h-4 text-plum-700" />
                            <span>3-Minute Quick Reorder Memory</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Pre-populates favorite reorder baskets based on weekly store velocity and sends automated replenishment reminders before stockouts occur.
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2 text-plum-800 font-extrabold text-xs">
                            <ShieldCheck className="w-4 h-4 text-plum-700" />
                            <span>ERP &amp; Trade Pricing Sync</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Bi-directional real-time integration with SAP S/4HANA, Oracle, Dynamics 365, and Tally to verify inventory availability and apply negotiated trade terms.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Verified Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Key Retailer Benefits
                        </h4>
                        <div className="space-y-2">
                          {[
                            '3-minute reorders instead of waiting days for reps',
                            '24/7 ordering at midnight, weekends, and holidays',
                            'Sub-50ms SKU retrieval across 1,000+ products',
                            'Automated trade promotions and case discounts',
                            'Zero app installation barrier via WhatsApp & Web'
                          ].map((b, bIdx) => (
                            <div key={bIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            Connected Solutions
                          </h4>
                          <div className="p-3 bg-plum-50 rounded-xl border border-plum-200 space-y-2">
                            <div className="text-xs font-bold text-plum-950">
                              Looking for FMCG Brands Platform Overview?
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Explore enterprise distributor commerce, marketing automation, and ERP integrations.
                            </p>
                            <button
                              onClick={() => setFmcgModalTab('brands')}
                              className="text-xs font-black text-plum-800 hover:text-plum-950 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Switch to FMCG Brands Overview</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            Target Retail Channels
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {['Supermarkets & Hypermarkets', 'General Trade & Kirana Stores', 'Convenience Chains', 'HORECA & Institutional Buyers', 'Regional Wholesalers'].map((seg, sIdx) => (
                              <span key={sIdx} className="text-xs bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md border border-slate-200">
                                {seg}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Retailer Ordering Modal CTA */}
                    <div className="bg-gradient-to-r from-plum-950 via-plum-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-plum-800 shadow-xl text-center space-y-4">
                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        Experience AI-Powered FMCG Retailer Ordering
                      </h3>
                      <p className="text-xs sm:text-sm text-plum-200 max-w-xl mx-auto leading-relaxed">
                        Ready to empower your retailers with 24/7 conversational ordering on WhatsApp and Web?
                      </p>
                      <div className="pt-2 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={() => {
                            handleCloseIndustry();
                            if (onNavigateRetailerOrdering) onNavigateRetailerOrdering();
                            else if (onSelectIndustry) onSelectIndustry('fmcg-retailer-ordering-solution');
                          }}
                          className="px-6 py-3 bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Open Full Retailer Ordering Page</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            handleCloseIndustry();
                            if (onBookDemo) onBookDemo('FMCG Retailer Ordering Demo');
                          }}
                          className="px-6 py-3 bg-plum-800 hover:bg-plum-700 text-white font-extrabold text-xs sm:text-sm rounded-xl border border-plum-600 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Book Demo</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* FMCG BRANDS / GENERAL INDUSTRY VIEW */
                  <>
                    {/* Hero / Overview Banner */}
                    <div className="bg-plum-50/80 p-5 rounded-2xl border border-plum-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-xl">
                        <h3 className="text-base font-extrabold text-plum-950 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-plum-700" />
                          Strategic Overview for {activeModalIndustry.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {activeModalIndustry.description}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-plum-200 shadow-sm shrink-0 text-center min-w-[200px]">
                        <div className="text-[10px] font-extrabold uppercase text-plum-700">Verified Impact</div>
                        <div className="text-2xl font-black text-slate-900 mt-0.5">{activeModalIndustry.stat}</div>
                        <div className="text-xs font-bold text-slate-600">{activeModalIndustry.statLabel}</div>
                      </div>
                    </div>

                    {/* FMCG Connected Retailer Ordering Teaser Banner (if FMCG brands tab) */}
                    {activeModalIndustry.id === 'fmcg' && (
                      <div className="p-4 rounded-xl bg-peach-50 border border-peach-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-peach-300 text-plum-950 flex items-center justify-center font-black shrink-0">
                            <Store className="w-4 h-4 text-plum-950" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-plum-950">
                              Connected Sub-Solution: FMCG Retailer Ordering
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Explore conversational WhatsApp ordering, 3-minute bulk reorders &amp; zero-friction retailer adoption.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setFmcgModalTab('retailer-ordering')}
                          className="px-3 py-1.5 rounded-lg bg-plum-950 hover:bg-plum-900 text-peach-300 text-xs font-black flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        >
                          <span>Read Retailer Solution</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* 1. Industry Challenges Section (Top 5) */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-extrabold text-slate-900">
                          Top 5 Industry Challenges
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {activeModalIndustry.challenges.map((ch, idx) => (
                          <div
                            key={idx}
                            className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80 flex items-start gap-2.5"
                          >
                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              0{idx + 1}
                            </div>
                            <span className="text-xs font-bold text-slate-800 leading-snug">{ch}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. How SilarAI Helps Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Zap className="w-5 h-5 text-plum-700" />
                        <h3 className="text-lg font-extrabold text-slate-900">
                          How SilarAI Helps {activeModalIndustry.title}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeModalIndustry.customModules ? (
                          activeModalIndustry.customModules.map((mod, mIdx) => (
                            <div key={mIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                              <div className="flex items-center gap-2 text-plum-800 font-extrabold text-xs">
                                {mod.icon === 'Bot' ? (
                                  <Bot className="w-4 h-4 text-plum-700" />
                                ) : mod.icon === 'TrendingUp' ? (
                                  <TrendingUp className="w-4 h-4 text-plum-700" />
                                ) : mod.icon === 'Target' ? (
                                  <Target className="w-4 h-4 text-plum-700" />
                                ) : mod.icon === 'Sparkles' ? (
                                  <Sparkles className="w-4 h-4 text-plum-700" />
                                ) : (
                                  <Zap className="w-4 h-4 text-plum-700" />
                                )}
                                <span>{mod.title}</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {mod.desc}
                              </p>
                            </div>
                          ))
                        ) : (
                          <>
                            {/* Commerce Copilot */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                              <div className="flex items-center gap-2 text-plum-800 font-extrabold text-xs">
                                <Bot className="w-4 h-4 text-plum-700" />
                                <span>Commerce Copilot</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Deploys conversational AI assistants to engage shoppers 24/7, answer technical questions, and guide purchase decisions in real time.
                              </p>
                            </div>

                            {/* Revenue Intelligence */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                              <div className="flex items-center gap-2 text-plum-800 font-extrabold text-xs">
                                <TrendingUp className="w-4 h-4 text-plum-700" />
                                <span>Revenue Intelligence</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Tracks sales visibility, identifies high-value order opportunities, and optimizes pricing and conversion bottlenecks.
                              </p>
                            </div>

                            {/* Customer Intelligence */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                              <div className="flex items-center gap-2 text-plum-800 font-extrabold text-xs">
                                <Users className="w-4 h-4 text-plum-700" />
                                <span>Customer Intelligence</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Analyzes buyer behaviors, segment preferences, and retention patterns to deliver personalized customer experiences.
                              </p>
                            </div>

                            {/* Marketing Intelligence */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                              <div className="flex items-center gap-2 text-plum-800 font-extrabold text-xs">
                                <Target className="w-4 h-4 text-plum-700" />
                                <span>Marketing Intelligence</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Monitors campaign effectiveness, lowers acquisition costs, and turns engagement analytics into profitable marketing strategies.
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Bullet points summary */}
                      <div className="bg-plum-50/80 p-4 rounded-xl border border-plum-100">
                        <div className="text-xs font-extrabold text-plum-950 mb-2">Core Solutions Summary:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                          {activeModalIndustry.howSilarAiHelps.map((h, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-2 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-plum-700 shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 3. Benefits & Products Used Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Benefits */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-peach-600" />
                          Key Business Benefits
                        </h4>
                        <div className="space-y-2">
                          {activeModalIndustry.benefits.map((b, bIdx) => (
                            <div key={bIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5 text-xs font-bold text-slate-800">
                              <CheckCircle2 className="w-4 h-4 text-peach-500 shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Products Used & Ideal For */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            Products Used
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {activeModalIndustry.productsUsed.map((prod, pIdx) => (
                              <span
                                key={pIdx}
                                className="text-xs bg-plum-950 text-peach-300 font-extrabold px-3 py-1.5 rounded-lg border border-plum-800 shadow-2xs"
                              >
                                {prod}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            Ideal For
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {activeModalIndustry.idealFor.map((seg, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-xs bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-md border border-slate-200"
                              >
                                {seg}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. CTA Section */}
                    <div className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white p-6 sm:p-8 rounded-2xl border border-plum-800 shadow-xl text-center space-y-4">
                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        Ready to Transform Your {activeModalIndustry.title} Business with AI?
                      </h3>
                      <p className="text-xs sm:text-sm text-plum-200 max-w-xl mx-auto leading-relaxed">
                        See how SilarAI helps {activeModalIndustry.title} businesses build stronger customer relationships, increase revenue, and grow faster.
                      </p>
                      <div className="pt-2 flex flex-wrap justify-center gap-3">
                        {activeModalIndustry.id === 'fmcg' && (
                          <button
                            onClick={() => {
                              handleCloseIndustry();
                              if (onSelectIndustry) onSelectIndustry('fmcg');
                            }}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer"
                          >
                            <span>Open FMCG Brands Page</span>
                            <ArrowRight className="w-4 h-4 text-plum-950" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const title = activeModalIndustry.title;
                            handleCloseIndustry();
                            if (onBookDemo) {
                              onBookDemo(title);
                            } else {
                              alert(`Opening Live Demo Booking for ${title}...`);
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-plum-800 hover:bg-plum-700 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all shadow-lg hover:scale-105 cursor-pointer"
                        >
                          <span>Book a Demo</span>
                          <ArrowRight className="w-4 h-4 text-peach-300" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
