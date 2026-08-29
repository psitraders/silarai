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
} from 'lucide-react';
import { IndustrySolution } from '../types';

interface IndustriesSectionProps {
  onBookDemo?: (industryTitle?: string) => void;
  activeIndustryId?: string | null;
  onSelectIndustry?: (industryId: string | null) => void;
}

export const IndustriesSection: React.FC<IndustriesSectionProps> = ({
  onBookDemo,
  activeIndustryId,
  onSelectIndustry,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [internalModalIndustry, setInternalModalIndustry] = useState<IndustrySolution | null>(null);

  // Active industry resolves from prop or internal state
  const activeModalIndustry =
    (activeIndustryId ? INDUSTRIES.find((ind) => ind.id === activeIndustryId) : null) ||
    internalModalIndustry;

  const handleOpenIndustry = (ind: IndustrySolution) => {
    setInternalModalIndustry(ind);
    if (onSelectIndustry) {
      onSelectIndustry(ind.id);
    }
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
              </div>

              {/* Card Footer Button */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenIndustry(ind);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-plum-50 group-hover:bg-plum-700 text-plum-900 group-hover:text-white font-extrabold text-xs transition-all flex items-center justify-between border border-plum-200/80 group-hover:border-plum-700 shadow-2xs"
                >
                  <span>Open {ind.title} Solution Page</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-plum-700 group-hover:text-peach-300" />
                </button>
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
                    {getIndustryIcon(activeModalIndustry.icon, 'w-6 h-6 text-peach-300')}
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-peach-300 bg-plum-900/80 px-2.5 py-0.5 rounded-md border border-plum-800">
                      AI Commerce Intelligence for {activeModalIndustry.title}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                      {activeModalIndustry.headline}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={handleCloseIndustry}
                  className="p-2 text-plum-300 hover:text-white rounded-xl hover:bg-plum-900 transition-colors shrink-0"
                  aria-label="Close page"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable SEO Landing Page Content Body */}
              <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">

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
                  <div className="pt-2">
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
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:scale-105"
                    >
                      <span>Book a Demo</span>
                      <ArrowRight className="w-4 h-4 text-plum-950" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
