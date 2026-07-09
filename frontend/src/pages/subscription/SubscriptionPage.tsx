import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck, Calendar, AlertCircle, Sparkles, Package, Users, Bot,
  BarChart2, Palette, MessageCircle, Mail, Headset,
} from 'lucide-react';
import apiClient from '../../api/client';
import { PageLoader } from '../../components/ui/Spinner';

// Plan changes are handled by the Silarai team — no self-service checkout.
const SUPPORT_WHATSAPP = 'https://wa.me/918849549690?text=' +
  encodeURIComponent("Hi! I'd like to change my Silarai plan.");
const SUPPORT_EMAIL = 'mailto:support@silarai.app?subject=' +
  encodeURIComponent('Silarai plan change request');

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

interface PendingRequest {
  id: string;
  planName: string;
  planSlug: string;
  isAnnual: boolean;
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
  pendingRequest?: PendingRequest;
}

function fmt(n: number) {
  if (n >= 2147483647) return '∞';
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function SubscriptionPage() {
  const { data: sub, isLoading: subLoading } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: () => apiClient.get('/subscription').then(r => r.data),
  });

  if (subLoading) return <PageLoader />;

  const pendingRequest = sub?.pendingRequest;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscription & Plans</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your plan, view usage, and upgrade when you're ready.</p>
      </div>

      {/* Pending request banner */}
      {pendingRequest && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">
              {pendingRequest.planName} plan — awaiting admin approval
            </p>
            <p className="text-amber-700 text-sm mt-0.5">
              Your upgrade request is being reviewed. We'll activate it shortly and notify you.
            </p>
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
                  ? `Trial ends ${new Date(sub.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} (${sub.daysRemaining} days left)`
                  : `Renews ${new Date(sub.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`}
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

      {/* Change plan — handled by the Silarai team */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <Headset className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Want to change your plan?</h2>
            <p className="text-sm text-slate-500">
              Contact the Silarai team — we'll recommend the right plan and activate it for you.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <a
            href={SUPPORT_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
          </a>
          <a
            href={SUPPORT_EMAIL}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Mail className="w-4 h-4" /> Email support
          </a>
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">How plan activation works</p>
          <p className="text-blue-600 leading-relaxed">
            Reach out on WhatsApp or email, complete the payment via UPI / Razorpay,
            and our team activates your plan instantly after confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
