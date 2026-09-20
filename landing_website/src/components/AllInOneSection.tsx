import React, { useState } from 'react';
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
  Copy,
  Check,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface AllInOneSectionProps {
  onBookDemo?: (plan?: string) => void;
}

export const AllInOneSection: React.FC<AllInOneSectionProps> = ({ onBookDemo }) => {
  const [activeTab, setActiveTab] = useState<'storefront' | 'chat' | 'orders' | 'crm'>('storefront');
  const [domainInput, setDomainInput] = useState('yourbrand');
  const [copiedDns, setCopiedDns] = useState(false);

  const cleanDomain = domainInput.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'yourbrand';

  const copyDnsRecord = () => {
    navigator.clipboard.writeText('shops.silarai.com');
    setCopiedDns(true);
    setTimeout(() => setCopiedDns(false), 2000);
  };

  const tools = [
    {
      id: 'storefront' as const,
      title: 'Storefront & Custom Domain',
      shortTitle: 'Storefront & Domain',
      icon: Store,
      tagline: 'Your own branded storefront live in minutes with your custom domain & free SSL. Zero developers required.',
      badge: 'Zero Code & 100% Whitelabel',
      features: [
        { text: 'Connect any domain you own (GoDaddy, Namecheap, Cloudflare)', icon: Globe },
        { text: 'Free automatic SSL certificate & green padlock', icon: Lock },
        { text: 'Ultra-fast mobile-first responsive design', icon: Smartphone },
        { text: 'WhatsApp & Instagram social share cards', icon: Share2 },
      ],
      previewContent: {
        label: 'Live Domain',
        value: `https://www.${cleanDomain}.com`,
        highlight: '100% Whitelabeled',
      },
    },
    {
      id: 'chat' as const,
      title: 'AI Customer Chat & WhatsApp',
      shortTitle: 'AI Chat & WhatsApp',
      icon: Bot,
      tagline: 'An AI sales copilot that answers customer questions 24/7, recommends products, and recovers abandoned carts.',
      badge: '24/7 Conversational AI',
      features: [
        { text: 'Learns your entire product catalog in seconds', icon: Database },
        { text: 'Captures customer name, phone & delivery address', icon: UserCheck },
        { text: 'Sub-50ms instant responses to FAQs & sizing queries', icon: Sparkles },
        { text: 'Native 1-click WhatsApp Business checkout', icon: Zap },
      ],
      previewContent: {
        label: 'Conversational Copilot',
        value: 'WhatsApp & Web AI Agent',
        highlight: 'Sub-50ms Responses',
      },
    },
    {
      id: 'orders' as const,
      title: 'Orders & Real-Time Inventory',
      shortTitle: 'Orders & Stock Hub',
      icon: Package,
      tagline: 'Manage wholesale quotes, manual inquiries, and online purchases from one central live fulfillment dashboard.',
      badge: 'Unified Order Hub',
      features: [
        { text: 'Live multi-channel order notifications', icon: Zap },
        { text: 'Variant stock tracking (sizes, colors, SKUs)', icon: Package },
        { text: 'Automated GST/tax invoice & packing slips', icon: Receipt },
        { text: 'Razorpay, Stripe, PayPal, UPI & COD support', icon: CreditCard },
      ],
      previewContent: {
        label: 'Fulfillment Engine',
        value: 'Multi-Channel Stock Hub',
        highlight: 'Real-Time Sync',
      },
    },
    {
      id: 'crm' as const,
      title: 'Customer CRM & Growth Analytics',
      shortTitle: 'CRM & Analytics',
      icon: BarChart3,
      tagline: 'Know your highest-value customers, identify repeat purchase patterns, and expand store margins effortlessly.',
      badge: 'Revenue Engine',
      features: [
        { text: 'Full customer profile & lifetime purchase history', icon: UserCheck },
        { text: 'Revenue, margin, and order volume trend charts', icon: BarChart3 },
        { text: 'AI product recommendations for repeat buyers', icon: Sparkles },
        { text: 'Automated WhatsApp reorder reminders', icon: CheckCircle2 },
      ],
      previewContent: {
        label: 'Intelligence Hub',
        value: 'Customer Lifetime Value',
        highlight: '+42% Retention',
      },
    },
  ];

  const currentTool = tools.find((t) => t.id === activeTab) || tools[0];
  const CurrentIcon = currentTool.icon;

  return (
    <section
      id="all-in-one-tools"
      className="py-14 sm:py-18 bg-gradient-to-b from-white via-plum-50/20 to-white border-t border-slate-200/80 relative overflow-hidden"
    >
      {/* Background Decorative Accents */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-plum-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-peach-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Everything In One Place</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            All the tools your business needs
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            No juggling 5 disconnected apps. SilarAI unifies your branded storefront, custom domain, 24/7 AI chat, orders, and CRM in a single dashboard.
          </p>
        </div>

        {/* Interactive Feature Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          <div className="inline-flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-inner">
            {tools.map((tool) => {
              const isActive = activeTab === tool.id;
              const TabIcon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  id={`tab-tool-${tool.id}`}
                  onClick={() => setActiveTab(tool.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-plum-700 text-white shadow-md shadow-plum-900/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-peach-300' : 'text-slate-500'}`} />
                  <span>{tool.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tool Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 lg:p-10 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Details & Checklist */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-plum-50 border border-plum-200/80 flex items-center justify-center text-plum-700 shadow-sm">
                  <CurrentIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {currentTool.badge}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {currentTool.title}
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  {currentTool.tagline}
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                {currentTool.features.map((feat, idx) => {
                  const FeatIcon = feat.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <FeatIcon className="w-3.5 h-3.5 text-teal-700" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {feat.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onBookDemo?.(currentTool.title)}
                  className="px-5 py-2.5 rounded-xl bg-peach-500 hover:bg-peach-600 text-white font-bold text-sm transition-all shadow-md shadow-peach-500/20 flex items-center gap-2"
                >
                  <span>Explore {currentTool.shortTitle}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Console / Live Preview */}
            <div className="lg:col-span-6">
              {activeTab === 'storefront' ? (
                /* Interactive Custom Domain Sandbox */
                <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-mono font-bold text-slate-300">Custom Domain &amp; SSL Engine</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SSL Active
                    </span>
                  </div>

                  <div>
                    <label htmlFor="input-domain-tester" className="text-xs font-semibold text-slate-400 mb-1.5 block">
                      Test your custom domain name:
                    </label>
                    <div className="flex items-center rounded-xl bg-slate-950 border border-slate-700 overflow-hidden focus-within:border-teal-400">
                      <span className="px-3 text-xs text-slate-500 font-mono">https://www.</span>
                      <input
                        id="input-domain-tester"
                        type="text"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        placeholder="yourbrand"
                        className="bg-transparent text-sm text-peach-300 font-bold focus:outline-none w-full py-2.5 font-mono"
                      />
                      <span className="px-3 text-xs text-slate-400 font-mono">.com</span>
                    </div>
                  </div>

                  {/* DNS Record Helper */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>CNAME Target (Point your DNS):</span>
                      <button
                        type="button"
                        onClick={copyDnsRecord}
                        className="text-peach-300 hover:text-peach-200 font-bold inline-flex items-center gap-1"
                      >
                        {copiedDns ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedDns ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-teal-300 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between">
                      <span>shops.silarai.com</span>
                      <span className="text-[10px] text-slate-500">TTL: 3600</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                      <div className="text-slate-400 text-[11px]">Browser Security</div>
                      <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        256-Bit SSL Included
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                      <div className="text-slate-400 text-[11px]">Brand Equity</div>
                      <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                        100% Whitelabeled
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Console for Chat, Orders, CRM */
                <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono text-slate-400 ml-2">silarai://{currentTool.id}</span>
                    </div>
                    <span className="text-[11px] font-bold text-peach-300 bg-peach-950/60 px-2.5 py-0.5 rounded-full border border-peach-800">
                      {currentTool.previewContent.highlight}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs text-slate-400">{currentTool.previewContent.label}</div>
                    <div className="text-lg font-bold font-mono text-teal-300">
                      {currentTool.previewContent.value}
                    </div>
                    <div className="text-xs text-slate-500">
                      Status: Active &bull; Automated synchronization running across all channels
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Response Speed</span>
                      <span className="text-sm font-bold text-white font-mono">&lt; 50ms</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Availability</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">99.99% SLA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Mini Cards Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-8">
          {tools.map((t) => {
            const isSel = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSel
                    ? 'bg-plum-50 border-plum-700 shadow-sm ring-1 ring-plum-700/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isSel ? 'bg-plum-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 truncate">{t.shortTitle}</div>
                  <div className="text-[11px] text-slate-500 truncate">{t.badge}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
