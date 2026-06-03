import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformLeadsApi, type PlatformLeadDto } from '../../api/platformLeads.api';
import {
  Users, Mail, Phone, Search, CheckCircle,
  MessageCircle, TrendingUp, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';

const STATUS_OPTIONS = ['new', 'contacted', 'converted', 'closed'];

const STATUS_STYLES: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  converted: 'bg-green-100 text-green-700',
  closed:    'bg-slate-100 text-slate-500',
};

export function PlatformLeadsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<PlatformLeadDto | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const PAGE_SIZE = 20;

  const { data: summary } = useQuery({
    queryKey: ['platform-leads-summary'],
    queryFn: () => platformLeadsApi.getSummary(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['platform-leads', page, search, statusFilter],
    queryFn: () => platformLeadsApi.getAll({ page, pageSize: PAGE_SIZE, search: search || undefined, status: statusFilter || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      platformLeadsApi.update(id, status, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-leads'] });
      qc.invalidateQueries({ queryKey: ['platform-leads-summary'] });
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => platformLeadsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-leads'] });
      qc.invalidateQueries({ queryKey: ['platform-leads-summary'] });
      setSelected(null);
    },
  });

  const openDetail = (lead: PlatformLeadDto) => {
    setSelected(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.adminNotes ?? '');
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Platform Leads</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads',  value: summary?.total     ?? 0, icon: Users,         color: 'text-slate-700 bg-slate-50' },
          { label: 'New',          value: summary?.newLeads  ?? 0, icon: MessageCircle,  color: 'text-blue-700 bg-blue-50' },
          { label: 'Contacted',    value: summary?.contacted ?? 0, icon: Mail,           color: 'text-amber-700 bg-amber-50' },
          { label: 'Converted',    value: summary?.converted ?? 0, icon: TrendingUp,     color: 'text-green-700 bg-green-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, phone…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Name</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Contact</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Business</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Source</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : !data?.items.length ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No leads yet. They'll appear here once visitors chat on the landing page.</td></tr>
              ) : data.items.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => openDetail(lead)}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-900">{lead.name}</td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <div>{lead.email}</div>
                    {lead.phone && <div className="text-xs text-slate-400">{lead.phone}</div>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-700 capitalize">{lead.businessType ?? '—'}</div>
                    {lead.productCount && <div className="text-xs text-slate-400">{lead.productCount} products</div>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{lead.source}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[lead.status] ?? STATUS_STYLES.new}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto p-6 space-y-5 flex flex-col"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {selected.phone && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                  <p className="font-medium">{selected.phone}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Business Type</p>
                <p className="font-medium capitalize">{selected.businessType ?? '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Products</p>
                <p className="font-medium">{selected.productCount ?? '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Source</p>
                <p className="font-medium capitalize">{selected.source}</p>
              </div>
              {selected.utmSource && (
                <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-slate-400 mb-0.5">UTM</p>
                  <p className="font-medium text-xs">{[selected.utmSource, selected.utmMedium, selected.utmCampaign].filter(Boolean).join(' / ')}</p>
                </div>
              )}
            </div>

            {selected.message && (
              <div className="bg-slate-50 rounded-xl p-3 text-sm">
                <p className="text-xs text-slate-400 mb-1">Message</p>
                <p className="text-slate-700">{selected.message}</p>
              </div>
            )}

            {/* Update status */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Update Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setEditStatus(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all capitalize ${
                      editStatus === s ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Add internal notes…"
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
              <button
                onClick={() => updateMutation.mutate({ id: selected.id, status: editStatus, notes: editNotes })}
                disabled={updateMutation.isPending}
                className="w-full bg-teal-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-teal-600 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>

            <button
              onClick={() => { if (confirm('Delete this lead?')) deleteMutation.mutate(selected.id); }}
              className="mt-auto flex items-center gap-2 text-sm text-red-500 hover:text-red-600 justify-center py-2"
            >
              <Trash2 className="w-4 h-4" /> Delete lead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
