import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { PageLoader } from '../../components/ui/Spinner';
import { analyticsApi } from '../../api/analytics.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { TrendingUp, ShoppingBag, MessageCircle, Users } from 'lucide-react';

const COLORS = ['#0f766e', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-kpis'],
    queryFn: () => analyticsApi.getKpis(30),
  });

  if (isLoading) return <PageLoader />;

  const pipelineData = [
    { name: 'New', value: data?.orderPipeline?.new ?? 0 },
    { name: 'Confirmed', value: data?.orderPipeline?.confirmed ?? 0 },
    { name: 'Paid', value: data?.orderPipeline?.paid ?? 0 },
    { name: 'Delivered', value: data?.orderPipeline?.delivered ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Business insights for the last 30 days.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(data?.totalRevenue ?? 0)}
          icon={<TrendingUp className="w-5 h-5 text-teal-700" />} iconBg="bg-teal-50" />
        <StatCard title="Total Leads" value={data?.newInquiries ?? 0}
          icon={<MessageCircle className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-50" />
        <StatCard title="Orders" value={data?.ordersThisWeek ?? 0}
          icon={<ShoppingBag className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" />
        <StatCard title="Conversion Rate" value={`${data?.conversionRate ?? 0}%`}
          icon={<Users className="w-5 h-5 text-green-600" />} iconBg="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.salesChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}K`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="amount" stroke="#0f766e" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Order Pipeline</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {pipelineData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Top Products</h2>
          {data?.topProducts?.length ? (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-700">
                    {i + 1}
                  </div>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.title}</p>
                    <p className="text-xs text-slate-400">{p.orderCount} orders</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-24 overflow-hidden">
                    <div
                      className="h-full bg-teal-700 rounded-full"
                      style={{ width: `${(p.orderCount / (data.topProducts[0]?.orderCount || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No product data yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
