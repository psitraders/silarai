import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/auth.store';
import {
  MessageCircle, Clock, ShoppingBag, TrendingUp,
  Plus, Share2, Package, Bell, Send, Users, Zap,
  ArrowRight, ChevronRight, Rocket, AlertTriangle,
} from 'lucide-react';
import {
  CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, XAxis, YAxis,
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge, getLeadStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { analyticsApi } from '../../api/analytics.api';
import { marketingApi } from '../../api/marketing.api';
import { businessApi } from '../../api/business.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDistanceToNow } from 'date-fns';
import { OnboardingWizard } from '../../components/onboarding/OnboardingWizard';

const activityIcon: Record<string, { icon: any; color: string; bg: string }> = {
  order: { icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
  lead: { icon: MessageCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
  customer: { icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();

  // Scope the dismiss flag per-tenant so it doesn't bleed across accounts
  const dismissKey = useMemo(
    () => `onboarding_dismissed_${authUser?.tenantId ?? 'unknown'}`,
    [authUser?.tenantId]
  );

  // Onboarding wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardManuallyDismissed, setWizardManuallyDismissed] = useState(
    () => localStorage.getItem(`onboarding_dismissed_${authUser?.tenantId ?? 'unknown'}`) === 'true'
  );

  const { data: business, isSuccess: businessLoaded } = useQuery({
    queryKey: ['business'],
    queryFn: businessApi.getBusiness,
  });

  // Show wizard when:
  //  - query has finished loading (isSuccess)
  //  - AND business is null (brand-new tenant, no record yet) OR isOnboardingComplete is false
  //  - AND user hasn't explicitly dismissed for this tenant
  useEffect(() => {
    if (!businessLoaded) return;
    if (wizardManuallyDismissed) return;
    if (!business || !business.isOnboardingComplete) {
      setShowWizard(true);
    }
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
    queryFn: () => marketingApi.getActivityFeed(12),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => marketingApi.getReminders(2),
  });

  if (isLoading) return <PageLoader />;

  return (
    <>
    {/* Onboarding Wizard */}
    {showWizard && (
      <OnboardingWizard
        initialName={business?.name ?? authUser?.name ?? ''}
        onDismiss={handleWizardDismiss}
      />
    )}

    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Here's what's happening with your business today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/marketing')}>
            <Send className="w-4 h-4" /> Marketing
          </Button>
          <Button size="sm" onClick={() => navigate('/orders/new')}>
            <Plus className="w-4 h-4" /> Create Order
          </Button>
        </div>
      </div>

      {/* Setup progress banner — shown if onboarding not done and wizard was dismissed */}
      {businessLoaded && (!business || !business.isOnboardingComplete) && wizardManuallyDismissed && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-teal-900">Complete your store setup</p>
            <p className="text-xs text-teal-700 mt-0.5">Finish onboarding to start receiving orders from your storefront.</p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition whitespace-nowrap"
          >
            Continue Setup <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Inquiries"
          value={kpis?.newInquiries ?? 0}
          change={kpis?.newInquiriesChange}
          changeLabel="vs last 7 days"
          icon={<MessageCircle className="w-5 h-5 text-teal-700" />}
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Pending Follow-ups"
          value={kpis?.pendingFollowUps ?? 0}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Orders This Week"
          value={kpis?.ordersThisWeek ?? 0}
          change={kpis?.ordersThisWeekChange}
          changeLabel="vs last week"
          icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Conversion Rate"
          value={`${kpis?.conversionRate ?? 0}%`}
          change={kpis?.conversionRateChange}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-50"
        />
      </div>

      {/* Follow-up Reminders Banner */}
      {reminders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              {reminders.length} lead{reminders.length > 1 ? 's' : ''} need{reminders.length === 1 ? 's' : ''} follow-up
            </p>
            <p className="text-xs text-amber-700">
              {reminders.slice(0, 2).map(r => r.customerName).join(', ')}
              {reminders.length > 2 ? ` and ${reminders.length - 2} more` : ''} · no response in 2+ days
            </p>
          </div>
          <button
            onClick={() => navigate('/marketing')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors"
          >
            Follow Up <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Low Stock Alert Banner */}
      {(kpis?.lowStockProducts?.length ?? 0) > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900">
                {kpis!.lowStockProducts.length} product{kpis!.lowStockProducts.length > 1 ? 's' : ''} running low on stock
              </p>
              <p className="text-xs text-orange-700">Restock soon to avoid missing orders</p>
            </div>
            <button
              onClick={() => navigate('/catalog/products')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap"
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
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} className="w-5 h-5 rounded object-cover flex-shrink-0" />
                ) : (
                  <Package className="w-4 h-4 text-orange-400 flex-shrink-0" />
                )}
                <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">{p.title}</span>
                <span className={`text-xs font-bold ml-1 ${p.stockQuantity <= 2 ? 'text-red-600' : 'text-orange-600'}`}>
                  {p.stockQuantity} left
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Inquiries + Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Inquiries */}
          <Card padding="none">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="font-semibold text-slate-900">Recent Inquiries</h2>
              <button className="text-sm text-teal-700 font-medium hover:underline" onClick={() => navigate('/leads')}>
                View All
              </button>
            </div>
            <div className="mt-4">
              {kpis?.recentLeads?.length ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-50">
                      <th className="text-left px-6 py-3 font-medium">Customer</th>
                      <th className="text-left px-6 py-3 font-medium hidden sm:table-cell">Channel</th>
                      <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Product</th>
                      <th className="text-left px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.recentLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate(`/leads/${lead.id}`)}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-700">
                              {lead.customerName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-900">{lead.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 hidden sm:table-cell">
                          <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-lg">{lead.channel}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600 hidden md:table-cell">{lead.productTitle ?? '—'}</td>
                        <td className="px-6 py-3">
                          <Badge variant={getLeadStatusBadge(lead.status)}>{lead.status.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 pb-6 text-center text-sm text-slate-400 py-8">No inquiries yet. Share your store link to get started!</div>
              )}
            </div>
          </Card>

          {/* Activity Feed */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recent Activity</h2>
              <span className="text-xs text-slate-400">Last 30 days</span>
            </div>
            {activity.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">No recent activity</div>
            ) : (
              <div className="space-y-1">
                {activity.map((item, i) => {
                  const conf = activityIcon[item.type] ?? activityIcon.lead;
                  const Icon = conf.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg ${conf.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${conf.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0 hidden sm:block">
                        {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Sales Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Sales Overview</h2>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">This Week</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(kpis?.totalRevenue ?? 0)}</p>
            <p className="text-xs text-green-600 mt-0.5 mb-4">Total Revenue</p>
            {kpis?.salesChart && kpis.salesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={kpis.salesChart}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="amount" stroke="#0f766e" fill="url(#revenueGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-slate-400">No sales data yet</div>
            )}
          </Card>

          {/* Order Pipeline */}
          <Card>
            <h2 className="font-semibold text-slate-900 mb-4">Order Pipeline</h2>
            <div className="grid grid-cols-5 gap-1 text-center">
              {[
                { label: 'New', value: kpis?.orderPipeline?.new ?? 0, color: 'text-blue-600' },
                { label: 'Confirmed', value: kpis?.orderPipeline?.confirmed ?? 0, color: 'text-purple-600' },
                { label: 'Pending', value: kpis?.orderPipeline?.paymentPending ?? 0, color: 'text-amber-600' },
                { label: 'Paid', value: kpis?.orderPipeline?.paid ?? 0, color: 'text-green-600' },
                { label: 'Done', value: kpis?.orderPipeline?.delivered ?? 0, color: 'text-teal-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-2">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h2 className="font-semibold text-slate-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { icon: Plus, label: 'Add Product', path: '/catalog/products/new', color: 'bg-teal-100 text-teal-700' },
                { icon: Send, label: 'Create Campaign', path: '/marketing/campaigns/new', color: 'bg-green-100 text-green-700' },
                { icon: Package, label: 'Create Order', path: '/orders/new', color: 'bg-blue-100 text-blue-700' },
                { icon: Zap, label: 'AI Social Post', path: '/ai/social-post', color: 'bg-violet-100 text-violet-700' },
                { icon: Share2, label: 'Share Store', path: '/storefront', color: 'bg-amber-100 text-amber-700' },
              ].map(({ icon: Icon, label, path, color }) => (
                <button key={label} onClick={() => navigate(path)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group">
                  <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
