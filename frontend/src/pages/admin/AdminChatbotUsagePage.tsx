import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, Bot, ChevronDown, ChevronRight, MessagesSquare } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';
import { fmtTokens } from '../chatbot/ChatbotUsagePage';

interface TenantClientUsage {
  clientId: string;
  clientName: string;
  calls: number;
  totalTokens: number;
}

interface TenantUsage {
  tenantId: string | null;
  tenantName: string;
  calls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  clients: TenantClientUsage[];
}

interface PlatformUsage {
  days: number;
  since: string;
  totalCalls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  perTenant: TenantUsage[];
  daily: { date: string; calls: number; totalTokens: number }[];
}

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export function AdminChatbotUsagePage() {
  const [days, setDays] = useState(30);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PlatformUsage>({
    queryKey: ['admin-chatbot-usage', days],
    queryFn: () => apiClient.get('/chatbot-usage/admin', { params: { days } }).then(r => r.data),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-7 h-7 text-teal-600" /> Token Usage by Tenant
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            AI tokens consumed through chatbot clients across the platform
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                days === r.days ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total tokens', value: fmtTokens(data?.totalTokens ?? 0) },
          { label: 'Prompt tokens', value: fmtTokens(data?.promptTokens ?? 0) },
          { label: 'Completion tokens', value: fmtTokens(data?.completionTokens ?? 0) },
          { label: 'AI calls', value: (data?.totalCalls ?? 0).toLocaleString() },
        ].map(({ label, value }) => (
          <Card key={label}>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Daily platform chart */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-4">Daily consumption (all tenants)</h2>
        {(data?.daily?.length ?? 0) === 0 ? (
          <div className="text-center py-10">
            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No AI usage recorded in this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data!.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={fmtTokens} />
              <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
              <Bar dataKey="totalTokens" name="Tokens" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Per-tenant table with expandable client breakdown */}
      <Card className="overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-sm">Consumption by tenant</h2>
        </div>
        {(data?.perTenant?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No usage in this period</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">Tenant</th>
                <th className="text-right px-4 py-3 text-slate-600 font-semibold">Calls</th>
                <th className="text-right px-4 py-3 text-slate-600 font-semibold">Prompt</th>
                <th className="text-right px-4 py-3 text-slate-600 font-semibold">Completion</th>
                <th className="text-right px-4 py-3 text-slate-600 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data!.perTenant.map(t => {
                const key = t.tenantId ?? 'platform';
                const isOpen = expanded === key;
                return (
                  <Fragment key={key}>
                    <tr
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(isOpen ? null : key)}
                    >
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 font-semibold text-slate-900">
                          {isOpen
                            ? <ChevronDown className="w-4 h-4 text-slate-400" />
                            : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          {t.tenantName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{t.calls.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{fmtTokens(t.promptTokens)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{fmtTokens(t.completionTokens)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">{fmtTokens(t.totalTokens)}</td>
                    </tr>
                    {isOpen && t.clients.map(c => (
                      <tr key={c.clientId} className="bg-slate-50/60">
                        <td className="px-4 py-2 pl-12 text-slate-600 flex items-center gap-2">
                          <MessagesSquare className="w-3.5 h-3.5 text-slate-400" />
                          {c.clientName}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-500">{c.calls.toLocaleString()}</td>
                        <td className="px-4 py-2" colSpan={2} />
                        <td className="px-4 py-2 text-right font-medium text-slate-700">{fmtTokens(c.totalTokens)}</td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
