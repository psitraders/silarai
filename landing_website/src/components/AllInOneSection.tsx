import React from 'react';
import {
  Store,
  Bot,
  Package,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Globe,
  Lock,
  Smartphone,
  Share2,
  Database,
  UserCheck,
  Zap,
  Receipt,
  CreditCard,
} from 'lucide-react';

interface AllInOneSectionProps {
  onBookDemo?: (plan?: string) => void;
}

export const AllInOneSection: React.FC<AllInOneSectionProps> = ({ onBookDemo }) => {
  const tools = [
    {
      id: 'storefront',
      title: 'Beautiful Storefront',
      icon: Store,
      tagline: 'Your own branded store live in minutes. No developers, no hosting, no stress.',
      badge: 'Zero Code Setup',
      features: [
        { text: 'Your own domain (www.yourbrand.com)', icon: Globe },
        { text: 'Free SSL certificate included', icon: Lock },
        { text: 'Mobile-first design', icon: Smartphone },
        { text: 'Shareable store link', icon: Share2 },
      ],
      previewContent: {
        label: 'Live Store URL',
        value: 'https://www.yourbrand.com',
        highlight: '100% Whitelabeled',
      },
    },
    {
      id: 'chat',
      title: 'AI Customer Chat',
      icon: Bot,
      tagline: 'An AI assistant answers customer questions 24/7, recommends products, and collects orders.',
      badge: '24/7 Conversational AI',
      features: [
        { text: 'Knows your full catalogue', icon: Database },
        { text: 'Captures name, phone & address', icon: UserCheck },
        { text: 'Handles FAQs automatically', icon: Sparkles },
        { text: 'Works via WhatsApp & web', icon: Zap },
      ],
      previewContent: {
        label: 'AI Sales Assistant',
        value: 'WhatsApp & Storefront AI Bot',
        highlight: 'Sub-50ms Responses',
      },
    },
    {
      id: 'orders',
      title: 'Orders & Inventory',
      icon: Package,
      tagline: 'Every order in one place — track status, manage stock, and never miss a sale.',
      badge: 'Centralized Dispatch',
      features: [
        { text: 'Real-time order dashboard', icon: Zap },
        { text: 'Stock alerts & variants', icon: Package },
        { text: 'Invoice generation', icon: Receipt },
        { text: 'COD & online payments', icon: CreditCard },
      ],
      previewContent: {
        label: 'Fulfillment Matrix',
        value: 'Unified Order Hub',
        highlight: 'Real-Time Sync',
      },
    },
    {
      id: 'crm',
      title: 'CRM & Analytics',
      icon: BarChart3,
      tagline: 'Know your best customers, track revenue, and grow smarter every month.',
      badge: 'Growth Engine',
      features: [
        { text: 'Customer purchase history', icon: UserCheck },
        { text: 'Sales & revenue charts', icon: BarChart3 },
        { text: 'Top products report', icon: Sparkles },
        { text: 'Repeat buyer insights', icon: CheckCircle2 },
      ],
      previewContent: {
        label: 'Intelligence Suite',
        value: 'Customer Lifetime Value',
        highlight: '+42% Retention',
      },
    },
  ];

  return (
    <section
      id="all-in-one-tools"
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-plum-50/30 to-white border-t border-slate-200/80 relative overflow-hidden"
    >
      {/* Background Decorative Accents */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-plum-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-coral-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-100 border border-plum-200 text-plum-900 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-coral-600" />
            <span>Everything in one place</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            All the tools your business needs
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            No juggling 5 different apps. Silarai brings your store, chat, orders, and customers under one roof.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <div
                key={tool.id}
                className="group relative rounded-3xl bg-white border border-slate-200/90 hover:border-plum-300 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Badge & Header */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-plum-50 group-hover:bg-plum-100 border border-plum-200/60 flex items-center justify-center text-plum-800 transition-colors shadow-2xs">
                      <ToolIcon className="w-6 h-6 text-plum-900" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2.5 tracking-tight group-hover:text-plum-900 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-normal">
                    {tool.tagline}
                  </p>

                  {/* Feature Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 pt-2 border-t border-slate-100">
                    {tool.features.map((feat, idx) => {
                      const FeatIcon = feat.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                            <FeatIcon className="w-3 h-3 text-teal-600" />
                          </div>
                          <span className="text-xs sm:text-[13px] font-semibold text-slate-700">
                            {feat.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Micro-Preview Pill */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-2xl px-4 py-2.5 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-500">{tool.previewContent.label}:</span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {tool.previewContent.value}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-coral-600 bg-coral-50 px-2 py-0.5 rounded-md">
                    {tool.previewContent.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unified Ecosystem Assurance */}
        <div className="mt-12 p-6 rounded-2xl bg-plum-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-plum-950/20">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-peach-300/20 border border-peach-300/30 flex items-center justify-center text-peach-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Replace fragmented subscriptions with one intelligent platform
              </h4>
              <p className="text-xs sm:text-sm text-plum-200">
                Setup your store, configure your AI bot, and start taking orders within minutes.
              </p>
            </div>
          </div>

          <button
            onClick={() => onBookDemo?.('All In One Platform')}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coral-400 hover:bg-coral-500 text-plum-950 font-bold text-sm transition-all shadow-md cursor-pointer hover:shadow-coral-500/30"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
