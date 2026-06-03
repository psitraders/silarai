import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Shield, User, CreditCard, AlertTriangle, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import apiClient from '../../api/client';
import { PageLoader } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TenantUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt?: string;
}

interface SubHistory {
  id: string;
  planName: string;
  status: string;
  startDate: string;
  endDate?: string;
  pricePaid: number;
  isAnnual: boolean;
}

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
  currentPlan?: {
    planName: string;
    planSlug: string;
    status: string;
    endDate?: string;
    daysRemaining?: number;
  };
  productCount: number;
  leadCount: number;
  orderCount: number;
  users: TenantUser[];
  subscriptionHistory: SubHistory[];
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  annualPrice: number;
  isActive: boolean;
}

// ── Change Subscription form ───────────────────────────────────────────────────

function ChangeSubscriptionCard({ tenantId }: { tenantId: string }) {
  const qc = useQueryClient();
  const [planId, setPlanId] = useState('');
  const [status, setStatus] = useState(1);
  const [endDate, setEndDate] = useState('');
  const [isAnnual, setIsAnnual] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: () => apiClient.get('/plans').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.put(`/admin/tenants/${tenantId}/subscription`, {
        planId,
        status,
        endDate: endDate || null,
        isAnnual,
        note: null,
      }),
    onSuccess: () => {
      setFeedback({ type: 'ok', msg: 'Subscription updated successfully.' });
      qc.invalidateQueries({ queryKey: ['admin-tenant', tenantId] });
    },
    onError: () => setFeedback({ type: 'err', msg: 'Failed to update subscription.' }),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="w-5 h-5 text-violet-500" />
        <h2 className="text-base font-semibold text-slate-900">Change Subscription</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Plan</label>
          <select
            value={planId}
            onChange={e => setPlanId(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select a plan...</option>
            {plans.length === 0 && (
              <option disabled>Loading plans…</option>
            )}
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.monthlyPrice}/mo
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value={1}>Active</option>
            <option value={4}>Trial</option>
            <option value={2}>Expired</option>
            <option value={3}>Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnnual}
              onChange={e => setIsAnnual(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-slate-700">Annual billing</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={!planId}
        >
          Save Subscription
        </Button>
        {feedback && (
          <p className={`text-sm font-medium ${feedback.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
            {feedback.msg}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Pending upgrade action row ─────────────────────────────────────────────────

function PendingActionRow({ sub, tenantId }: { sub: SubHistory; tenantId: string }) {
  const qc = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const approve = useMutation({
    mutationFn: () => apiClient.post(`/subscription/admin/approve/${sub.id}`),
    onSuccess: () => {
      setFeedback('Approved!');
      qc.invalidateQueries({ queryKey: ['admin-tenant', tenantId] });
      qc.invalidateQueries({ queryKey: ['admin-pending-upgrades'] });
    },
    onError: () => setFeedback('Approve failed'),
  });

  const reject = useMutation({
    mutationFn: () => apiClient.post(`/subscription/admin/reject/${sub.id}`),
    onSuccess: () => {
      setFeedback('Rejected');
      qc.invalidateQueries({ queryKey: ['admin-tenant', tenantId] });
      qc.invalidateQueries({ queryKey: ['admin-pending-upgrades'] });
    },
    onError: () => setFeedback('Reject failed'),
  });

  if (feedback) {
    return (
      <tr>
        <td colSpan={6} className="py-2 text-sm font-medium text-center text-slate-500">{feedback}</td>
      </tr>
    );
  }

  return (
    <tr className="bg-amber-50">
      <td className="py-2 font-semibold text-amber-900">{sub.planName}</td>
      <td className="py-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3" /> Pending Approval
        </span>
      </td>
      <td className="py-2 text-slate-500 text-xs">{new Date(sub.startDate).toLocaleDateString()}</td>
      <td className="py-2 text-slate-400 text-xs">—</td>
      <td className="py-2 text-right text-slate-700">₹{sub.pricePaid.toLocaleString()}</td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => approve.mutate()}
            disabled={approve.isPending || reject.isPending}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => reject.mutate()}
            disabled={approve.isPending || reject.isPending}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AdminTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: tenant, isLoading } = useQuery<TenantDetail>({
    queryKey: ['admin-tenant', id],
    queryFn: () => apiClient.get(`/admin/tenants/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleStatus = useMutation({
    mutationFn: () => apiClient.put(`/admin/tenants/${id}/toggle-status`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenant', id] }),
  });

  const deleteTenant = useMutation({
    mutationFn: () => apiClient.delete(`/admin/tenants/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenants'] });
      navigate('/admin/tenants');
    },
  });

  const handleToggle = () => {
    if (!tenant) return;
    const action = tenant.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} "${tenant.name}"?`)) return;
    toggleStatus.mutate();
  };

  const handleDelete = () => {
    if (deleteConfirm !== tenant?.slug) return;
    deleteTenant.mutate();
  };

  if (isLoading) return <PageLoader />;
  if (!tenant) return (
    <div className="text-center py-20 text-slate-400">Tenant not found.</div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/tenants')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-500" />
          <h1 className="text-xl font-bold text-slate-900">{tenant.name}</h1>
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {tenant.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Tenant info card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Tenant Info</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-slate-400 font-medium">Email</dt>
            <dd className="text-slate-800 mt-0.5">{tenant.contactEmail}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 font-medium">Phone</dt>
            <dd className="text-slate-800 mt-0.5">{tenant.contactPhone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 font-medium">Slug</dt>
            <dd className="text-slate-800 font-mono mt-0.5">{tenant.slug}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 font-medium">Created</dt>
            <dd className="text-slate-800 mt-0.5">
              {new Date(tenant.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 font-medium">Products / Leads / Orders</dt>
            <dd className="text-slate-800 mt-0.5">{tenant.productCount} / {tenant.leadCount} / {tenant.orderCount}</dd>
          </div>
          {tenant.currentPlan && (
            <div>
              <dt className="text-xs text-slate-400 font-medium">Current Plan</dt>
              <dd className="text-slate-800 mt-0.5">
                {tenant.currentPlan.planName}{' '}
                <span className="text-slate-400">({tenant.currentPlan.status})</span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Users card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Users ({tenant.users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <tr>
                <th className="text-left pb-2">Name</th>
                <th className="text-left pb-2">Email</th>
                <th className="text-left pb-2">Last Login</th>
                <th className="text-left pb-2">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenant.users.map(u => (
                <tr key={u.id}>
                  <td className="py-2 font-medium text-slate-800">{u.name}</td>
                  <td className="py-2 text-slate-500">{u.email}</td>
                  <td className="py-2 text-slate-500 text-xs">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString(undefined)
                      : 'Never'}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tenant.users.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">No users.</p>
          )}
        </div>
      </div>

      {/* Subscription history card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Subscription History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <tr>
                <th className="text-left pb-2">Plan</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-left pb-2">Start</th>
                <th className="text-left pb-2">End</th>
                <th className="text-right pb-2">Price Paid</th>
                <th className="text-left pb-2">Annual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenant.subscriptionHistory.map((s, i) =>
                s.status === 'PendingApproval' ? (
                  <PendingActionRow key={s.id || i} sub={s} tenantId={tenant.id} />
                ) : (
                  <tr key={s.id || i}>
                    <td className="py-2 font-medium text-slate-800">{s.planName}</td>
                    <td className="py-2 text-slate-500">{s.status}</td>
                    <td className="py-2 text-slate-500 text-xs">
                      {new Date(s.startDate).toLocaleDateString(undefined)}
                    </td>
                    <td className="py-2 text-slate-500 text-xs">
                      {s.endDate ? new Date(s.endDate).toLocaleDateString(undefined) : '—'}
                    </td>
                    <td className="py-2 text-right text-slate-700">₹{s.pricePaid.toLocaleString(undefined)}</td>
                    <td className="py-2 text-slate-500">{s.isAnnual ? 'Yes' : 'No'}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          {tenant.subscriptionHistory.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">No subscription history.</p>
          )}
        </div>
      </div>

      {/* Change subscription */}
      <ChangeSubscriptionCard tenantId={tenant.id} />

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="text-base font-semibold text-red-700">Danger Zone</h2>
        </div>

        {/* Toggle active */}
        <div className="flex items-center justify-between py-3 border-b border-red-50">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {tenant.isActive ? 'Deactivate tenant' : 'Activate tenant'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {tenant.isActive
                ? 'Prevents all users from logging in. Data is preserved.'
                : 'Re-enables access for all users.'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggleStatus.isPending}
            className="px-4 py-2 rounded-xl border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {tenant.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>

        {/* Delete store */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-red-800">Delete entire store</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently deletes all products, orders, leads, users and the tenant. Cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Store
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete "{tenant.name}"?</h3>
                <p className="text-xs text-slate-500">This cannot be undone.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700 space-y-1">
              <p className="font-semibold">This will permanently delete:</p>
              <ul className="text-xs space-y-0.5 list-disc list-inside text-red-600">
                <li>{tenant.productCount} products &amp; all images/variants</li>
                <li>{tenant.orderCount} orders &amp; payments</li>
                <li>{tenant.leadCount} leads</li>
                <li>{tenant.users.length} user account{tenant.users.length !== 1 ? 's' : ''}</li>
                <li>All storefront settings, campaigns, AI data</li>
              </ul>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Type <span className="font-mono text-red-600">{tenant.slug}</span> to confirm
              </label>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder={tenant.slug}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== tenant.slug || deleteTenant.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {deleteTenant.isPending
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</>
                  : <><Trash2 className="w-4 h-4" />Delete forever</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
