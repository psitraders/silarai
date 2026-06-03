import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, MessageCircle, ChevronRight, Plus,
  Download, Upload, GitMerge, X, Tag, Sparkles, CheckCircle2,
  Building2, ShieldCheck, Clock, ShieldOff,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  customersApi,
  type CustomerDto,
  type SaveCustomerDto,
  type B2BCustomerDto,
} from '../../api/customers.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { generateWhatsAppLink } from '../../utils/whatsappLink';

// ── Customer form modal ───────────────────────────────────────────────────────

interface CustomerFormProps {
  initial?: Partial<SaveCustomerDto>;
  onSave: (data: SaveCustomerDto) => void;
  onClose: () => void;
  loading: boolean;
  title: string;
}

function CustomerFormModal({ initial, onSave, onClose, loading, title }: CustomerFormProps) {
  const [form, setForm] = useState<SaveCustomerDto>({
    name: initial?.name ?? '',
    phoneNumber: initial?.phoneNumber ?? '',
    email: initial?.email ?? '',
    address: initial?.address ?? '',
    city: initial?.city ?? '',
    tags: initial?.tags ?? '',
    notes: initial?.notes ?? '',
  });

  const set = (k: keyof SaveCustomerDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Full name"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Phone *</label>
              <input value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+91 98765 43210"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
            <input value={form.email} onChange={set('email')} placeholder="customer@email.com" type="email"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Address</label>
              <input value={form.address} onChange={set('address')} placeholder="Street / area"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">City</label>
              <input value={form.city} onChange={set('city')} placeholder="Mumbai"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Tags <span className="text-slate-400 font-normal">(comma-separated)</span></label>
            <input value={form.tags} onChange={set('tags')} placeholder="vip, loyal, wholesale"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} placeholder="Internal notes about this customer…" rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} loading={loading} disabled={!form.name.trim() || !form.phoneNumber.trim()}>
            Save Customer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = 'all' | 'b2b' | 'duplicates';

export function CustomersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab]         = useState<Tab>('all');
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; updated: number; skipped: number } | null>(null);
  const [mergeResult, setMergeResult] = useState<{ groupsMerged: number; customersMerged: number } | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search, tagFilter],
    queryFn: () => customersApi.getAll({ page, pageSize: 20, search: search || undefined, tag: tagFilter || undefined }),
    enabled: tab === 'all',
  });

  const { data: duplicates = [], isLoading: dupsLoading } = useQuery({
    queryKey: ['customer-duplicates'],
    queryFn: customersApi.getDuplicates,
    enabled: tab === 'duplicates',
  });

  const { data: b2bCustomers = [], isLoading: b2bLoading } = useQuery({
    queryKey: ['b2b-customers'],
    queryFn: customersApi.getB2BCustomers,
    enabled: tab === 'b2b',
  });

  // Collect all distinct tags from current page for the filter chips
  const allTags = Array.from(new Set(
    (data?.items ?? []).flatMap(c => (c as any).tags
      ? (c as any).tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [])
  ));

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setShowNew(false); },
  });

  const mergeMutation = useMutation({
    mutationFn: ({ targetId, sourceId }: { targetId: string; sourceId: string }) =>
      customersApi.merge(targetId, sourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer-duplicates', 'customers'] }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      customersApi.approveB2BCustomer(id, approve),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['b2b-customers'] }),
  });

  const importMutation = useMutation({
    mutationFn: customersApi.importCsv,
    onSuccess: (result) => { setImportResult(result); qc.invalidateQueries({ queryKey: ['customers'] }); },
  });

  const smartMergeMutation = useMutation({
    mutationFn: customersApi.smartMerge,
    onSuccess: (result) => {
      setMergeResult(result);
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customer-duplicates'] });
    },
  });

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    const blob = await customersApi.exportCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `customers-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importMutation.mutate(file);
    e.target.value = '';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data?.totalCount ?? 0} total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1.5" />
            {importMutation.isPending ? 'Importing…' : 'Import CSV'}
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
          <Button
            variant="outline" size="sm"
            onClick={() => { setMergeResult(null); smartMergeMutation.mutate(); }}
            loading={smartMergeMutation.isPending}
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-purple-500" />
            {smartMergeMutation.isPending ? 'Merging…' : 'AI Smart Merge'}
          </Button>
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> New Customer
          </Button>
        </div>
      </div>

      {/* Import result toast */}
      {importResult && (
        <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-sm text-green-700">
          <span>✓ Import complete — {importResult.created} created, {importResult.updated} updated, {importResult.skipped} skipped</span>
          <button onClick={() => setImportResult(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Smart Merge result toast */}
      {mergeResult && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 text-sm text-purple-700">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {mergeResult.groupsMerged === 0
              ? 'No duplicates found — your customer list is clean!'
              : `AI merged ${mergeResult.customersMerged} duplicate${mergeResult.customersMerged !== 1 ? 's' : ''} across ${mergeResult.groupsMerged} group${mergeResult.groupsMerged !== 1 ? 's' : ''}`}
          </span>
          <button onClick={() => setMergeResult(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Smart Merge error toast */}
      {smartMergeMutation.isError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-700">
          <span>Smart merge failed — please try again.</span>
          <button onClick={() => smartMergeMutation.reset()}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          All Customers
        </button>
        <button onClick={() => setTab('b2b')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'b2b' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Building2 className="w-3.5 h-3.5" />
          B2B Customers
          {b2bCustomers.filter(c => !c.isB2BApproved).length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {b2bCustomers.filter(c => !c.isB2BApproved).length}
            </span>
          )}
        </button>
        <button onClick={() => setTab('duplicates')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'duplicates' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          {`Duplicates${duplicates.length ? ` (${duplicates.length})` : ''}`}
        </button>
      </div>

      {/* ── All Customers tab ── */}
      {tab === 'all' && (
        <>
          {/* Search + tag filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone or email…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {allTags.map(tag => (
                  <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${tagFilter === tag ? 'theme-nav-active border-transparent' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {tag}
                  </button>
                ))}
                {tagFilter && (
                  <button onClick={() => setTagFilter('')} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {isLoading ? <PageLoader /> : !data?.items.length ? (
            <EmptyState
              icon={<Users className="w-8 h-8 text-slate-400" />}
              title={tagFilter || search ? 'No customers match your filter' : 'No customers yet'}
              description={tagFilter || search ? 'Try a different search or tag.' : 'Customers are created automatically from orders, or add them manually.'}
            />
          ) : (
            <>
              <Card padding="none">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Customer</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Phone</th>
                        <th className="text-right text-xs font-medium text-slate-500 px-6 py-3">Orders</th>
                        <th className="text-right text-xs font-medium text-slate-500 px-6 py-3">Total Spent</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Since</th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.items.map((c: CustomerDto) => (
                        <tr key={c.id} onClick={() => navigate(`/customers/${c.id}`)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-sm font-semibold text-teal-700 flex-shrink-0">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{c.name}</p>
                                {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">{c.phoneNumber}</td>
                          <td className="px-6 py-4 text-sm text-right text-slate-700">{c.totalOrders}</td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">{formatCurrency(c.totalSpend)}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{formatDate(c.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <a href={generateWhatsAppLink(c.phoneNumber, `Hi ${c.name}!`)}
                                target="_blank" rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                              </a>
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
              </Card>
            </>
          )}
        </>
      )}

      {/* ── B2B Customers tab ── */}
      {tab === 'b2b' && (
        b2bLoading ? <PageLoader /> : b2bCustomers.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-8 h-8 text-slate-400" />}
            title="No B2B customers yet"
            description="B2B customers appear here once they register via your storefront and select the 'Business/Wholesale' option."
          />
        ) : (
          <div className="space-y-4">
            {/* Pending approval banner */}
            {b2bCustomers.some(c => !c.isB2BApproved) && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 text-sm text-amber-700">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{b2bCustomers.filter(c => !c.isB2BApproved).length}</strong> customer{b2bCustomers.filter(c => !c.isB2BApproved).length !== 1 ? 's' : ''} waiting for B2B approval.
                </span>
              </div>
            )}

            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Customer</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Company</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">GST</th>
                      <th className="text-right text-xs font-medium text-slate-500 px-6 py-3">Orders</th>
                      <th className="text-right text-xs font-medium text-slate-500 px-6 py-3">Total Spent</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Status</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {b2bCustomers.map((c: B2BCustomerDto) => (
                      <tr key={c.crmCustomerId}
                        onClick={() => navigate(`/customers/${c.crmCustomerId}`)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700 flex-shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{c.name}</p>
                              {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {c.companyName ?? <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono text-xs">
                          {c.gstNumber ?? <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-slate-700">{c.totalOrders}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">{formatCurrency(c.totalSpend)}</td>
                        <td className="px-6 py-4">
                          {c.isB2BApproved ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                              <ShieldCheck className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                            <a href={generateWhatsAppLink(c.phoneNumber, `Hi ${c.name}!`)}
                              target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1.5 rounded-lg font-medium">
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                            {c.isB2BApproved ? (
                              <button
                                onClick={() => approveMutation.mutate({ id: c.crmCustomerId, approve: false })}
                                disabled={approveMutation.isPending}
                                className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-lg font-medium disabled:opacity-50">
                                <ShieldOff className="w-3.5 h-3.5" /> Revoke
                              </button>
                            ) : (
                              <button
                                onClick={() => approveMutation.mutate({ id: c.crmCustomerId, approve: true })}
                                disabled={approveMutation.isPending}
                                className="inline-flex items-center gap-1 text-xs text-white bg-teal-600 hover:bg-teal-700 px-2.5 py-1.5 rounded-lg font-medium disabled:opacity-50">
                                <ShieldCheck className="w-3.5 h-3.5" /> Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )
      )}

      {/* ── Duplicates tab ── */}
      {tab === 'duplicates' && (
        dupsLoading ? <PageLoader /> : duplicates.length === 0 ? (
          <EmptyState
            icon={<GitMerge className="w-8 h-8 text-slate-400" />}
            title="No duplicate customers found"
            description="All customers have unique phone numbers. Great job keeping your list clean!"
          />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              {duplicates.length} group{duplicates.length !== 1 ? 's' : ''} with duplicate phone numbers.
              Merge duplicates to consolidate orders and spend history.
            </p>
            {duplicates.map(group => (
              <Card key={group.phoneNumber}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</span>
                  <span className="text-sm font-mono text-slate-900">{group.phoneNumber}</span>
                  <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded-full ml-auto">
                    {group.customers.length} duplicates
                  </span>
                </div>
                <div className="space-y-2">
                  {group.customers.map((c, idx) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 flex-shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.totalOrders} orders · {formatCurrency(c.totalSpend)} · since {formatDate(c.createdAt)}</p>
                      </div>
                      <button onClick={() => navigate(`/customers/${c.id}`)}
                        className="text-xs text-slate-500 hover:text-teal-600 px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors">
                        View
                      </button>
                      {idx > 0 && (
                        <button
                          onClick={() => mergeMutation.mutate({ targetId: group.customers[0].id, sourceId: c.id })}
                          disabled={mergeMutation.isPending}
                          className="text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 disabled:opacity-50">
                          <GitMerge className="w-3.5 h-3.5" /> Merge into {group.customers[0].name}
                        </button>
                      )}
                      {idx === 0 && (
                        <span className="text-xs text-slate-400 italic px-2">Keep (primary)</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* New customer modal */}
      {showNew && (
        <CustomerFormModal
          title="New Customer"
          loading={createMutation.isPending}
          onClose={() => setShowNew(false)}
          onSave={createMutation.mutate}
        />
      )}
    </div>
  );
}
