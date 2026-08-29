import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Search,
  Bot,
  Layers,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Cpu
} from 'lucide-react';

interface WoocommerceComparisonPageProps {
  onBackToHome: () => void;
  onBookDemo: (plan?: string) => void;
}

export interface WooComparisonItem {
  capability: string;
  woocommerce: string;
  silarAi: string;
  category?: string;
}

export const WOOCOMMERCE_COMPARISON_DATA: WooComparisonItem[] = [
  {
    capability: 'Ecommerce Platform',
    woocommerce: 'WordPress-based ecommerce plugin',
    silarAi: 'Complete AI-powered ecommerce platform',
  },
  {
    capability: 'Website & Store Management',
    woocommerce: 'Built on WordPress',
    silarAi: 'Built-in website, CMS, blog, and ecommerce platform',
  },
  {
    capability: 'AI Shopping Assistant',
    woocommerce: 'Available through plugins or custom integrations',
    silarAi: 'Built-in AI Shopping Assistant with product discovery, recommendations, and customer support',
  },
  {
    capability: 'AI Product Discovery',
    woocommerce: 'Search plugins available',
    silarAi: 'Native conversational AI product discovery',
  },
  {
    capability: 'AI Product Recommendations',
    woocommerce: 'Available through extensions',
    silarAi: 'Built-in AI recommendations and cross-selling',
  },
  {
    capability: 'AI Product Descriptions',
    woocommerce: 'AI plugins available',
    silarAi: 'AI-generated product descriptions, blogs, promotions, and marketing content',
  },
  {
    capability: 'Social Media Management',
    woocommerce: 'Requires multiple plugins or external tools',
    silarAi: 'Built-in social media publishing and campaign management',
  },
  {
    capability: 'Facebook & Instagram Publishing',
    woocommerce: 'Supported through plugins and integrations',
    silarAi: 'Native publishing and campaign management from one dashboard',
  },
  {
    capability: 'WhatsApp Commerce',
    woocommerce: 'Requires third-party plugins',
    silarAi: 'Built-in AI-powered WhatsApp engagement, shopping assistance, and customer communication',
  },
  {
    capability: 'Marketing Campaigns',
    woocommerce: 'Managed through plugins or external marketing tools',
    silarAi: 'AI-assisted campaign creation, scheduling, and publishing',
  },
  {
    capability: 'AI Content Generation',
    woocommerce: 'Available through external AI plugins',
    silarAi: 'Built-in AI for blogs, product pages, emails, ads, promotions, and social content',
  },
  {
    capability: 'Marketing Automation',
    woocommerce: 'Plugin ecosystem',
    silarAi: 'Native AI-powered marketing automation and customer journeys',
  },
  {
    capability: 'Customer Engagement',
    woocommerce: 'Multiple plugins may be required',
    silarAi: 'Unified engagement across website, Facebook, Instagram, and WhatsApp',
  },
  {
    capability: 'Lead Management',
    woocommerce: 'CRM plugins or integrations',
    silarAi: 'Integrated lead capture and customer management',
  },
  {
    capability: 'Analytics',
    woocommerce: 'WooCommerce analytics with optional reporting plugins',
    silarAi: 'Unified dashboard for commerce, marketing, AI conversations, customer engagement, and ROI',
  },
  {
    capability: 'Platform Management',
    woocommerce: 'WordPress, plugins, updates, and maintenance',
    silarAi: 'One integrated platform with built-in AI capabilities',
  },
];

export const WoocommerceComparisonPage: React.FC<WoocommerceComparisonPageProps> = ({
  onBackToHome,
  onBookDemo
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = WOOCOMMERCE_COMPARISON_DATA.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.capability.toLowerCase().includes(q) ||
      item.woocommerce.toLowerCase().includes(q) ||
      item.silarAi.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pt-24 pb-20">
      {/* Hero Header */}
      <div className="bg-plum-950 text-white relative overflow-hidden border-b border-plum-800 py-16 lg:py-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-plum-800/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              WooCommerce <span className="text-slate-400 font-light">vs</span> <span className="text-peach-300">SilarAI</span>
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-teal-200">
              AI-Powered Commerce vs. Plugin-Based Commerce
            </p>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal pt-2">
              WooCommerce is a flexible ecommerce platform for WordPress. SilarAI is an AI Commerce &amp; Marketing Platform that combines ecommerce, AI-powered shopping, marketing automation, social media management, and customer engagement in one intelligent solution.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Feature Matrix Table */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Capability Comparison Table
              </h2>
              <p className="text-sm text-slate-600">
                Compare WooCommerce functionality against the SilarAI Platform line-by-line.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search capabilities..."
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
                      WooCommerce
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
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/50'}
                    >
                      <td className="p-4 sm:p-5 font-extrabold text-slate-900 border-r border-slate-200">
                        <div>{item.capability}</div>
                      </td>

                      <td className="p-4 sm:p-5 text-slate-600 border-r border-slate-200 bg-slate-50/30">
                        <div className="flex items-start gap-2.5">
                          <X className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-600">{item.woocommerce}</span>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 font-semibold text-slate-900 bg-peach-100/40">
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-plum-700 text-peach-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-plum-950 font-extrabold leading-snug">{item.silarAi}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500 text-sm font-medium">
                        No capability matches "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why Businesses Choose SilarAI Section */}
        <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Businesses Choose SilarAI
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              WooCommerce provides the flexibility of the WordPress ecosystem. SilarAI is built for businesses that want AI-powered commerce and marketing without assembling and maintaining a large collection of plugins.
            </p>
          </div>

          <div className="pt-2 space-y-4">
            <h3 className="text-lg font-extrabold text-plum-950">
              With SilarAI, you can:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Build and manage your online store',
                'Help customers shop with AI',
                'Generate marketing content automatically',
                'Publish campaigns to Facebook and Instagram',
                'Engage customers through WhatsApp',
                'Manage commerce and marketing from one dashboard',
                'Reduce dependency on multiple plugins and external applications',
                'Scale your business with AI-powered automation',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Which Platform Is Right for You? Section */}
        <section className="bg-gradient-to-b from-slate-900 to-plum-950 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Which Platform Is Right for You?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-lg font-extrabold text-peach-300">
                Choose WooCommerce if you want:
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-peach-300 shrink-0 mt-0.5" />
                  <span>An ecommerce solution built on WordPress</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-peach-300 shrink-0 mt-0.5" />
                  <span>Access to a large plugin ecosystem</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-peach-300 shrink-0 mt-0.5" />
                  <span>Full control over hosting and customization</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-4">
              <h3 className="text-lg font-extrabold text-teal-300">
                Choose SilarAI if you want:
              </h3>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>An AI-first commerce platform</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>Built-in AI shopping assistance</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>Integrated commerce and marketing workflows</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>AI-generated content and campaigns</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>Native social media and WhatsApp engagement</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>One platform to sell, market, and grow your business</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="text-sm font-black text-slate-900">Is SilarAI a WooCommerce replacement?</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SilarAI can be used as a complete AI Commerce &amp; Marketing Platform. It also offers an AI Shopping Assistant that can complement existing ecommerce stores, depending on your deployment needs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="text-sm font-black text-slate-900">Does SilarAI include AI marketing?</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Yes. SilarAI includes AI-powered content generation, campaign management, social media publishing, and marketing automation alongside its commerce capabilities.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="text-sm font-black text-slate-900">Can SilarAI help reduce plugin dependency?</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Many commerce and marketing capabilities are built into SilarAI, reducing the need to combine multiple plugins and standalone marketing tools.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="text-sm font-black text-slate-900">Is SilarAI suitable for B2B and D2C businesses?</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Yes. SilarAI is designed for manufacturers, distributors, wholesalers, retailers, and direct-to-consumer brands looking to modernize commerce and marketing with AI.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Tagline Banner */}
        <section className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white p-8 sm:p-12 rounded-3xl border border-plum-800 shadow-xl text-center space-y-4">
          <p className="text-xl sm:text-3xl font-black text-peach-300 tracking-wide">
            Sell. Market. Grow. Powered by AI.
          </p>
          <p className="text-base sm:text-xl font-bold text-teal-300">
            One Platform. One AI. Endless Growth.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onBookDemo()}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4 text-plum-950" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
