import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check, Zap, Crown, Star, ArrowRight, ShieldCheck, Calendar,
  AlertCircle, CheckCircle2, Sparkles, Package, Users, Bot,
  BarChart2, Palette, MessageCircle,
} from 'lucide-react';
import apiClient from '../../api/client';
import axios from 'axios';
import { PageLoader } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';

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
}

interface Subscription {
  hasSubscription: boolean;
  status: string;
  planName: string;
  planSlug: string;
  startDate?: string;
  endDate?: string;
  isAnnual: boolean;
  daysRemaining?: number;
  isExpired: boolean;
  plan?: Plan;
}

const PLAN_META: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; popular?: boolean; badge?: string }> = {
  basic:        { icon: Star,  color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200' },
  pro:          { icon: Zap,   color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-400',   popular: true, badge: 'Most Popular' },
  professional: { icon: Crown, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-400', badge: 'Best Value' },
};

const PLAN_FEATURES: Record<string, string[]> = {
  basic:        ['50 products', '1 staff user', 'Public storefront', 'WhatsApp integration', '100 leads/month', 'Community support'],
  pro:          ['500 products', '3 staff users', 'Custom branding', 'All integrations', '1,000 leads/month', '200 AI suggestions/mo', 'Advanced analytics', 'Priority support'],
  professional: ['Unlimited products', 'Unlimited staff', 'Full branding', 'All integrations', 'Unlimited leads', 'Unlimited AI', 'Dedicated manager'],
};

function fmt(n: number) {
  if (n >= 2147483647) return '∞';
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function SubscriptionPage() {
  const qc = useQueryClient();
  const [annual, setAnnual] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: sub, isLoading: subLoading } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: () => apiClient.get('/subscription').then(r => r.data),
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: () => axios.get(`${BASE_URL}/plans`).then(r => r.data),
  });

  const selectMutation = useMutation({
    mutationFn: ({ planId, isAnnual }: { planId: string; isAnnual: boolean }) =>
      apiClient.post(`/subscription/select/${planId}`, { isAnnual }).then(r => r.data),
    onSuccess: (data) => {
      setSuccess(data.message);
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  if (subLoading || plansLoading) return <PageLoader />;

  const currentPlanSlug = sub?.planSlug ?? 'basic';

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscription & Plans</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your plan, view usage, and upgrade when you're ready.</p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 text-sm">Plan selected!</p>
            <p className="text-green-700 text-sm mt-0.5">{success}</p>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Current Plan</p>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{sub?.planName ?? 'Basic'}</h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                sub?.status === 'Trial' ? 'bg-amber-100 text-amber-700' :
                sub?.status === 'Active' ? 'bg-green-100 text-green-700' :
                sub?.isExpired ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {sub?.status === 'Trial' ? '🎁 Trial' : sub?.status ?? 'Free'}
              </span>
            </div>
            {sub?.endDate && (
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {sub.status === 'Trial'
                  ? `Trial ends ${new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} (${sub.daysRemaining} days left)`
                  : `Renews ${new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              </p>
            )}
          </div>

          {sub?.isExpired && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 font-medium">Plan expired — upgrade to continue</span>
            </div>
          )}
        </div>

        {/* Usage stats */}
        {sub?.plan && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Package, label: 'Products', limit: fmt(sub.plan.maxProducts) },
              { icon: Users, label: 'Staff Users', limit: fmt(sub.plan.maxStaffUsers) },
              { icon: MessageCircle, label: 'Leads/month', limit: fmt(sub.plan.maxMonthlyLeads) },
              { icon: Bot, label: 'AI/month', limit: sub.plan.maxAiSuggestionsPerMonth === 0 ? 'None' : fmt(sub.plan.maxAiSuggestionsPerMonth) },
            ].map(({ icon: Icon, label, limit }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-base font-bold text-slate-900">{limit}</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Feature flags */}
        {sub?.plan && (
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: 'Custom Branding', enabled: sub.plan.allowsCustomBranding, icon: Palette },
              { label: 'Advanced Analytics', enabled: sub.plan.allowsAdvancedAnalytics, icon: BarChart2 },
              { label: 'AI Suggestions', enabled: sub.plan.allowsAiSuggestions, icon: Sparkles },
            ].map(({ label, enabled, icon: Icon }) => (
              <span
                key={label}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
                  enabled
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Plan selector */}
      <div>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-slate-900">Choose a plan</h2>

          {/* Billing toggle */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Annual
              <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-25%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(plan => {
            const meta = PLAN_META[plan.slug] ?? PLAN_META.basic;
            const PlanIcon = meta.icon;
            const features = PLAN_FEATURES[plan.slug] ?? [];
            const price = annual && plan.annualPrice > 0 ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
            const isFree = plan.monthlyPrice === 0;
            const isCurrent = plan.slug === currentPlanSlug;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-5 flex flex-col gap-4 transition-all ${meta.border} ${
                  isCurrent ? 'ring-2 ring-teal-500 ring-offset-2' : 'hover:shadow-md'
                } ${meta.popular && !isCurrent ? 'shadow-sm' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                    Current Plan
                  </div>
                )}
                {!isCurrent && meta.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-0.5 rounded-full ${meta.popular ? 'bg-teal-600' : 'bg-violet-600'}`}>
                    {meta.badge}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${meta.bg}`}>
                    <PlanIcon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-900">{plan.name}</h3>
                </div>

                <div>
                  {isFree ? (
                    <p className="text-2xl font-bold text-slate-900">Free <span className="text-sm text-slate-400 font-normal">forever</span></p>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-slate-900">
                        ₹{price.toLocaleString('en-IN')}
                        <span className="text-sm text-slate-400 font-normal">/mo</span>
                      </p>
                      {annual && (
                        <p className="text-xs text-green-600 font-medium">
                          ₹{plan.annualPrice.toLocaleString('en-IN')}/year
                        </p>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-1.5 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${meta.color}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => selectMutation.mutate({ planId: plan.id, isAnnual: annual })}
                  loading={selectMutation.isPending && selectMutation.variables?.planId === plan.id}
                  disabled={isCurrent}
                  variant={isCurrent ? 'outline' : meta.popular ? 'primary' : 'outline'}
                  className="w-full justify-center"
                >
                  {isCurrent ? (
                    <><Check className="w-3.5 h-3.5 mr-1.5" /> Current Plan</>
                  ) : isFree ? (
                    'Switch to Free'
                  ) : (
                    <>{plan.name === 'Pro' ? '⚡' : '👑'} Select {plan.name} <ArrowRight className="w-3.5 h-3.5 ml-1" /></>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {selectMutation.isError && (
          <p className="text-sm text-red-500 mt-3 text-center">Something went wrong. Please try again.</p>
        )}
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">How plan activation works</p>
          <p className="text-blue-600 leading-relaxed">
            After selecting a plan, our team will reach out via WhatsApp to complete the payment via UPI / Razorpay.
            Your plan activates instantly after payment confirmation. All paid plans include a 30-day free trial.
          </p>
        </div>
      </div>
    </div>
  );
}
