import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronUp, Send, Package
} from 'lucide-react';
import { b2bApi } from '../../api/b2b.api';
import type { QuoteDto } from '../../api/b2b.api';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending:  <Clock className="w-4 h-4 text-yellow-500" />,
  Replied:  <CheckCircle2 className="w-4 h-4 text-green-500" />,
  Closed:   <XCircle className="w-4 h-4 text-slate-400" />,
};

export function B2BDashboardPage() {
  const qc = useQueryClient();
  const quotesQ = useQuery({ queryKey: ['b2b-quotes'], queryFn: () => b2bApi.getQuotes() });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyStatus, setReplyStatus] = useState<Record<string, string>>({});

  const replyMutation = useMutation({
    mutationFn: ({ id, reply, status }: { id: string; reply: string; status: string }) =>
      b2bApi.replyToQuote(id, reply, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['b2b-quotes'] }),
  });

  const pending   = quotesQ.data?.filter(q => q.status === 'Pending').length ?? 0;
  const total     = quotesQ.data?.length ?? 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">B2B Quote Inbox</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage bulk/wholesale quote requests from business buyers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Quotes" value={total} icon={FileText} color="blue" />
        <StatCard label="Pending" value={pending} icon={Clock} color="yellow" />
        <StatCard label="Replied" value={total - pending} icon={CheckCircle2} color="green" />
      </div>

      {/* Quote list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Quote Requests</h2>
        </div>

        {quotesQ.isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading quotes…</div>
        ) : !quotesQ.data?.length ? (
          <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
            <Package className="w-10 h-10 text-slate-200" />
            <p className="text-sm">No quote requests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {quotesQ.data.map((q: QuoteDto) => {
              const isOpen = expanded === q.id;
              const items = tryParseItems(q.itemsJson);

              return (
                <div key={q.id} className="px-5 py-4">
                  <div className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : q.id)}>
                    <div className="flex items-center gap-3">
                      {STATUS_ICON[q.status]}
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{q.contactName}</p>
                        <p className="text-xs text-slate-500">{q.contactEmail}
                          {q.companyName && ` · ${q.companyName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        q.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        q.status === 'Replied' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>{q.status}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> :
                                <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 space-y-4">
                      {/* Items */}
                      {items.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Items Requested</p>
                          {items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span>{item.title ?? item.productId} × {item.qty}</span>
                              <span className="text-slate-500">{formatCurrency(item.unitPrice * item.qty, 'INR')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.notes && (
                        <div className="bg-blue-50 rounded-xl px-3 py-2 text-sm text-blue-800">
                          <span className="font-medium">Note: </span>{q.notes}
                        </div>
                      )}

                      {/* Existing reply */}
                      {q.merchantReply && (
                        <div className="bg-green-50 rounded-xl px-3 py-2 text-sm text-green-800">
                          <p className="font-medium mb-1">Your reply:</p>
                          <p>{q.merchantReply}</p>
                        </div>
                      )}

                      {/* Reply form */}
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          placeholder="Type your reply / custom quote…"
                          value={replyText[q.id] ?? ''}
                          onChange={e => setReplyText(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <select
                            value={replyStatus[q.id] ?? 'Replied'}
                            onChange={e => setReplyStatus(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                          >
                            <option value="Replied">Replied</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <button
                            disabled={!replyText[q.id]?.trim() || replyMutation.isPending}
                            onClick={() => replyMutation.mutate({
                              id: q.id,
                              reply: replyText[q.id],
                              status: replyStatus[q.id] ?? 'Replied',
                            })}
                            className="flex items-center gap-1.5 bg-teal-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  const colorMap: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green:  'bg-green-50 text-green-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function tryParseItems(json: string): any[] {
  try { return JSON.parse(json); } catch { return []; }
}
