import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, MessageCircle, Phone, Mail, MapPin, ShoppingBag,
  Inbox, Pencil, Trash2, GitMerge, X, Tag, FileText, AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { customersApi, type SaveCustomerDto } from '../../api/customers.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { generateWhatsAppLink } from '../../utils/whatsappLink';

// ── Inline edit form ──────────────────────────────────────────────────────────

interface EditPanelProps {
  initial: SaveCustomerDto;
  onSave: (data: SaveCustomerDto) => void;
  onCancel: () => void;
  loading: boolean;
}

function EditPanel({ initial, onSave, onCancel, loading }: EditPanelProps) {
  const [form, setForm] = useState<SaveCustomerDto>({ ...initial });
  const set = (k: keyof SaveCustomerDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Card>
      <h2 className="font-semibold text-slate-900 mb-4">Edit Customer</h2>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Name *</label>
            <input value={form.name} onChange={set('name')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Phone *</label>
            <input value={form.phoneNumber} onChange={set('phoneNumber')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
          <input value={form.email ?? ''} onChange={set('email')} type="email"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Address</label>
            <input value={form.address ?? ''} onChange={set('address')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">City</label>
            <input value={form.city ?? ''} onChange={set('city')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Tags <span className="text-slate-400 font-normal">(comma-separated)</span></label>
          <input value={form.tags ?? ''} onChange={set('tags')} placeholder="vip, loyal, wholesale"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Notes</label>
          <textarea value={form.notes ?? ''} onChange={set('notes')} rows={3}
            placeholder="Internal notes about this customer…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>
        <div className="flex gap-2 pt-1">
          <Button onClick={() => onSave(form)} loading={loading} disabled={!form.name.trim() || !form.phoneNumber.trim()}>
            Save Changes
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [editing, setEditing]   = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMerge, setShowMerge]   = useState(false);
  const [mergeSearch, setMergeSearch] = useState('');
  const [mergeTarget, setMergeTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id!),
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: SaveCustomerDto) => customersApi.update(id!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer', id] }); setEditing(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => customersApi.delete(id!),
    onSuccess: () => navigate('/customers'),
  });

  const mergeMutation = useMutation({
    mutationFn: ({ targetId, sourceId }: { targetId: string; sourceId: string }) =>
      customersApi.merge(targetId, sourceId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); navigate('/customers'); },
  });

  // Search for merge target
  const { data: searchResults } = useQuery({
    queryKey: ['customers-search', mergeSearch],
    queryFn: () => customersApi.getAll({ search: mergeSearch, pageSize: 5 }),
    enabled: mergeSearch.length >= 2,
  });

  if (isLoading) return <PageLoader />;
  if (!customer) return <div className="text-center py-12 text-slate-500">Customer not found.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Customer since {formatDate(customer.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href={generateWhatsAppLink(customer.phoneNumber, `Hi ${customer.name}! `)} target="_blank" rel="noreferrer">
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </a>
          <button onClick={() => setEditing(e => !e)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 px-3 py-2 rounded-xl transition-colors">
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button onClick={() => setShowMerge(true)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 px-3 py-2 rounded-xl transition-colors">
            <GitMerge className="w-4 h-4" /> Merge
          </button>
          <button onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Edit panel */}
      {editing && (
        <EditPanel
          initial={{
            name: customer.name, phoneNumber: customer.phoneNumber, email: customer.email,
            address: customer.address, city: customer.city, notes: customer.notes, tags: customer.tags,
          }}
          onSave={updateMutation.mutate}
          onCancel={() => setEditing(false)}
          loading={updateMutation.isPending}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center">
              <p className="text-2xl font-bold text-slate-900">{customer.totalOrders}</p>
              <p className="text-xs text-slate-500 mt-0.5">Orders</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold theme-text">{formatCurrency(customer.totalSpend)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Spent</p>
            </Card>
          </div>

          {/* Contact */}
          <Card>
            <h2 className="font-semibold text-slate-900 mb-3">Contact</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{customer.phoneNumber}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customer.email}</span>
                </div>
              )}
              {(customer.address || customer.city) && (
                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{[customer.address, customer.city].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Notes</h2>
              {!customer.notes && (
                <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-teal-600 ml-auto">+ Add</button>
              )}
            </div>
            {customer.notes
              ? <p className="text-sm text-slate-600 whitespace-pre-wrap">{customer.notes}</p>
              : <p className="text-xs text-slate-400">No notes yet. Click Edit to add one.</p>
            }
          </Card>

          {/* Tags */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Tags</h2>
              {!customer.tags && (
                <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-teal-600 ml-auto">+ Add</button>
              )}
            </div>
            {customer.tags
              ? (
                <div className="flex flex-wrap gap-1.5">
                  {customer.tags.split(',').map(tag => (
                    <span key={tag} className="theme-badge text-xs px-2.5 py-0.5 rounded-full font-medium">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )
              : <p className="text-xs text-slate-400">No tags yet. Click Edit to add.</p>
            }
          </Card>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent orders */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Recent Orders
              </h2>
              <Link to="/orders" className="text-xs theme-text hover:underline">View all</Link>
            </div>
            {customer.recentOrders.length === 0 ? (
              <p className="text-sm text-slate-400">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {customer.recentOrders.map(order => (
                  <Link key={order.id} to={`/orders/${order.id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900 font-mono">{order.orderNumber}</p>
                      <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'default'}>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Inquiry history */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Inbox className="w-4 h-4" /> Inquiry History
              </h2>
            </div>
            {customer.recentLeads.length === 0 ? (
              <p className="text-sm text-slate-400">No inquiries yet.</p>
            ) : (
              <div className="space-y-3">
                {customer.recentLeads.map(lead => (
                  <Link key={lead.id} to={`/leads/${lead.id}`}
                    className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="default">{lead.status}</Badge>
                      <span className="text-xs text-slate-400">{formatDate(lead.createdAt)}</span>
                    </div>
                    {lead.inquiryNote && (
                      <p className="text-xs text-slate-600 truncate">{lead.inquiryNote}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete Customer?</h3>
                <p className="text-xs text-slate-500">This will hide the customer record. Orders and leads are preserved.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Merge modal ── */}
      {showMerge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">Merge Customer</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This customer (<strong>{customer.name}</strong>) will be kept as the primary record.
                  Select the duplicate to merge in.
                </p>
              </div>
              <button onClick={() => { setShowMerge(false); setMergeTarget(null); setMergeSearch(''); }}
                className="p-1.5 rounded-xl hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <input
                placeholder="Search for duplicate by name or phone…"
                value={mergeSearch}
                onChange={e => { setMergeSearch(e.target.value); setMergeTarget(null); }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {searchResults?.items
                .filter(c => c.id !== id)
                .map(c => (
                  <button key={c.id} onClick={() => setMergeTarget({ id: c.id, name: c.name })}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${mergeTarget?.id === c.id ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.phoneNumber} · {c.totalOrders} orders</p>
                    </div>
                    {mergeTarget?.id === c.id && <span className="ml-auto text-xs text-teal-600 font-semibold">Selected</span>}
                  </button>
                ))
              }
              {mergeTarget && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                  All orders and leads from <strong>{mergeTarget.name}</strong> will be moved to <strong>{customer.name}</strong>.
                  {mergeTarget.name} will be soft-deleted and cannot be recovered.
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowMerge(false); setMergeTarget(null); setMergeSearch(''); }}>
                Cancel
              </Button>
              <Button
                loading={mergeMutation.isPending}
                disabled={!mergeTarget}
                onClick={() => mergeTarget && mergeMutation.mutate({ targetId: id!, sourceId: mergeTarget.id })}
              >
                Merge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
