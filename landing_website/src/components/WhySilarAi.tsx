import React from 'react';
import { COMPARISON_ROWS } from '../data/content';
import { Check, X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WhySilarAiProps {
  onOpenFullPage?: () => void;
}

export const WhySilarAi: React.FC<WhySilarAiProps> = ({ onOpenFullPage }) => {
  const whyChooseReasons = [
    'One login for commerce and marketing',
    'AI-generated content for products and campaigns',
    'Integrated Meta marketing and publishing',
    'AI Shopping Assistant built into your store',
    'Unified customer conversations across every channel',
    'Faster campaign launches with AI automation',
    'Lower software costs by replacing multiple tools',
    'Better customer experiences from discovery to purchase',
  ];

  return (
    <section id="why-choose-us" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full border border-peach-400">
            Why Choose SilarAI
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Traditional Commerce vs. SilarAI
          </h2>
          <h3 className="text-xl sm:text-2xl font-bold text-plum-900 pt-1">
            One Platform Instead of Multiple Marketing &amp; Commerce Tools
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Most ecommerce businesses rely on separate applications to manage their online store, social media marketing, customer conversations, AI content, and campaigns.
          </p>
          <p className="text-sm sm:text-base font-semibold text-plum-950 pt-1">
            SilarAI brings everything together into one AI-powered Commerce &amp; Marketing Platform.
          </p>
        </div>

        {/* Comparison Table Card */}
        <div className="bg-white rounded-saas border border-slate-200 shadow-sleek overflow-hidden max-w-5xl mx-auto">
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
                      <span>SilarAI AI Commerce &amp; Marketing Platform</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  >
                    <td className="p-4 sm:p-5 font-bold text-slate-900 border-r border-slate-200">
                      {row.feature}
                    </td>

                    <td className="p-4 sm:p-5 text-slate-500 border-r border-slate-200 bg-slate-50/30">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>

                    <td className="p-4 sm:p-5 font-semibold text-slate-900 bg-peach-100/50">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-plum-700 text-peach-300 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-plum-950 font-extrabold">{row.silarAi}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why Businesses Choose SilarAI Section */}
        <div className="max-w-4xl mx-auto mt-16 p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Businesses Choose SilarAI
            </h3>
            <p className="text-sm text-slate-600">
              Streamline operations, save time, and boost revenue with our unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {whyChooseReasons.map((reason, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
              >
                <CheckCircle2 className="w-5 h-5 text-plum-700 shrink-0" />
                <span className="text-sm font-bold text-slate-800">{reason}</span>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t border-slate-200/80">
            <p className="text-lg sm:text-xl font-black text-plum-950 tracking-wide">
              Sell. Market. Grow. Powered by AI.
            </p>
          </div>
        </div>

        {onOpenFullPage && (
          <div className="mt-8 text-center">
            <button
              onClick={onOpenFullPage}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-plum-950 hover:bg-plum-900 text-peach-300 font-extrabold text-xs tracking-wide transition-all shadow-md hover:scale-105 cursor-pointer border border-plum-800"
            >
              <span>Explore Why Choose SilarAI Full Page</span>
              <ArrowRight className="w-4 h-4 text-peach-300" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
