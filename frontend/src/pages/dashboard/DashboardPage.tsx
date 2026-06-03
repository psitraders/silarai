import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/auth.store';
import {
  MessageCircle, Clock, ShoppingBag, TrendingUp, TrendingDown,
  Plus, Share2, Package, Bell, Send, Users, Zap,
  ArrowRight, ChevronRight, Rocket, AlertTriangle,
  Sparkles, Brain, Star, Target, Flame, BarChart3,
  CheckCircle2, Circle, Award, RefreshCw, Store, Copy, ExternalLink,
} from 'lucide-react';
import {
  CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, XAxis, YAxis,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge, getLeadStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { analyticsApi } from '../../api/analytics.api';
import { marketingApi } from '../../api/marketing.api';
import { businessApi } from '../../api/business.api';
import { catalogApi } from '../../api/catalog.api';
import { customDomainApi } from '../../api/customDomain.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDistanceToNow } from 'date-fns';
import { OnboardingWizard } from '../../components/onboarding/OnboardingWizard';

// ── Activity icon map ──────────────────────────────────────────────────────────
const activityConfig: Record<string, { icon: any; color: string; bg: string; dot: string }> = {
  order:    { icon: ShoppingBag,   color: 'text-blue-600',   bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
  lead:     { icon: MessageCircle, color: 'text-teal-600',   bg: 'bg-teal-50',   dot: 'bg-teal-500'   },
  customer: { icon: Users,         color: 'text-violet-600', bg: 'bg-violet-50', dot: 'bg-violet-500' },
};

// ── Greeting helper ────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
}

// ── Premium KPI Card ───────────────────────────────────────────────────────────
function KpiCard({
  title, value, change, changeLabel, icon: Icon, gradient, iconBg,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${gradient}`}>
      {/* Decorative orb */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/5" />
      <div className="relative">
        <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center mb-4 ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-white text-3xl font-extrabold tracking-tight">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isPositive ? 'text-white/90' : 'text-red-200'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? '+' : ''}{change}%</span>
            {changeLabel && <span className="text-white/50 font-normal">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Insights Widget ─────────────────────────────────────────────────────────
function AiInsightsWidget({ kpis, reminders, campaigns }: { kpis: any; reminders: any[]; campaigns: any[] }) {
  const navigate = useNavigate();

  const insights = useMemo(() => {
    const list: { icon: React.ElementType; color: string; bg: string; text: string; action?: string; actionPath?: string }[] = [];

    if (reminders.length > 0) {
      list.push({
        icon: Bell, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200',
        text: `${reminders.length} lead${reminders.length > 1 ? 's' : ''} need follow-up — reach out now`,
        action: 'Follow Up', actionPath: '/marketing',
      });
    }
    if ((kpis?.lowStockProducts?.length ?? 0) > 0) {
      list.push({
        icon: AlertTriangle, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200',
        text: `${kpis.lowStockProducts.length} product${kpis.lowStockProducts.length > 1 ? 's' : ''} running low — restock before orders spike`,
        action: 'Manage Stock', actionPath: '/catalog/products',
      });
    }
    if ((kpis?.ordersThisWeekChange ?? 0) > 10) {
      list.push({
        icon: Flame, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200',
        text: `Orders up ${kpis.ordersThisWeekChange}% this week — your store is trending 🔥`,
      });
    }
    if ((kpis?.conversionRate ?? 0) < 20 && (kpis?.newInquiries ?? 0) > 5) {
      list.push({
        icon: Target, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200',
        text: 'Conversion rate is low — try an AI-generated WhatsApp message to re-engage leads',
        action: 'AI Reply', actionPath: '/ai/replies',
      });
    }
    // Only suggest campaign timing tip if the user hasn't sent any campaign yet, or list is short
    const hasSentCampaign = campaigns.some((c: any) => c.status === 'Sent');
    if (!hasSentCampaign || list.length < 3) {
      list.push({
        icon: Star, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200',
        text: hasSentCampaign
          ? 'Keep it consistent — sellers who send weekly campaigns get 3× more repeat orders'
          : 'Evenings (7–9 PM) have the highest open rates — great time to send your first campaign',
        action: hasSentCampaign ? 'New Campaign' : 'Create Campaign',
        actionPath: '/marketing/campaigns/new',
      });
    }
    if ((kpis?.newInquiries ?? 0) > 0) {
      list.push({
        icon: Brain, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200',
        text: `${kpis.newInquiries} new inquir${kpis.newInquiries > 1 ? 'ies' : 'y'} — use AI replies to respond 10× faster`,
        action: 'AI Replies', actionPath: '/ai/replies',
      });
    }

    return list.slice(0, 4);
  }, [kpis, reminders, campaigns]);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        </div>
        <span className="text-sm font-bold text-white">AI Insights</span>
        <span className="ml-auto text-[10px] text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">Live</span>
      </div>
      <div className="space-y-2.5">
        {insights.map((ins, i) => {
          const Icon = ins.icon;
          return (
            <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${ins.bg}`}>
              <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${ins.color}`} />
              <p className={`text-xs leading-snug flex-1 font-medium ${ins.color}`}>{ins.text}</p>
              {ins.action && ins.actionPath && (
                <button
                  onClick={() => navigate(ins.actionPath!)}
                  className={`text-[10px] font-bold whitespace-nowrap px-2 py-1 rounded-lg transition-colors ${ins.color} bg-white/60 hover:bg-white/80`}
                >
                  {ins.action}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Activity Timeline ──────────────────────────────────────────────────────────
function ActivityTimeline({ activity }: { activity: any[] }) {
  if (activity.length === 0) {
    return (
      <div className="text-center py-10">
        <Circle className="w-10 h-10 text-slate-100 mx-auto mb-3" />
        <p className="text-sm text-slate-400">No recent activity yet.</p>
        <p className="text-xs text-slate-300 mt-1">Your feed will come alive as orders and inquiries come in.</p>
      </div>
    );
  }
  return (
    <div className="space-y-0">
      {activity.map((item, i) => {
        const conf = activityConfig[item.type] ?? activityConfig.lead;
        const Icon = conf.icon;
        const isFirst = i === 0;
        return (
          <div key={i} className="flex gap-3 group">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className={`relative w-7 h-7 rounded-full ${conf.bg} flex items-center justify-center flex-shrink-0 mt-1 ring-2 ring-white`}>
                <Icon className={`w-3.5 h-3.5 ${conf.color}`} />
                {isFirst && <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${conf.dot} ring-2 ring-white animate-pulse`} />}
              </div>
              {i < activity.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
            </div>
            {/* Content */}
            <div className={`flex-1 pb-4 ${i === activity.length - 1 ? '' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800 leading-snug">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                </div>
                <span className="text-[10px] text-slate-300 whitespace-nowrap mt-0.5 flex-shrink-0">
                  {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const greeting = getGreeting();

  const dismissKey = useMemo(
    () => `onboarding_dismissed_${authUser?.tenantId ?? 'unknown'}`,
    [authUser?.tenantId],
  );

  const [showWizard, setShowWizard] = useState(false);
  const [wizardManuallyDismissed, setWizardManuallyDismissed] = useState(
    () => localStorage.getItem(`onboarding_dismissed_${authUser?.tenantId ?? 'unknown'}`) === 'true',
  );

  const { data: business, isSuccess: businessLoaded } = useQuery({
    queryKey: ['business'],
    queryFn: businessApi.getBusiness,
  });

  useEffect(() => {
    if (!businessLoaded) return;
    if (wizardManuallyDismissed) return;
    if (!business || !business.isOnboardingComplete) setShowWizard(true);
  }, [businessLoaded, business, wizardManuallyDismissed]);

  const handleWizardDismiss = () => {
    setShowWizard(false);
    setWizardManuallyDismissed(true);
    localStorage.setItem(dismissKey, 'true');
  };

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => analyticsApi.getKpis(7),
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: () => marketingApi.getActivityFeed(10),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => marketingApi.getReminders(2),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-count'],
    queryFn: () => catalogApi.getProducts({ page: 1, pageSize: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => marketingApi.getCampaigns(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: storefront } = useQuery({
    queryKey: ['storefront-settings'],
    queryFn: businessApi.getStorefrontSettings,
    staleTime: 5 * 60 * 1000,
  });

  const { data: customDomain } = useQuery({
    queryKey: ['custom-domain'],
    queryFn: customDomainApi.get,
    staleTime: 5 * 60 * 1000,
  });

  const [storeCopied, setStoreCopied] = useState(false);
  // Use custom domain when active, otherwise fall back to Silarai.app/slug
  const storeUrl = customDomain?.status === 'active' && customDomain.domain
    ? `https://${customDomain.domain}`
    : storefront?.slug ? `${window.location.origin}/${storefront.slug}` : null;
  const copyStoreUrl = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setStoreCopied(true);
    setTimeout(() => setStoreCopied(false), 2000);
  };

  const hasProducts = (productsData?.totalCount ?? 0) > 0;
  const hasSentCampaign = campaigns.some((c: any) => c.status === 'Sent');

  if (isLoading) return <PageLoader />;

  const firstName = authUser?.name?.split(' ')[0] ?? 'there';

  return (
    <>
      {showWizard && (
        <OnboardingWizard
          initialName={business?.name ?? authUser?.name ?? ''}
          onDismiss={handleWizardDismiss}
        />
      )}

      <div className="space-y-7">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-0.5">
              {greeting.emoji} {greeting.text}, {firstName}
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Your Business Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 mt-1">
            <Button variant="outline" size="sm" onClick={() => navigate('/marketing')}>
              <Send className="w-4 h-4" /> Campaign
            </Button>
            <Button size="sm" onClick={() => navigate('/orders/new')}>
              <Plus className="w-4 h-4" /> New Order
            </Button>
          </div>
        </div>

        {/* ── Storefront Live Banner ── */}
        {storeUrl ? (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-teal-400 mb-0.5">🟢 Your store is live</p>
              <p className="text-sm font-mono font-bold text-white truncate">{storeUrl}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={copyStoreUrl}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  storeCopied
                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Copy className="w-3.5 h-3.5" /> {storeCopied ? 'Copied!' : 'Copy'}
              </button>
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Preview
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🛍️ Check out my store!\n${storeUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </a>
            </div>
          </div>
        ) : businessLoaded && business?.name && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">Your store isn't live yet</p>
              <p className="text-xs text-amber-700 mt-0.5">Set a store URL to get a shareable link for customers.</p>
            </div>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition whitespace-nowrap"
            >
              Set Store URL <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Setup Banner ── */}
        {businessLoaded && (!business || !business.isOnboardingComplete) && wizardManuallyDismissed && (
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-teal-100">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Complete your store setup</p>
              <p className="text-xs text-teal-100 mt-0.5">Finish onboarding to start receiving orders.</p>
            </div>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-50 transition whitespace-nowrap shadow"
            >
              Continue Setup <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="New Inquiries"
            value={kpis?.newInquiries ?? 0}
            change={kpis?.newInquiriesChange}
            changeLabel="vs last 7d"
            icon={MessageCircle}
            gradient="bg-gradient-to-br from-teal-600 to-teal-500"
            iconBg="bg-white/20"
          />
          <KpiCard
            title="Pending Follow-ups"
            value={kpis?.pendingFollowUps ?? 0}
            icon={Clock}
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            iconBg="bg-white/20"
          />
          <KpiCard
            title="Orders This Week"
            value={kpis?.ordersThisWeek ?? 0}
            change={kpis?.ordersThisWeekChange}
            changeLabel="vs last week"
            icon={ShoppingBag}
            gradient="bg-gradient-to-br from-blue-600 to-blue-500"
            iconBg="bg-white/20"
          />
          <KpiCard
            title="Conversion Rate"
            value={`${kpis?.conversionRate ?? 0}%`}
            change={kpis?.conversionRateChange}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-violet-600 to-purple-500"
            iconBg="bg-white/20"
          />
        </div>

        {/* ── Low Stock Banner ── */}
        {(kpis?.lowStockProducts?.length ?? 0) > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-900">
                  {kpis!.lowStockProducts.length} product{kpis!.lowStockProducts.length > 1 ? 's' : ''} low on stock
                </p>
                <p className="text-xs text-orange-700">Restock before you miss orders</p>
              </div>
              <button
                onClick={() => navigate('/catalog/products')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {kpis!.lowStockProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/catalog/products/${p.id}`)}
                  className="flex items-center gap-2 bg-white border border-orange-200 rounded-xl px-3 py-1.5 hover:border-orange-400 transition-colors"
                >
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.title} className="w-5 h-5 rounded object-cover flex-shrink-0" />
                    : <Package className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                  <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate">{p.title}</span>
                  <span className={`text-xs font-bold ${p.stockQuantity <= 2 ? 'text-red-600' : 'text-orange-600'}`}>
                    {p.stockQuantity} left
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: 2/3 */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Insights */}
            <AiInsightsWidget kpis={kpis} reminders={reminders} campaigns={campaigns} />

            {/* Recent Inquiries */}
            <Card padding="none">
              <div className="flex items-center justify-between p-5 pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <h2 className="font-bold text-slate-900">Recent Inquiries</h2>
                </div>
                <button className="text-xs text-teal-700 font-semibold hover:underline" onClick={() => navigate('/leads')}>
                  View All →
                </button>
              </div>
              <div className="mt-4">
                {kpis?.recentLeads?.length ? (
                  <table className="w-full">
                    <thead>
                      <tr className="text-[11px] text-slate-400 border-b border-slate-50 uppercase tracking-wide">
                        <th className="text-left px-5 py-3 font-semibold">Customer</th>
                        <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Channel</th>
                        <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Product</th>
                        <th className="text-left px-5 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpis.recentLeads.map((lead: any) => (
                        <tr
                          key={lead.id}
                          className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors group"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                {lead.customerName.charAt(0)}
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-slate-900">{lead.customerName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">{lead.channel}</span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                            {lead.productTitle
                              ? <div className="flex items-center gap-2">
                                  <Package className="w-3.5 h-3.5 text-slate-300" />
                                  <span className="truncate max-w-[140px]">{lead.productTitle}</span>
                                </div>
                              : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={getLeadStatusBadge(lead.status)}>
                              {lead.status.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-5 pb-8 text-center py-10">
                    <MessageCircle className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500">No inquiries yet</p>
                    <p className="text-xs text-slate-400 mt-1">Share your store link to start receiving inquiries.</p>
                    <button
                      onClick={() => navigate('/storefront')}
                      className="mt-3 text-xs font-semibold text-teal-700 hover:underline"
                    >
                      Share my store →
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h2 className="font-bold text-slate-900">Live Activity</h2>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                    Live
                  </span>
                </div>
                <span className="text-xs text-slate-400">Last 30 days</span>
              </div>
              <ActivityTimeline activity={activity} />
            </Card>
          </div>

          {/* Right: 1/3 */}
          <div className="space-y-5">

            {/* Revenue Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Total Revenue</span>
                <span className="text-[10px] text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">This Week</span>
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">
                {formatCurrency(kpis?.totalRevenue ?? 0)}
              </p>
              {(kpis?.ordersThisWeekChange ?? 0) !== 0 && (
                <div className="flex items-center gap-1 mt-1 mb-4">
                  {(kpis?.ordersThisWeekChange ?? 0) > 0
                    ? <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                    : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-xs font-semibold ${(kpis?.ordersThisWeekChange ?? 0) > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    {(kpis?.ordersThisWeekChange ?? 0) > 0 ? '+' : ''}{kpis?.ordersThisWeekChange}% vs last week
                  </span>
                </div>
              )}
              {kpis?.salesChart && kpis.salesChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={kpis.salesChart}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(v) => formatCurrency(Number(v))}
                      contentStyle={{ borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#f1f5f9', fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#2dd4bf" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-20 flex items-center justify-center">
                  <p className="text-xs text-slate-600">No sales data yet</p>
                </div>
              )}
            </div>

            {/* Order Pipeline */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <h2 className="font-bold text-slate-900">Order Pipeline</h2>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'New',       value: kpis?.orderPipeline?.new          ?? 0, color: 'bg-blue-500',   bar: 'bg-blue-100'   },
                  { label: 'Confirmed', value: kpis?.orderPipeline?.confirmed     ?? 0, color: 'bg-violet-500', bar: 'bg-violet-100' },
                  { label: 'Pending',   value: kpis?.orderPipeline?.paymentPending ?? 0, color: 'bg-amber-500',  bar: 'bg-amber-100'  },
                  { label: 'Paid',      value: kpis?.orderPipeline?.paid          ?? 0, color: 'bg-green-500',  bar: 'bg-green-100'  },
                  { label: 'Delivered', value: kpis?.orderPipeline?.delivered     ?? 0, color: 'bg-teal-600',   bar: 'bg-teal-50'    },
                ].map(({ label, value, color, bar }) => {
                  const total = Object.values(kpis?.orderPipeline ?? {}).reduce((s: number, v) => s + (v as number), 0) || 1;
                  const pct = Math.round((value / total) * 100);
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-16 flex-shrink-0">{label}</span>
                      <div className={`flex-1 h-2 rounded-full ${bar}`}>
                        <div
                          className={`h-2 rounded-full ${color} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-5 text-right">{value}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Follow-up Alert */}
            {reminders.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-900">
                    {reminders.length} follow-up{reminders.length > 1 ? 's' : ''} needed
                  </span>
                </div>
                <div className="space-y-2">
                  {reminders.slice(0, 2).map((r: any) => (
                    <div key={r.leadId} className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-2">
                      <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-[10px] font-bold text-amber-800">
                        {r.customerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{r.customerName}</p>
                        <p className="text-[10px] text-slate-500">{r.daysSinceActivity}d no response</p>
                      </div>
                      {r.phone && (
                        <a
                          href={`https://wa.me/${r.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hi! Just following up 😊')}`}
                          target="_blank" rel="noreferrer"
                          className="text-[10px] font-bold text-white bg-green-600 px-2 py-1 rounded-lg hover:bg-green-700 transition"
                        >
                          Chat
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <h2 className="font-bold text-slate-900">Quick Actions</h2>
              </div>
              <div className="space-y-1.5">
                {[
                  { icon: Plus,        label: 'Add Product',       path: '/catalog/products/new',      color: 'bg-teal-500',   lightBg: 'bg-teal-50'   },
                  { icon: Send,        label: 'Create Campaign',   path: '/marketing/campaigns/new',   color: 'bg-green-500',  lightBg: 'bg-green-50'  },
                  { icon: Package,     label: 'New Order',         path: '/orders/new',                color: 'bg-blue-500',   lightBg: 'bg-blue-50'   },
                  { icon: Zap,         label: 'AI Social Post',    path: '/ai/social-post',            color: 'bg-violet-500', lightBg: 'bg-violet-50' },
                  { icon: Share2,      label: 'Share My Store',    path: '/storefront',                color: 'bg-amber-500',  lightBg: 'bg-amber-50'  },
                  { icon: Users,       label: 'View Customers',    path: '/customers',                 color: 'bg-rose-500',   lightBg: 'bg-rose-50'   },
                ].map(({ icon: Icon, label, path, color, lightBg }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-all group"
                  >
                    <div className={`w-8 h-8 ${lightBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4`} style={{ color: color.replace('bg-', '').includes('teal') ? '#0d9488' : color.replace('bg-', '').includes('green') ? '#16a34a' : color.replace('bg-', '').includes('blue') ? '#2563eb' : color.replace('bg-', '').includes('violet') ? '#7c3aed' : color.replace('bg-', '').includes('amber') ? '#d97706' : '#e11d48' }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Top Products */}
            {(kpis?.topProducts?.length ?? 0) > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <h2 className="font-bold text-slate-900">Top Products</h2>
                </div>
                <div className="space-y-2">
                  {kpis!.topProducts.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate(`/catalog/products/${p.id}`)}>
                      <span className="text-xs font-extrabold text-slate-300 w-5 text-center flex-shrink-0">#{i + 1}</span>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0"><Package className="w-4 h-4 text-slate-300" /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.title}</p>
                      </div>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full flex-shrink-0">{p.orderCount} orders</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Repeat Customer Rate */}
            {(kpis?.totalCustomers ?? 0) > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <h2 className="font-bold text-slate-900">Customer Loyalty</h2>
                </div>
                <div className="text-center py-2">
                  <p className="text-4xl font-extrabold text-indigo-600">{kpis!.repeatCustomerRate}%</p>
                  <p className="text-xs text-slate-500 mt-1">repeat customer rate</p>
                  <p className="text-xs text-slate-400 mt-0.5">{kpis!.repeatCustomers} of {kpis!.totalCustomers} customers reordered</p>
                </div>
                <div className="mt-3 h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${kpis!.repeatCustomerRate}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">
                  {kpis!.repeatCustomerRate >= 30
                    ? '🌟 Excellent loyalty — keep it up!'
                    : kpis!.repeatCustomerRate >= 15
                    ? '💪 Good — target 30%+ with campaigns'
                    : '📣 Low — send a win-back campaign'}
                </p>
              </Card>
            )}

            {/* Store Readiness */}
            {businessLoaded && business && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <h2 className="font-bold text-slate-900">Store Readiness</h2>
                </div>
                {(() => {
                  const checks = [
                    { label: 'Business profile set up', done: !!business?.name },
                    { label: 'WhatsApp number added', done: !!business?.whatsAppNumber },
                    { label: 'Products added', done: hasProducts },
                    { label: 'Store URL customised', done: business?.isOnboardingComplete ?? false },
                    { label: 'First campaign sent', done: hasSentCampaign },
                  ];
                  const done = checks.filter(c => c.done).length;
                  const pct = Math.round((done / checks.length) * 100);
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">{done}/{checks.length} complete</span>
                        <span className="text-sm font-extrabold text-teal-700">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full mb-4">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="space-y-2">
                        {checks.map(c => (
                          <div key={c.label} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${c.done ? 'bg-teal-500' : 'bg-slate-100'}`}>
                              {c.done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className={`text-xs ${c.done ? 'text-slate-500 line-through' : 'text-slate-700 font-medium'}`}>
                              {c.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

