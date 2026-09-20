import React, { useState } from 'react';
import {
  Store,
  PackagePlus,
  Share2,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bot,
  UploadCloud,
  MessageCircle,
  BarChart3,
  Globe,
  DollarSign
} from 'lucide-react';

interface HowItWorksProps {
  onBookDemo?: (plan?: string) => void;
}

interface WorkflowStep {
  stepNumber: string;
  title: string;
  description: string;
  bullets: string[];
  icon: React.ElementType;
  badge: string;
  mockupPreview: {
    heading: string;
    subheading: string;
    metrics: { label: string; value: string }[];
    tag: string;
  };
}

const COMMERCE_PLATFORM_STEPS: WorkflowStep[] = [
  {
    stepNumber: '01',
    title: 'Create your store',
    description: 'Sign up, add your business name and logo, and you have a live storefront in minutes.',
    bullets: [
      'Custom domain ready (www.yourbrand.com) with free SSL',
      'Mobile-first responsive theme pre-configured',
      'No developers, no hosting, zero stress'
    ],
    icon: Store,
    badge: 'Instant Setup',
    mockupPreview: {
      heading: 'Storefront Configured',
      subheading: 'yourbrand.silarai.store is live and secure',
      tag: 'Live in < 2 mins',
      metrics: [
        { label: 'SSL Security', value: 'Active 256-bit' },
        { label: 'Domain Status', value: 'Connected' },
        { label: 'Mobile Score', value: '99/100' }
      ]
    }
  },
  {
    stepNumber: '02',
    title: 'Add your products',
    description: "Upload photos, set prices, and organise products into categories — it's as simple as filling a form.",
    bullets: [
      'Fill a quick visual form or import via bulk CSV',
      'Stock alerts, variant pricing (sizes, colors) & SKU tracker',
      'Automatic AI catalog categorization & search tags'
    ],
    icon: PackagePlus,
    badge: 'Zero Effort',
    mockupPreview: {
      heading: 'Catalog Indexed',
      subheading: 'Products synced with dynamic inventory tracker',
      tag: 'Real-time sync',
      metrics: [
        { label: 'Products Added', value: '48 items' },
        { label: 'Variants Active', value: '142 SKUs' },
        { label: 'Inventory Mode', value: 'Auto-tracking' }
      ]
    }
  },
  {
    stepNumber: '03',
    title: 'Market the products',
    description: 'Share your store link on WhatsApp or Instagram. Customers browse, chat with AI, and place orders.',
    bullets: [
      'Direct WhatsApp checkout and 1-click Instagram link-in-bio',
      '24/7 AI chat answers customer FAQs & suggests products',
      'Recovers abandoned carts automatically via messaging'
    ],
    icon: Share2,
    badge: 'Social & AI',
    mockupPreview: {
      heading: 'AI Conversational Chat',
      subheading: 'Autonomous sales assistant converting customer inquiries',
      tag: '24/7 Active',
      metrics: [
        { label: 'AI Response Time', value: '< 1 sec' },
        { label: 'Chat Resolution', value: '94.2%' },
        { label: 'Cart Recovery', value: '+38% lift' }
      ]
    }
  },
  {
    stepNumber: '04',
    title: 'Start selling',
    description: 'Watch your dashboard light up as orders and enquiries roll in. Instant notifications, zero hassle.',
    bullets: [
      'Real-time order dashboard with COD & online payment tracking',
      'Automated invoice generation & WhatsApp shipping alerts',
      'Customer purchase history & repeat buyer analytics'
    ],
    icon: TrendingUp,
    badge: 'Revenue Live',
    mockupPreview: {
      heading: 'Orders Rolling In',
      subheading: 'Payments deposited directly to your bank account',
      tag: 'Settlement ready',
      metrics: [
        { label: 'Orders Today', value: '24 orders' },
        { label: 'Revenue Logged', value: '$3,840' },
        { label: 'Fulfillment', value: 'Auto-dispatched' }
      ]
    }
  }
];

const SHOPPING_ASSISTANT_STEPS: WorkflowStep[] = [
  {
    stepNumber: '01',
    title: 'Connect Existing Store',
    description: 'Plug SilarAI into Shopify, WooCommerce, Magento, or your custom headless API in 1 click.',
    bullets: [
      'Zero migration: keep your current storefront as is',
      'Bi-directional catalog and live stock synchronization',
      'Sub-50ms secure data ingestion'
    ],
    icon: UploadCloud,
    badge: '1-Click Connect',
    mockupPreview: {
      heading: 'Store Connected',
      subheading: 'Shopify / WooCommerce sync established',
      tag: 'API Integrated',
      metrics: [
        { label: 'Sync Status', value: 'Live 100%' },
        { label: 'Catalog Size', value: '12,450 SKUs' },
        { label: 'Latency', value: '42ms' }
      ]
    }
  },
  {
    stepNumber: '02',
    title: 'Train AI on Specs & FAQs',
    description: 'Upload sizing charts, return policies, spec sheets, and wholesale terms in PDF, CSV, or text.',
    bullets: [
      'Understands technical specs, dimensions & care instructions',
      'Guards brand tone of voice and pricing tiers',
      'Continuous learning from customer interactions'
    ],
    icon: Bot,
    badge: 'Deep Knowledge',
    mockupPreview: {
      heading: 'Knowledge Base Ready',
      subheading: 'AI trained on full brand catalog & policies',
      tag: 'Zero hallucinations',
      metrics: [
        { label: 'Accuracy Rate', value: '99.4%' },
        { label: 'FAQ Documents', value: '28 sources' },
        { label: 'Languages', value: '15+ global' }
      ]
    }
  },
  {
    stepNumber: '03',
    title: 'Deploy Omnichannel Assistant',
    description: 'Embed the conversational assistant on web, mobile app, WhatsApp Business, and Instagram DMs.',
    bullets: [
      'Conversational product recommendations & visual search',
      'Real-time price quotes & volume discount calculation',
      'Human agent escalation when complex assistance needed'
    ],
    icon: MessageCircle,
    badge: 'Omnichannel',
    mockupPreview: {
      heading: 'Omnichannel Deployed',
      subheading: 'Active across Web, WhatsApp & Instagram',
      tag: 'Unified Inbox',
      metrics: [
        { label: 'Active Chats', value: '18 concurrent' },
        { label: 'Recommendation CTR', value: '28.6%' },
        { label: 'Avg Session', value: '3m 12s' }
      ]
    }
  },
  {
    stepNumber: '04',
    title: 'Multiply Conversions & GMV',
    description: 'Track conversion lift, average order value increase, and revenue generated by AI interactions.',
    bullets: [
      'Comprehensive conversion attribution dashboard',
      'Cart abandonment recovery sequences via messaging',
      'Sub-50ms dynamic margin optimization'
    ],
    icon: BarChart3,
    badge: 'Scale Revenue',
    mockupPreview: {
      heading: 'Performance Lift Active',
      subheading: 'AI-assisted revenue tracking and customer CRM',
      tag: '+38% Conv Rate',
      metrics: [
        { label: 'GMV Influenced', value: '$84,200/mo' },
        { label: 'AOV Increase', value: '+24.5%' },
        { label: 'Support Deflection', value: '82%' }
      ]
    }
  }
];

export const HowItWorks: React.FC<HowItWorksProps> = ({ onBookDemo }) => {
  const [activeTab, setActiveTab] = useState<'platform' | 'assistant'>('platform');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const steps = activeTab === 'platform' ? COMMERCE_PLATFORM_STEPS : SHOPPING_ASSISTANT_STEPS;
  const currentStep = steps[activeStepIndex] || steps[0];
  const StepIcon = currentStep.icon;

  return (
    <section id="how-it-works" className="py-14 md:py-18 bg-canvas relative overflow-hidden border-b border-slate-200/80">
      {/* Background Decorative Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-plum-100 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-100/60 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Workflow & Implementation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Simple to get started
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-plum-700">
            Up and running in 3 steps
          </p>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            No technical hurdles or complicated software. SilarAI is built for immediate execution so you can start selling faster.
          </p>

          {/* Workflow Toggle Tabs */}
          <div className="pt-3 flex justify-center">
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
              <button
                type="button"
                id="tab-commerce-platform"
                onClick={() => {
                  setActiveTab('platform');
                  setActiveStepIndex(0);
                }}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'platform'
                    ? 'bg-plum-700 text-white shadow-md shadow-plum-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>AI Commerce Platform (New Store)</span>
              </button>

              <button
                type="button"
                id="tab-shopping-assistant"
                onClick={() => {
                  setActiveTab('assistant');
                  setActiveStepIndex(0);
                }}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'assistant'
                    ? 'bg-plum-700 text-white shadow-md shadow-plum-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Shopping Assistant (Existing Store)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Interactive Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {steps.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            const Icon = step.icon;

            return (
              <button
                key={step.stepNumber}
                type="button"
                id={`step-card-${step.stepNumber}`}
                onClick={() => setActiveStepIndex(idx)}
                className={`text-left p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative group cursor-pointer ${
                  isSelected
                    ? 'bg-white border-plum-700 shadow-xl shadow-plum-900/10 ring-2 ring-plum-700/20 -translate-y-1'
                    : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-colors ${
                        isSelected
                          ? 'bg-plum-700 text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-plum-50 group-hover:text-plum-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-md ${
                        isSelected
                          ? 'bg-peach-100 text-peach-700 border border-peach-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {step.stepNumber}
                    </span>
                  </div>

                  {/* Step Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-plum-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Micro-Indicator */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">{step.badge}</span>
                  <span className={`inline-flex items-center gap-1 font-bold ${isSelected ? 'text-plum-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Deep-Dive Spotlight Card */}
        <div className="bg-gradient-to-br from-plum-950 via-plum-900 to-plum-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-plum-800 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-peach-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Col: Step Narrative & Features */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-plum-800/80 border border-plum-700 text-peach-300 font-mono text-xs font-bold">
                  Step {currentStep.stepNumber} of 04
                </span>
                <span className="text-xs font-semibold text-plum-300 bg-plum-900/60 px-3 py-1 rounded-lg border border-plum-800">
                  {currentStep.badge}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  {currentStep.title}
                </h3>
                <p className="text-base sm:text-lg text-plum-200 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              {/* Key Features Bullet List */}
              <div className="space-y-2.5 pt-1">
                {currentStep.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-3 text-sm text-plum-100">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Navigation & CTA Controls */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  type="button"
                  id="btn-howitworks-cta"
                  onClick={() => onBookDemo && onBookDemo(activeTab === 'platform' ? 'AI Commerce Platform' : 'AI Shopping Assistant')}
                  className="px-6 py-3 rounded-xl bg-peach-500 hover:bg-peach-600 text-white font-extrabold text-sm transition-all shadow-lg shadow-peach-500/30 flex items-center gap-2 active:scale-95"
                >
                  <span>{activeTab === 'platform' ? 'Start Your Free Store' : 'Request Live Demo'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {activeStepIndex < 3 ? (
                  <button
                    type="button"
                    id="btn-howitworks-next"
                    onClick={() => setActiveStepIndex(activeStepIndex + 1)}
                    className="px-5 py-3 rounded-xl bg-plum-800 hover:bg-plum-700 text-plum-200 hover:text-white text-sm font-bold transition-all border border-plum-700 flex items-center gap-1.5"
                  >
                    <span>Next: Step {steps[activeStepIndex + 1].stepNumber}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    id="btn-howitworks-restart"
                    onClick={() => setActiveStepIndex(0)}
                    className="px-5 py-3 rounded-xl bg-plum-800 hover:bg-plum-700 text-plum-200 hover:text-white text-sm font-bold transition-all border border-plum-700"
                  >
                    Back to Step 01
                  </button>
                )}
              </div>
            </div>

            {/* Right Col: Live Mockup Console */}
            <div className="lg:col-span-5">
              <div className="bg-plum-900/90 rounded-2xl border border-plum-700/80 p-6 shadow-2xl backdrop-blur-md">
                {/* Console Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-plum-800 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-plum-400 ml-2">silarai-commerce-os</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800">
                    {currentStep.mockupPreview.tag}
                  </span>
                </div>

                {/* Console Body */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {currentStep.mockupPreview.heading}
                      </h4>
                      <p className="text-xs text-plum-300">
                        {currentStep.mockupPreview.subheading}
                      </p>
                    </div>
                  </div>

                  {/* Real-time Metric Indicators */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    {currentStep.mockupPreview.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="bg-plum-950/70 p-3 rounded-xl border border-plum-800/80 text-center">
                        <div className="text-[11px] text-plum-400 font-medium mb-1 truncate">
                          {m.label}
                        </div>
                        <div className="text-xs sm:text-sm font-mono font-bold text-peach-300">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* System Health / Status */}
                  <div className="p-3 rounded-xl bg-plum-950/90 border border-plum-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-plum-300">
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                      <span>End-to-End Encryption &amp; SSL</span>
                    </div>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
