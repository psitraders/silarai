import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, Bot, MessagesSquare, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';

interface UsagePerClient {
  clientId: string;
  clientName: string;
  calls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface UsagePerChannel {
  channel: string;
  calls: number;
  totalTokens: number;
}

interface UsageDaily {
  date: string;
  calls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface UsageSummary {
  days: number;
  since: string;
  totalCalls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  perClient: UsagePerClient[];
  perChannel: UsagePerChannel[];
  daily: UsageDaily[];
}

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const CHANNEL_LABELS: Record<string, string> = {
  web: 'Website widget',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

export function ChatbotUsagePage() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery<UsageSummary>({
    queryKey: ['chatbot-usage', days],
    queryFn: () => apiClient.get('/chatbot-usage', { params: { days } }).then(r => r.data),
  });

  if (isLoading) return <PageLoader />;

  const stats = [
    { icon: Coins,            label: 'Total tokens',      value: fmtTokens(data?.totalTokens ?? 0),      accent: 'bg-teal-50 text-teal-600' },
    { icon: ArrowDownToLine,  label: 'Prompt tokens',     value: fmtTokens(data?.promptTokens ?? 0),     accent: 'bg-blue-50 text-blue-600' },
    { icon: ArrowUpFromLine,  label: 'Completion tokens', value: fmtTokens(data?.completionTokens ?? 0), accent: 'bg-violet-50 text-violet-600' },
    { icon: MessagesSquare,   label: 'AI calls',          value: (data?.totalCalls ?? 0).toLocaleString(), accent: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-7 h-7 text-teal-600" /> Token Usage
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            AI tokens consumed by your chatbot across all channels
          </p>
        </div>

        {/* Range selector */}
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, accent }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Daily chart */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-4">Daily consumption</h2>
        {(data?.daily?.length ?? 0) === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No AI usage recorded yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Token tracking starts as soon as your chatbot answers its first message.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data!.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={fmtTokens} />
              <Tooltip formatter={(v, name) => [Number(v ?? 0).toLocaleString(), String(name)]} />
              <Bar dataKey="promptTokens" name="Prompt" stackId="t" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="completionTokens" name="Completion" stackId="t" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Per-client breakdown */}
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm">By chatbot client</h2>
          </div>
          {(data?.perClient?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No chatbot clients yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-2.5 text-slate-600 font-semibold text-xs">Client</th>
                  <th className="text-right px-4 py-2.5 text-slate-600 font-semibold text-xs">Calls</th>
                  <th className="text-right px-4 py-2.5 text-slate-600 font-semibold text-xs">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data!.perClient.map(c => (
                  <tr key={c.clientId}>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{c.clientName}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{c.calls.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{fmtTokens(c.totalTokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Per-channel breakdown */}
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm">By channel</h2>
          </div>
          {(data?.perChannel?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No usage yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-2.5 text-slate-600 font-semibold text-xs">Channel</th>
                  <th className="text-right px-4 py-2.5 text-slate-600 font-semibold text-xs">Calls</th>
                  <th className="text-right px-4 py-2.5 text-slate-600 font-semibold text-xs">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data!.perChannel.map(c => (
                  <tr key={c.channel}>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {CHANNEL_LABELS[c.channel] ?? c.channel}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{c.calls.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{fmtTokens(c.totalTokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
