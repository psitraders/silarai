import React, { useState } from 'react';
import { COMPARISON_ROWS } from '../data/content';
import {
  Sparkles,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Zap,
  ShieldCheck,
  Target,
  MessageSquare,
  TrendingUp,
  Share2,
  Users,
  Search,
  Filter,
  BarChart3,
  Bot,
  Megaphone
} from 'lucide-react';

interface WhyChoosePageProps {
  onBackToHome: () => void;
  onBookDemo: (plan?: string) => void;
}

export const WhyChoosePage: React.FC<WhyChoosePageProps> = ({ onBackToHome, onBookDemo }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = COMPARISON_ROWS.filter((row) => {
    const q = searchTerm.toLowerCase();
    return (
      row.feature.toLowerCase().includes(q) ||
      row.traditional.toLowerCase().includes(q) ||
      row.silarAi.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pt-24 pb-20">
      {/* Top Breadcrumb & Hero Header */}
      <div className="bg-plum-950 text-white relative overflow-hidden border-b border-plum-800 py-16 lg:py-20">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-plum-800/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back Navigation Button */}
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-teal-300 text-xs font-bold transition-all mb-8 border border-white/10 hover:border-white/20 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 font-extrabold text-xs tracking-wider uppercase border border-peach-300/30">
              <Sparkles className="w-3.5 h-3.5" />
              Platform Comparison
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Why Choose <span className="text-peach-300">SilarAI</span>
            </h1>

            <p className="text-xl sm:text-2xl font-semibold text-teal-200">
              Traditional Commerce vs. SilarAI
            </p>

            <p className="text-lg sm:text-xl font-bold text-peach-300">
              One Platform Instead of Multiple Marketing &amp; Commerce Tools
            </p>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal pt-2">
              Most ecommerce businesses rely on separate applications to manage their online store, social media marketing, customer conversations, AI content, and campaigns.
              <br className="hidden sm:block" />
              SilarAI brings everything together into one AI-powered Commerce &amp; Marketing Platform.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Capability Spotlight Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-plum-50 text-plum-700 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Meta Marketing Hub</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Launch, monitor, and optimize Facebook, Instagram, and WhatsApp campaigns directly inside a single unified commerce workspace.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-plum-50 text-plum-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Native WhatsApp Commerce</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automate product recommendations, 24/7 conversational shopping, order status notifications, and abandoned cart recovery on WhatsApp.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-plum-50 text-plum-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Centralized Lead CRM</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consolidate leads from website forms, Meta Lead Ads, and social messaging directly into an intelligent CRM with zero data loss.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-plum-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-plum-50 text-plum-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Unified ROI Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stop stitching together disconnected reporting tools. Gain end-to-end visibility from initial ad impression to final sale.
            </p>
          </div>
        </section>

        {/* Comparison Matrix Table Card */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Full Capabilities Matrix
              </h2>
              <p className="text-sm text-slate-600">
                Direct feature comparison between Traditional Commerce setups and SilarAI.
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter capabilities..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-700 font-medium"
              />
            </div>
          </div>

          <div className="bg-white rounded-saas border border-slate-200 shadow-sleek overflow-hidden">
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
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/50'}
                    >
                      <td className="p-4 sm:p-5 font-extrabold text-slate-900 border-r border-slate-200">
                        {row.feature}
                      </td>

                      <td className="p-4 sm:p-5 text-slate-600 border-r border-slate-200 bg-slate-50/30">
                        <div className="flex items-start gap-2.5">
                          <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-600">{row.traditional}</span>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 font-semibold text-slate-900 bg-peach-100/40">
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-plum-700 text-peach-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-plum-950 font-extrabold leading-snug">{row.silarAi}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500 text-sm font-medium">
                        No capabilities matched "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cross Platform Comparison Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 py-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compare Specific Platforms:</span>
          <a
            href="/shopify-vs-silarai"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/shopify-vs-silarai');
              window.dispatchEvent(new Event('popstate'));
            }}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-plum-950 hover:border-plum-700 shadow-2xs transition-all flex items-center gap-1.5"
          >
            <span>Shopify vs. SilarAi</span>
            <ArrowRight className="w-3.5 h-3.5 text-plum-700" />
          </a>

          <a
            href="/woocommerce-vs-silarai"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/woocommerce-vs-silarai');
              window.dispatchEvent(new Event('popstate'));
            }}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-plum-950 hover:border-plum-700 shadow-2xs transition-all flex items-center gap-1.5"
          >
            <span>WooCommerce vs. SilarAi</span>
            <ArrowRight className="w-3.5 h-3.5 text-plum-700" />
          </a>
        </div>

        {/* Business Impact Metrics */}
        <section className="bg-plum-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-800 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-plum-900 px-3 py-1 rounded-full border border-plum-700">
              Proven Performance
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Measurable ROI Across Every Channel
            </h3>
            <p className="text-xs sm:text-sm text-plum-200">
              Replacing legacy point solutions with SilarAI drives immediate efficiency gains and top-line revenue growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-plum-900/80 p-6 rounded-2xl border border-plum-800 text-center space-y-2">
              <div className="text-3xl font-black text-peach-300">10x ROI</div>
              <div className="text-xs font-extrabold text-white">Meta Campaign ROI</div>
              <p className="text-[11px] text-plum-300">Targeted AI audience segmenting and automated ad publishing</p>
            </div>

            <div className="bg-plum-900/80 p-6 rounded-2xl border border-plum-800 text-center space-y-2">
              <div className="text-3xl font-black text-peach-300">85%</div>
              <div className="text-xs font-extrabold text-white">Cart Recovery Rate</div>
              <p className="text-[11px] text-plum-300">Automated WhatsApp recovery triggers with instant coupon codes</p>
            </div>

            <div className="bg-plum-900/80 p-6 rounded-2xl border border-plum-800 text-center space-y-2">
              <div className="text-3xl font-black text-peach-300">100%</div>
              <div className="text-xs font-extrabold text-white">Unified CRM Ingest</div>
              <p className="text-[11px] text-plum-300">Zero lead leakage across forms, Facebook Ads, and Instagram DMs</p>
            </div>

            <div className="bg-plum-900/80 p-6 rounded-2xl border border-plum-800 text-center space-y-2">
              <div className="text-3xl font-black text-peach-300">24/7</div>
              <div className="text-xs font-extrabold text-white">Automated Customer Care</div>
              <p className="text-[11px] text-plum-300">Instant AI response to product queries and order tracking</p>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white p-8 sm:p-12 rounded-3xl border border-plum-800 shadow-xl text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade to SilarAI?
            </h2>
            <p className="text-xs sm:text-sm text-plum-200 leading-relaxed">
              Experience the power of a unified AI commerce platform and Meta Marketing Hub built to scale your business.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onBookDemo()}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4 text-plum-950" />
            </button>

            <button
              onClick={() => onBookDemo('Enterprise')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-plum-800 hover:bg-plum-700 text-white font-extrabold text-sm rounded-xl border border-plum-600 transition-all cursor-pointer"
            >
              <span>Talk to Sales</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
