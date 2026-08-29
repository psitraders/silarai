import React, { useState } from 'react';
import { PRODUCTS_PRICING, WHY_SILARAI_BENEFITS } from '../data/content';
import { 
  Check, 
  X, 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Store, 
  ShieldCheck, 
  Zap, 
  Building2, 
  FileText, 
  Info, 
  HelpCircle, 
  Lock, 
  RefreshCw, 
  CreditCard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RoiCalculator } from './RoiCalculator';

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [activeProductId, setActiveProductId] = useState<'shopping-assistant' | 'commerce-platform'>('shopping-assistant');
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [showInlineTerms, setShowInlineTerms] = useState(false);

  const selectedProduct = PRODUCTS_PRICING.find((p) => p.id === activeProductId) || PRODUCTS_PRICING[0];

  return (
    <section id="pricing" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-50 border border-plum-200 text-plum-950 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-plum-700" />
            Simple &amp; Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Choose the product that's right for your business
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            AI Shopping Assistant starting at <strong className="text-plum-950 font-black">$10/month</strong>. No hidden fees. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Quick Pricing Summary Table */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="text-xs font-black text-slate-500 uppercase tracking-wider text-center sm:text-left flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-plum-700" />
              Unified Pricing Matrix Across Products
            </div>
            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="text-xs font-extrabold text-plum-900 hover:text-plum-950 underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-peach-300 fill-plum-950" />
              <span>Read Terms &amp; Conditions</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-2.5 px-3 text-left">Product / Plan</th>
                  <th className="py-2.5 px-3 font-extrabold text-plum-950">Starter Plan</th>
                  <th className="py-2.5 px-3 font-extrabold text-plum-900">Growth Plan</th>
                  <th className="py-2.5 px-3 font-extrabold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 font-extrabold text-slate-900">
                  <td className="py-3 px-3 text-left font-bold text-slate-700 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-plum-700" />
                    <span>AI Shopping Assistant</span>
                  </td>
                  <td className="py-3 px-3 bg-peach-100/70 rounded-xl text-plum-950 text-base sm:text-lg font-black">
                    $10<span className="text-xs font-bold text-slate-600">/mo</span>
                  </td>
                  <td className="py-3 px-3 bg-plum-50/60 rounded-xl text-plum-900 text-base sm:text-lg">
                    $50<span className="text-xs font-bold text-slate-600">/mo</span>
                  </td>
                  <td className="py-3 px-3 bg-slate-100/80 rounded-xl text-slate-900 text-xs sm:text-sm">
                    Custom Quote
                  </td>
                </tr>
                <tr className="font-extrabold text-slate-900">
                  <td className="py-3 px-3 text-left font-bold text-slate-700 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-plum-700" />
                    <span>AI Commerce Platform</span>
                  </td>
                  <td className="py-3 px-3 bg-plum-50/60 rounded-xl text-plum-900 text-base sm:text-lg">
                    $25<span className="text-xs font-bold text-slate-600">/mo</span>
                  </td>
                  <td className="py-3 px-3 bg-plum-50/60 rounded-xl text-plum-900 text-base sm:text-lg">
                    $50<span className="text-xs font-bold text-slate-600">/mo</span>
                  </td>
                  <td className="py-3 px-3 bg-slate-100/80 rounded-xl text-slate-900 text-xs sm:text-sm">
                    Custom Quote
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 font-medium text-center pt-1 flex items-center justify-center gap-2 flex-wrap">
            <span>• 14-Day Money-Back Guarantee</span>
            <span>• Cancel Anytime</span>
            <span>• No Setup Fees</span>
            <span>• 500 Conversations Included ($0.02/extra conversation)</span>
          </div>
        </div>

        {/* Product Selector Tabs */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/70">
            <button
              onClick={() => setActiveProductId('shopping-assistant')}
              className={`w-full sm:w-1/2 py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2.5 ${
                activeProductId === 'shopping-assistant'
                  ? 'bg-plum-950 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Bot className="w-4 h-4 text-peach-300" />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="leading-none">SilarAI Shopping Assistant</span>
                  <span className="text-[9px] bg-peach-300 text-plum-950 px-1.5 py-0.5 rounded font-black">
                    Starts $10/mo
                  </span>
                </div>
                <div className="text-[10px] font-medium opacity-80 mt-1">For existing Shopify, Woo &amp; custom stores</div>
              </div>
            </button>

            <button
              onClick={() => setActiveProductId('commerce-platform')}
              className={`w-full sm:w-1/2 py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2.5 ${
                activeProductId === 'commerce-platform'
                  ? 'bg-plum-950 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Store className="w-4 h-4 text-peach-300" />
              <div className="text-left">
                <div className="leading-none">SilarAI Commerce &amp; Marketing Platform</div>
                <div className="text-[10px] font-medium opacity-80 mt-1">All-in-one AI ecommerce &amp; marketing</div>
              </div>
            </button>
          </div>

          {/* Selected Product Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                {selectedProduct.title}
                {selectedProduct.id === 'shopping-assistant' && (
                  <span className="text-xs bg-peach-200 text-plum-950 font-black px-2.5 py-0.5 rounded-full border border-peach-300">
                    From $10/month
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {selectedProduct.description}
              </p>
            </div>

            {selectedProduct.supportedPlatforms && (
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-end shrink-0">
                {selectedProduct.supportedPlatforms.map((plat) => (
                  <span
                    key={plat}
                    className="text-[10px] font-extrabold bg-plum-50 text-plum-900 px-2.5 py-1 rounded-md border border-plum-100/80"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {selectedProduct.plans.map((plan) => {
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between relative bg-white ${
                  plan.isPopular
                    ? 'border-plum-700 shadow-xl ring-2 ring-plum-700/20 scale-102'
                    : 'border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-peach-300 text-plum-950 text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md border border-peach-400">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                    {plan.conversationLimit && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-plum-50 text-plum-950 px-2.5 py-1 rounded-full border border-plum-100">
                        {plan.conversationLimit}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-6 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  {/* Price Header */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      {typeof plan.priceMonthly === 'number' ? (
                        <>
                          <span className="text-4xl font-black text-slate-900">${plan.priceMonthly}</span>
                          <span className="text-xs text-slate-500 font-bold">/ month</span>
                        </>
                      ) : (
                        <span className="text-3xl sm:text-4xl font-black text-slate-900">{plan.priceMonthly}</span>
                      )}
                    </div>
                    {plan.termsSummary && (
                      <div className="mt-2 text-[11px] text-plum-900 bg-peach-50 border border-peach-200 p-2 rounded-xl font-semibold flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-coral-500 shrink-0 mt-0.5" />
                        <span>{plan.termsSummary}</span>
                      </div>
                    )}
                  </div>

                  {/* Features Header label */}
                  <div className="space-y-3 mb-6">
                    {plan.features && plan.features.length > 0 ? (
                      <>
                        <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          {plan.featuresHeader || 'Included Capabilities'}
                        </div>

                        {/* Included Features */}
                        <div className="space-y-2.5">
                          {plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                              <div className="w-4 h-4 rounded-full bg-plum-950 text-peach-300 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 font-medium space-y-1.5">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-plum-950" />
                          <span>Custom Enterprise Solution</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed">
                          Tailored feature sets, dedicated infrastructure, custom integrations, and SLA guarantees configured for your specific requirements.
                        </p>
                      </div>
                    )}

                    {/* Not Included Features (e.g. Starter Shopping Assistant) */}
                    {plan.notIncluded && plan.notIncluded.length > 0 && (
                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                          Not Included
                        </div>
                        {plan.notIncluded.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-400 line-through">
                            <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                              <X className="w-3 h-3 stroke-[2.5]" />
                            </div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <button
                    onClick={() => {
                      const priceTag = typeof plan.priceMonthly === 'number' ? `$${plan.priceMonthly}/mo` : plan.priceMonthly;
                      onSelectPlan(`${selectedProduct.title} - ${plan.name} Plan (${priceTag})`);
                    }}
                    className={`w-full py-3.5 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 ${
                      plan.isPopular
                        ? 'bg-plum-950 hover:bg-plum-900 text-white shadow-plum-950/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4 text-peach-300" />
                  </button>

                  <button
                    onClick={() => setIsTermsModalOpen(true)}
                    className="w-full text-center text-[10px] font-extrabold text-slate-500 hover:text-plum-950 underline transition-colors"
                  >
                    View Terms &amp; Conditions
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated Terms & Conditions Expandable Accordion Box */}
        <div id="terms-and-conditions-box" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plum-50 text-plum-900 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-plum-700" />
                Merchant Protection Policy
              </div>
              <h3 className="text-xl font-black text-slate-900">
                SilarAI Shopping Assistant Terms &amp; Conditions Summary
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Transparent billing rules, usage limits, cancellation policies, and privacy guarantees for all $10/mo and $50/mo subscribers.
              </p>
            </div>

            <button
              onClick={() => setShowInlineTerms(!showInlineTerms)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <span>{showInlineTerms ? 'Hide Detailed Terms' : 'Expand Terms Breakdown'}</span>
              {showInlineTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-xs text-slate-900">
                <CreditCard className="w-4 h-4 text-plum-700" />
                <span>1. Monthly $10 Subscription Rate</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Starter AI Shopping Assistant plan is billed monthly at $10/month. Subscription auto-renews each month via automated credit card or PayPal processing until paused or cancelled.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-xs text-slate-900">
                <RefreshCw className="w-4 h-4 text-plum-700" />
                <span>2. 500 Conversations &amp; Overages</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Includes 500 AI buyer chat conversations per month. Additional conversations beyond 500 are billed at $0.02 per conversation. Set custom monthly spend caps anytime in your dashboard.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-xs text-slate-900">
                <Lock className="w-4 h-4 text-plum-700" />
                <span>3. Guarantee &amp; Privacy Shield</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Includes a 14-day 100% money-back guarantee. Merchant catalog and conversation data are encrypted (TLS 1.3 / AES-256) and strictly kept private—never used to train public models.
              </p>
            </div>
          </div>

          {showInlineTerms && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-4 text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-5 rounded-2xl">
              <h4 className="font-extrabold text-slate-900 text-sm">Detailed Merchant Agreement Terms:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-800">Billing Cycle &amp; Invoicing:</strong> Charges occur on the anniversary date of sign-up. Invoices are dispatched automatically to your billing email address.
                </li>
                <li>
                  <strong className="text-slate-800">1-Click Cancellation:</strong> You can cancel your subscription at any time without talking to a sales agent or paying cancellation penalties. Your AI assistant will remain active until the end of your prepaid billing period.
                </li>
                <li>
                  <strong className="text-slate-800">Service Uptime SLA:</strong> SilarAI guarantees 99.9% uptime for the embedded AI Shopping Assistant widget. In the event of system downtime exceeding SLA allowances, service credits will be credited automatically.
                </li>
                <li>
                  <strong className="text-slate-800">E-Commerce Platform Support:</strong> Compatible with Shopify, WooCommerce, Adobe Commerce, Magento, and custom web applications via standard Javascript widget or REST API feeds.
                </li>
              </ul>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsTermsModalOpen(true)}
                  className="px-4 py-2 bg-plum-950 text-white rounded-xl text-xs font-bold hover:bg-plum-900 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-peach-300" />
                  <span>Open Printable Terms Modal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interactive ROI Calculator with D3 & Recharts Visualizations */}
        <RoiCalculator onBookDemo={(summary) => onSelectPlan(summary || 'ROI Projection Demo')} />

        {/* Why SilarAI? Benefits Card & Enterprise Contact */}
        <div className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white rounded-3xl p-8 sm:p-12 border border-plum-800 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-plum-800 px-3 py-1 rounded-full border border-plum-700">
              The SilarAI Advantage
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Why SilarAI?
            </h3>
            <p className="text-xs sm:text-sm text-plum-200">
              Built for high-growth merchants, agencies, and global brand leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {WHY_SILARAI_BENEFITS.map((benefit, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-plum-900/80 border border-plum-800 flex flex-col justify-between space-y-3"
              >
                <div className="w-7 h-7 rounded-lg bg-peach-300 text-plum-950 flex items-center justify-center font-black text-xs">
                  {idx + 1}
                </div>
                <p className="text-xs font-bold text-white leading-snug">
                  {benefit}
                </p>
              </div>
            ))}
          </div>

          {/* Enterprise Tailored Contact Banner */}
          <div className="bg-plum-900/90 border border-plum-700/80 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-base sm:text-lg font-black text-white flex items-center justify-center md:justify-start gap-2">
                <Building2 className="w-5 h-5 text-peach-300" />
                Need Custom Conversation Limits or Enterprise Integrations?
              </h4>
              <p className="text-xs sm:text-sm text-plum-200 font-medium">
                Need more AI conversations or custom integrations? Contact our sales team for a tailored enterprise plan.
              </p>
            </div>

            <button
              onClick={() => onSelectPlan('Enterprise Custom Tailored Plan')}
              className="px-6 py-3.5 rounded-xl bg-peach-300 hover:bg-peach-200 text-plum-950 font-black text-xs sm:text-sm transition-all shadow-md shrink-0 flex items-center gap-2"
            >
              <span>Talk to Enterprise Sales</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Full Terms & Conditions Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 space-y-0">
            {/* Modal Header */}
            <div className="bg-plum-950 text-white p-6 flex items-center justify-between border-b border-plum-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-peach-300" />
                <div>
                  <h3 className="text-lg font-black text-white leading-none">
                    SilarAI Terms &amp; Conditions
                  </h3>
                  <p className="text-xs text-plum-200 font-medium mt-1">
                    Official Merchant &amp; Subscription Service Agreement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-plum-900 hover:bg-plum-800 text-white flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-700 leading-relaxed">
              <div className="bg-peach-50 border border-peach-200 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-coral-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-plum-950 text-sm">
                    AI Shopping Assistant Starter Plan — $10 / Month
                  </h4>
                  <p className="text-xs text-slate-600">
                    This agreement governs your subscription to the SilarAI Shopping Assistant Starter plan at $10 per month, covering 500 AI conversations, product discovery, and store recommendations.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
                  1. Subscription &amp; Billing Terms
                </h4>
                <p>
                  • <strong>Pricing Rate:</strong> $10.00 USD per month billed recursively on a monthly basis from date of initial activation.
                </p>
                <p>
                  • <strong>Payment Methods:</strong> Credit Card (Visa, Mastercard, Amex), PayPal, or Stripe instant debit.
                </p>
                <p>
                  • <strong>No Hidden Fees:</strong> Zero setup fees, zero maintenance surcharges, and zero hidden plugin fees.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
                  2. AI Conversation Allocation &amp; Overages
                </h4>
                <p>
                  • <strong>Included Conversations:</strong> 500 complete AI buyer conversations per calendar month.
                </p>
                <p>
                  • <strong>Overage Billing:</strong> Additional conversations beyond 500 are billed at $0.02 USD per conversation.
                </p>
                <p>
                  • <strong>Spend Protection Caps:</strong> You can define custom monthly hard caps in your merchant portal to automatically pause widget overages or notify your team.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
                  3. 14-Day Money Back Guarantee &amp; Cancellation
                </h4>
                <p>
                  • <strong>Risk-Free Guarantee:</strong> If you are dissatisfied with SilarAI within 14 days of your initial purchase, request a full 100% refund with zero questions asked.
                </p>
                <p>
                  • <strong>Cancel Anytime:</strong> Cancel your subscription with 1-click in your account dashboard. No minimum contract length or early termination fees.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
                  4. Data Security, Confidentiality &amp; AI Privacy
                </h4>
                <p>
                  • <strong>Data Ownership:</strong> You retain 100% ownership of your store catalog, product specifications, customer details, and sales history.
                </p>
                <p>
                  • <strong>Strict Model Confidentiality:</strong> SilarAI does NOT train public foundation models on your private customer conversations or catalog feeds.
                </p>
                <p>
                  • <strong>Security Encryption:</strong> End-to-end TLS 1.3 encryption for live chat sessions and AES-256 encryption at rest.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-1">
                  5. Uptime Guarantee &amp; Service SLA
                </h4>
                <p>
                  • <strong>99.9% Uptime:</strong> SilarAI cloud engine maintains 99.9% operational availability for storefront widgets.
                </p>
                <p>
                  • <strong>Sub-250ms Response Latency:</strong> Optimized AI vector retrieval ensuring instant response times for online shoppers.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium text-center sm:text-left">
                Effective Date: August 2026 • SilarAI Technologies Inc.
              </span>
              <button
                onClick={() => {
                  setIsTermsModalOpen(false);
                  onSelectPlan('AI Shopping Assistant - Starter Plan ($10/mo)');
                }}
                className="px-5 py-2.5 rounded-xl bg-plum-950 text-white font-extrabold text-xs hover:bg-plum-900 transition-colors shadow-md w-full sm:w-auto"
              >
                Accept Terms &amp; Subscribe for $10/mo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
