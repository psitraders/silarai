import React, { useState } from 'react';
import { USE_CASES } from '../data/content';
import { UseCaseItem } from '../types';
import {
  Bot,
  UserPlus,
  TrendingUp,
  Heart,
  Compass,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  X,
  AlertTriangle,
  Zap,
  Sparkles,
  Search,
  Globe,
  ShieldCheck,
  Users,
  Target,
} from 'lucide-react';

interface UseCasesSectionProps {
  onBookDemo: (useCaseTitle?: string) => void;
  activeSlug?: string | null;
  onSelectUseCase?: (slug: string | null) => void;
}

export const UseCasesSection: React.FC<UseCasesSectionProps> = ({
  onBookDemo,
  activeSlug: externalActiveSlug,
  onSelectUseCase,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [internalModalUseCase, setInternalModalUseCase] = useState<UseCaseItem | null>(null);

  // Active use case resolves from prop or internal state (matching IndustriesSection)
  const activeModalUseCase =
    (externalActiveSlug ? USE_CASES.find((uc) => uc.slug === externalActiveSlug || uc.id === externalActiveSlug) : null) ||
    internalModalUseCase;

  const handleOpenUseCase = (uc: UseCaseItem) => {
    setInternalModalUseCase(uc);
    if (onSelectUseCase) {
      onSelectUseCase(uc.slug);
    }
  };

  const handleCloseUseCase = () => {
    setInternalModalUseCase(null);
    if (onSelectUseCase) {
      onSelectUseCase(null);
    }
  };

  const getUseCaseIcon = (iconName: string, className = 'w-6 h-6 text-plum-700') => {
    switch (iconName) {
      case 'Bot':
        return <Bot className={className} />;
      case 'UserPlus':
        return <UserPlus className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      default:
        return <Bot className={className} />;
    }
  };

  const filteredUseCases =
    selectedFilter === 'all'
      ? USE_CASES
      : USE_CASES.filter((uc) => uc.slug === selectedFilter || uc.id === selectedFilter);

  return (
    <section id="use-cases" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full border border-peach-400 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-plum-900" />
            AI Commerce Use Cases
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            High-Impact Use Cases Powered by SilarAI
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            From automated sales assistance to B2B ordering and conversion optimization, explore how SilarAI transforms commerce outcomes.
          </p>

          {/* Quick Use Case Filter Tabs */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-plum-950 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Use Cases ({USE_CASES.length})
            </button>
            {USE_CASES.map((uc) => (
              <button
                key={uc.id}
                onClick={() => setSelectedFilter(uc.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedFilter === uc.slug
                    ? 'bg-plum-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {getUseCaseIcon(uc.iconName, 'w-3.5 h-3.5')}
                <span>{uc.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Use Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUseCases.map((uc) => (
            <div
              key={uc.id}
              onClick={() => handleOpenUseCase(uc)}
              className="bg-white rounded-saas p-6 border border-slate-200 shadow-sleek hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group hover:border-plum-400 cursor-pointer relative"
            >
              <div className="space-y-4">
                {/* Header Icon + Metric / URL Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-plum-50 flex items-center justify-center group-hover:bg-plum-700 group-hover:text-peach-300 transition-colors border border-plum-100">
                    {getUseCaseIcon(uc.iconName, 'w-6 h-6 text-plum-700 group-hover:text-peach-300 transition-colors')}
                  </div>
                  {uc.keyMetrics && uc.keyMetrics[0] ? (
                    <span className="text-xs font-extrabold text-plum-950 bg-peach-200 px-3 py-1 rounded-full border border-peach-300">
                      {uc.keyMetrics[0].value} {uc.keyMetrics[0].label}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-plum-950 bg-peach-100 px-2.5 py-1 rounded-md border border-peach-300">
                      {uc.url}
                    </span>
                  )}
                </div>

                {/* Title & Headline */}
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-plum-800 transition-colors flex items-center justify-between">
                    <span>{uc.title}</span>
                    <span className="text-xs font-bold text-plum-600 group-hover:text-plum-800 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Page <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </h3>
                  <p className="text-xs font-bold text-plum-700 mt-0.5">
                    {uc.header}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 font-medium">
                  {uc.overview}
                </p>

                {/* Challenges Highlight */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Top Challenges Solved</span>
                  </div>
                  <ul className="text-xs text-amber-950 space-y-1 pl-1">
                    {uc.challenges.slice(0, 3).map((ch, cIdx) => (
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
                    {uc.howSilarAiHelps.slice(0, 3).map((h, hIdx) => (
                      <span key={hIdx} className="text-[10px] bg-white text-plum-900 px-2 py-0.5 rounded-md border border-plum-200 font-bold">
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Products Used & SEO Tags */}
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Products Used</div>
                  <div className="flex flex-wrap gap-1">
                    {uc.products.map((p, pIdx) => (
                      <span key={pIdx} className="text-[10px] bg-plum-950 text-peach-300 font-extrabold px-2 py-0.5 rounded-md">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenUseCase(uc);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-plum-50 group-hover:bg-plum-700 text-plum-900 group-hover:text-white font-extrabold text-xs transition-all flex items-center justify-between border border-plum-200/80 group-hover:border-plum-700 shadow-2xs cursor-pointer"
                >
                  <span>Open {uc.title} Solution Page</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-plum-700 group-hover:text-peach-300" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ________________________________________ */}
        {/* Full Interactive SEO Landing Page Modal / Drawer (Identical to Industry Modal) */}
        {activeModalUseCase && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-saas max-w-4xl w-full border border-slate-200 shadow-2xl relative my-auto overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Sticky Top Header */}
              <div className="bg-plum-950 text-white p-5 sm:p-6 flex items-start justify-between border-b border-plum-900 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-plum-700 text-peach-300 flex items-center justify-center shadow-md border border-plum-600 shrink-0">
                    {getUseCaseIcon(activeModalUseCase.iconName, 'w-6 h-6 text-peach-300')}
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-peach-300 bg-plum-900/80 px-2.5 py-0.5 rounded-md border border-plum-800">
                      AI Commerce Use Case: {activeModalUseCase.title}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                      {activeModalUseCase.header}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={handleCloseUseCase}
                  className="p-2 text-plum-300 hover:text-white rounded-xl hover:bg-plum-900 transition-colors shrink-0 cursor-pointer"
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
                      Strategic Overview for {activeModalUseCase.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                      {activeModalUseCase.overview}
                    </p>
                  </div>

                  {activeModalUseCase.keyMetrics && activeModalUseCase.keyMetrics[0] && (
                    <div className="bg-white p-4 rounded-xl border border-plum-200 shadow-sm shrink-0 text-center min-w-[200px]">
                      <div className="text-[10px] font-extrabold uppercase text-plum-700">Verified Impact</div>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">{activeModalUseCase.keyMetrics[0].value}</div>
                      <div className="text-xs font-bold text-slate-600">{activeModalUseCase.keyMetrics[0].label}</div>
                    </div>
                  )}
                </div>

                {/* 1. Top Business Challenges Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Top Business Challenges Solved
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {activeModalUseCase.challenges.map((ch, idx) => (
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
                      How SilarAI Powers {activeModalUseCase.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Bullet points summary */}
                  <div className="bg-plum-50/80 p-4 rounded-xl border border-plum-100">
                    <div className="text-xs font-extrabold text-plum-950 mb-2">Core Solutions Summary:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {activeModalUseCase.howSilarAiHelps.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-plum-700 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Outcomes & Products Used Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Outcomes */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-peach-600" />
                      Key Business Outcomes
                    </h4>
                    <div className="space-y-2">
                      {activeModalUseCase.businessOutcomes.map((b, bIdx) => (
                        <div key={bIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5 text-xs font-bold text-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-peach-500 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Products Used */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                        Products Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeModalUseCase.products.map((prod, pIdx) => (
                          <span
                            key={pIdx}
                            className="text-xs bg-plum-950 text-peach-300 font-extrabold px-3 py-1.5 rounded-lg border border-plum-800 shadow-2xs"
                          >
                            {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Executive Summary */}
                {activeModalUseCase.geoSummary && (
                  <div className="bg-plum-950 text-white p-5 rounded-2xl border border-plum-800 space-y-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-peach-300 bg-plum-900 px-2.5 py-1 rounded-md inline-flex items-center gap-1 border border-plum-700">
                      <Globe className="w-3.5 h-3.5 text-peach-300" />
                      <span>Executive Summary</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{activeModalUseCase.geoSummary}"
                    </p>
                  </div>
                )}

                {/* 5. Frequently Asked Questions */}
                {activeModalUseCase.faqItems && activeModalUseCase.faqItems.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-plum-700" />
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-3">
                      {activeModalUseCase.faqItems.map((faq, fIdx) => (
                        <div key={fIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                          <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-start gap-2">
                            <span className="text-plum-700 font-black">Q:</span>
                            <span>{faq.question}</span>
                          </h5>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed pl-5">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. CTA Section */}
                <div className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white p-6 sm:p-8 rounded-2xl border border-plum-800 shadow-xl text-center space-y-4">
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Ready to Deploy SilarAI {activeModalUseCase.title}?
                  </h3>
                  <p className="text-xs sm:text-sm text-plum-200 max-w-xl mx-auto leading-relaxed">
                    See how SilarAI powers enterprise commerce workflows, increases sales conversions, and optimizes customer experiences in real time.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        const title = activeModalUseCase.title;
                        handleCloseUseCase();
                        if (onBookDemo) {
                          onBookDemo(title);
                        } else {
                          alert(`Opening Live Demo Booking for ${title}...`);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer"
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
