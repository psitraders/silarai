import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Check, Zap, Crown, Star, ArrowRight, MessageCircle, ShieldCheck,
  Users, Package, Bot, BarChart2, Palette, Infinity,
} from 'lucide-react';
import { PageLoader } from '../../components/ui/Spinner';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  maxProducts: number;
  maxStaffUsers: number;
  maxMonthlyLeads: number;
  maxAiSuggestionsPerMonth: number;
  allowsCustomBranding: boolean;
  allowsAdvancedAnalytics: boolean;
  allowsAiSuggestions: boolean;
  sortOrder: number;
}

const PLAN_META: Record<string, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badge?: string;
  popular?: boolean;
}> = {
  basic: {
    icon: Star,
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
  pro: {
    icon: Zap,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-400',
    badge: 'Most Popular',
    popular: true,
  },
  professional: {
    icon: Crown,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-400',
    badge: 'Best Value',
  },
};

const PLAN_FEATURES: Record<string, string[]> = {
  basic: [
    'Up to 50 products',
    '1 staff user',
    'Public storefront',
    'WhatsApp integration',
    'Up to 100 leads/month',
    'Basic order management',
    'Community support',
  ],
  pro: [
    'Up to 500 products',
    '3 staff users',
    'Custom branding',
    'WhatsApp + Instagram + Facebook',
    'Up to 1,000 leads/month',
    '200 AI reply suggestions/month',
    'Advanced analytics',
    'Priority support',
  ],
  professional: [
    'Unlimited products',
    'Unlimited staff users',
    'Full custom branding',
    'All integrations (WA + IG + FB)',
    'Unlimited leads',
    'Unlimited AI suggestions',
    'Advanced analytics & reports',
    'Dedicated account manager',
    'Custom domain (coming soon)',
  ],
};

function fmt(n: number) {
  if (n >= 2147483647) return '∞';
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function PricingPage() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);

  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: () => axios.get(`${BASE_URL}/plans`).then(r => r.data),
  });

  if (isLoading) return <PageLoader />;

  const annualSaving = (p: Plan) =>
    p.monthlyPrice > 0
      ? Math.round(((p.monthlyPrice * 12 - p.annualPrice) / (p.monthlyPrice * 12)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> No credit card required to start
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
          Start free. Upgrade as you grow. Every plan includes your public storefront,
          WhatsApp ordering, and lead management.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              !annual ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              annual ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual
            <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Save up to 25%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map(plan => {
            const meta = PLAN_META[plan.slug] ?? PLAN_META.basic;
            const PlanIcon = meta.icon;
            const features = PLAN_FEATURES[plan.slug] ?? [];
            const price = annual && plan.annualPrice > 0 ? plan.annualPrice / 12 : plan.monthlyPrice;
            const saving = annualSaving(plan);
            const isFree = plan.monthlyPrice === 0;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl border-2 p-7 flex flex-col gap-5 shadow-sm transition-shadow hover:shadow-xl ${meta.border} ${
                  meta.popular ? 'ring-2 ring-teal-400 ring-offset-2 shadow-teal-100 shadow-lg' : ''
                }`}
              >
                {/* Popular badge */}
                {meta.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                    meta.popular ? 'bg-teal-600' : 'bg-violet-600'
                  }`}>
                    {meta.badge}
                  </div>
                )}

                {/* Plan header */}
                <div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${meta.bg}`}>
                    <PlanIcon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                </div>

                {/* Price */}
                <div>
                  {isFree ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">Free</span>
                      <span className="text-slate-400 text-sm">forever</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-medium text-slate-500">₹</span>
                        <span className="text-4xl font-bold text-slate-900">
                          {Math.round(price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-400 text-sm">/month</span>
                      </div>
                      {annual && saving > 0 && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          You save {saving}% · ₹{plan.annualPrice.toLocaleString('en-IN')} billed annually
                        </p>
                      )}
                      {!annual && (
                        <p className="text-xs text-slate-400 mt-1">
                          or ₹{Math.round(plan.annualPrice / 12).toLocaleString('en-IN')}/mo billed annually
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('/subscription')}
                  className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    meta.popular
                      ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200'
                      : isFree
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isFree ? 'Get started free' : `Start ${plan.name}`}
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Limits strip */}
                <div className={`grid grid-cols-3 gap-2 p-3 rounded-2xl ${meta.bg} text-center`}>
                  <div>
                    <p className="text-base font-bold text-slate-900">{fmt(plan.maxProducts)}</p>
                    <p className="text-[10px] text-slate-500">Products</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{fmt(plan.maxMonthlyLeads)}</p>
                    <p className="text-[10px] text-slate-500">Leads/mo</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {plan.maxAiSuggestionsPerMonth === 0 ? '—' : fmt(plan.maxAiSuggestionsPerMonth)}
                    </p>
                    <p className="text-[10px] text-slate-500">AI/mo</p>
                  </div>
                </div>

                {/* Feature list */}
                <ul className="space-y-2.5 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${meta.color}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Full feature comparison</h2>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Feature</th>
                  {plans.map(p => (
                    <th key={p.id} className="px-4 py-4 text-center font-semibold text-slate-900">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Products', icon: Package, values: plans.map(p => fmt(p.maxProducts)) },
                  { label: 'Staff users', icon: Users, values: plans.map(p => fmt(p.maxStaffUsers)) },
                  { label: 'Leads/month', icon: MessageCircle, values: plans.map(p => fmt(p.maxMonthlyLeads)) },
                  { label: 'AI suggestions/month', icon: Bot, values: plans.map(p => p.maxAiSuggestionsPerMonth === 0 ? '—' : fmt(p.maxAiSuggestionsPerMonth)) },
                  { label: 'Advanced analytics', icon: BarChart2, values: plans.map(p => p.allowsAdvancedAnalytics) },
                  { label: 'Custom branding', icon: Palette, values: plans.map(p => p.allowsCustomBranding) },
                  { label: 'AI reply suggestions', icon: Zap, values: plans.map(p => p.allowsAiSuggestions) },
                  { label: 'All channel integrations', icon: Infinity, values: [false, true, true] },
                ].map(({ label, icon: Icon, values }, i) => (
                  <tr key={label} className={i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="px-6 py-3.5 text-slate-700 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      {label}
                    </td>
                    {values.map((v, j) => (
                      <td key={j} className="px-4 py-3.5 text-center">
                        {typeof v === 'boolean' ? (
                          v
                            ? <Check className="w-4 h-4 text-teal-600 mx-auto" />
                            : <span className="text-slate-300 font-bold">—</span>
                        ) : (
                          <span className="font-semibold text-slate-800">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I upgrade or downgrade anytime?',
                a: 'Yes! You can change your plan at any time. Upgrades take effect immediately. Downgrades apply at the next billing cycle.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes — all paid plans include a 30-day free trial with full access. No credit card required to start.',
              },
              {
                q: 'How do I pay?',
                a: 'We accept UPI, credit/debit cards, and net banking via Razorpay. Contact us on WhatsApp to activate your subscription.',
              },
              {
                q: 'What happens if I exceed my limits?',
                a: 'We\'ll notify you before you hit your limits and suggest an upgrade. We won\'t cut off your store without warning.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="font-semibold text-slate-900 mb-1.5">{q}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-10 text-white">
            <h2 className="text-2xl font-bold mb-2">Ready to grow your business?</h2>
            <p className="text-teal-100 mb-6">Start with the free plan today — no credit card needed.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/subscription')}
                className="px-7 py-3 bg-white text-teal-700 rounded-2xl font-semibold hover:bg-teal-50 transition shadow-lg"
              >
                Get started free
              </button>
              <a
                href="https://wa.me/919876543210?text=Hi! I'd like to know more about ReplyCart plans."
                target="_blank"
                rel="noreferrer"
                className="px-7 py-3 border border-white/30 text-white rounded-2xl font-semibold hover:bg-white/10 transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Chat with Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
