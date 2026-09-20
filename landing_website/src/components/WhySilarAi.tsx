import React, { useState } from 'react';
import { COMPARISON_ROWS, PROBLEM_CARDS } from '../data/content';
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TableProperties,
  AlertCircle,
  BrainCircuit,
  MessageSquareText,
  ShoppingCart
} from 'lucide-react';

interface WhySilarAiProps {
  onOpenFullPage?: () => void;
}

export const WhySilarAi: React.FC<WhySilarAiProps> = ({ onOpenFullPage }) => {
  const [viewMode, setViewMode] = useState<'table' | 'pain-points'>('table');
  const [activeProblemId, setActiveProblemId] = useState<string>('discovery');

  const whyChooseReasons = [
    'One unified login for commerce, AI chat, and marketing',
    'AI-generated content for products, descriptions & social posts',
    'Integrated Meta marketing and instant WhatsApp checkout',
    'AI Shopping Assistant built directly into your store',
    'Unified customer conversations across every channel',
    'Faster campaign launches with automated retargeting',
    'Lower software costs by replacing 5+ separate monthly subscriptions',
    'Better customer experiences from discovery to 1-click purchase',
  ];

  const getProblemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'BrainCircuit':
        return <BrainCircuit className="w-5 h-5" />;
      case 'MessageSquareText':
        return <MessageSquareText className="w-5 h-5" />;
      case 'ShoppingCart':
        return <ShoppingCart className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <section id="why-choose-us" className="py-14 sm:py-18 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>The SilarAI Advantage</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Traditional Commerce vs. SilarAI
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Why pay for 5 disconnected SaaS subscriptions when SilarAI unites modern commerce and autonomous AI in one platform?
          </p>

          {/* View Mode Switcher */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
              <button
                type="button"
                id="btn-advantage-table"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-plum-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableProperties className="w-4 h-4" />
                <span>Feature Comparison Matrix</span>
              </button>

              <button
                type="button"
                id="btn-advantage-problems"
                onClick={() => setViewMode('pain-points')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  viewMode === 'pain-points'
                    ? 'bg-plum-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Pain Points Solved (4 Shifts)</span>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          /* View 1: Comparison Matrix Table */
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden max-w-5xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-plum-950 text-white">
                      <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-plum-200 w-1/4">
                        Capability
                      </th>
                      <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-300 w-3/8 bg-plum-900/80">
                        Traditional Commerce Stack
                      </th>
                      <th className="p-4 sm:p-5 text-xs font-extrabold uppercase tracking-wider text-peach-300 w-3/8 bg-plum-900">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-peach-300" />
                          <span>SilarAI Platform</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {COMPARISON_ROWS.map((row, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/30 hover:bg-slate-50/80'}
                      >
                        <td className="p-4 font-bold text-slate-900 align-top">
                          {row.feature}
                        </td>
                        <td className="p-4 text-slate-600 align-top">
                          <div className="flex items-start gap-2">
                            <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>{row.traditional}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-900 font-semibold bg-plum-50/40 align-top">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-teal-600 font-bold shrink-0 mt-0.5" />
                            <span className="text-plum-950">{row.silarAi}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Benefits Bullet List */}
            <div className="max-w-5xl mx-auto bg-plum-50/40 p-6 rounded-2xl border border-plum-100/80">
              <div className="text-xs font-bold uppercase tracking-wider text-plum-900 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Why Brands Replace Their Stacks with SilarAI</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-semibold text-slate-700">
                {whyChooseReasons.slice(0, 8).map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold mt-0.5">&bull;</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* View 2: 4 Core Pain Points Solved */
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PROBLEM_CARDS.map((card, idx) => {
                const isActive = activeProblemId === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveProblemId(card.id)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isActive
                        ? 'bg-white border-plum-700 shadow-lg ring-2 ring-plum-700/20 -translate-y-0.5'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-plum-700 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {getProblemIcon(card.icon)}
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          0{idx + 1}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1.5">
                        {card.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {card.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-teal-700 bg-teal-50 p-2 rounded-lg border border-teal-200">
                        {card.silarAiAdvantage}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {onOpenFullPage && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={onOpenFullPage}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-plum-700 hover:text-plum-900 hover:underline"
            >
              <span>View Comprehensive Comparison Deep Dive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
