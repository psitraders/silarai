import React from 'react';
import { ArrowRight, Bot, Sparkles, ShieldCheck, PhoneCall } from 'lucide-react';

interface FinalCtaProps {
  onBookDemo: () => void;
  onTalkToSales: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onBookDemo, onTalkToSales }) => {
  return (
    <section className="py-20 md:py-28 bg-plum-950 text-white relative overflow-hidden border-t border-plum-900">
      {/* Background Subtle Grid & Radial Glow */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-300 text-plum-950 border border-peach-400 text-xs font-extrabold shadow-sm">
          <Bot className="w-4 h-4 text-plum-900" />
          <span>Scale Your Commerce Growth Today</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Ready to Build <span className="text-teal-300">Smarter Commerce?</span>
        </h2>

        <p className="text-base sm:text-xl text-plum-200 max-w-2xl mx-auto font-normal leading-relaxed">
          Deliver AI-powered shopping experiences that delight customers and increase sales.
        </p>

        {/* Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onBookDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-extrabold text-plum-950 bg-peach-300 hover:bg-peach-200 rounded-2xl shadow-xl transition-all transform active:scale-98"
          >
            <span>Book Demo</span>
            <ArrowRight className="w-5 h-5 text-plum-900" />
          </button>

          <button
            onClick={onTalkToSales}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-extrabold text-white bg-plum-800 hover:bg-plum-700 border border-teal-400/50 rounded-2xl transition-all shadow-md"
          >
            <PhoneCall className="w-4 h-4 text-teal-300" />
            <span>Talk to Sales</span>
          </button>
        </div>

        {/* Footer Guarantees */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-plum-200 font-bold border-t border-plum-900 max-w-xl mx-auto">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-300" /> SOC2 Type II Certified
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-coral-400" /> 14-Day Free Evaluation
          </span>
        </div>
      </div>
    </section>
  );
};
