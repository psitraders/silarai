import React, { useState } from 'react';
import { PROBLEM_CARDS } from '../data/content';
import { Sparkles, BrainCircuit, MessageSquareText, ShoppingCart, ArrowRight, Check, X } from 'lucide-react';

export const ProblemsSection: React.FC = () => {
  const [activeCardId, setActiveCardId] = useState<string>('discovery');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-blue-600" />;
      case 'BrainCircuit':
        return <BrainCircuit className="w-6 h-6 text-blue-600" />;
      case 'MessageSquareText':
        return <MessageSquareText className="w-6 h-6 text-blue-600" />;
      case 'ShoppingCart':
        return <ShoppingCart className="w-6 h-6 text-blue-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full border border-peach-400">
            The Paradigm Shift
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Customers expect more. SilarAI delivers.
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Traditional commerce relies on search. Modern commerce guides every customer with AI.
          </p>
        </div>

        {/* Four Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROBLEM_CARDS.map((card) => {
            const isActive = activeCardId === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setActiveCardId(card.id)}
                className={`p-6 rounded-saas border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isActive
                    ? 'bg-white border-plum-700 shadow-sleek-hover ring-2 ring-plum-700/20'
                    : 'bg-white border-slate-200/90 hover:border-plum-300 shadow-sleek hover:shadow-md'
                }`}
              >
                <div>
                  {/* Card Icon Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-plum-50 flex items-center justify-center group-hover:bg-plum-700 group-hover:text-peach-300 transition-colors">
                      {getIcon(card.icon)}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-plum-700">
                      0{PROBLEM_CARDS.findIndex((c) => c.id === card.id) + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-plum-700 transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* SilarAI Advantage Preview */}
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    SilarAI Advantage
                  </div>
                  <div className="text-xs font-bold text-plum-950 bg-peach-200/80 p-2.5 rounded-xl border border-peach-300 flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-plum-800 shrink-0 mt-0.5 stroke-[3]" />
                    <span>{card.silarAiAdvantage}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Comparison Focus Spotlight */}
        <div className="mt-12 bg-plum-950 text-white p-6 sm:p-8 rounded-saas shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-peach-300/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="text-xs font-extrabold uppercase text-peach-300 tracking-wider">
                Live Contrast Analysis
              </div>
              <h4 className="text-xl font-extrabold text-white mt-1">
                Traditional Commerce vs. SilarAI Guidance
              </h4>
              <p className="text-xs sm:text-sm text-plum-200 mt-1 max-w-xl">
                See how replacing static catalog tables with an intelligent co-pilot impacts customer retention.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
              <div className="bg-plum-900/90 p-4 rounded-xl border border-plum-800 text-xs">
                <div className="font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                  <X className="w-4 h-4" /> Traditional Experience
                </div>
                <div className="text-plum-100">
                  {PROBLEM_CARDS.find((c) => c.id === activeCardId)?.beforeText}
                </div>
              </div>

              <div className="bg-plum-900 p-4 rounded-xl border border-peach-300/50 text-xs">
                <div className="font-bold text-peach-300 flex items-center gap-1.5 mb-1">
                  <Check className="w-4 h-4 stroke-[3]" /> SilarAI AI Experience
                </div>
                <div className="text-white font-semibold">
                  {PROBLEM_CARDS.find((c) => c.id === activeCardId)?.silarAiAdvantage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
