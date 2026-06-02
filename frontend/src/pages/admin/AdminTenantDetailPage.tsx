import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Shield, User, CreditCard, AlertTriangle } from 'lucide-react';
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
            {plans.filter(p => p.isActive).map(p => (
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

  const toggleStatus = useMutation({
    mutationFn: () => apiClient.put(`/admin/tenants/${id}/toggle-status`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenant', id] }),
  });

  const handleToggle = () => {
    if (!tenant) return;
    const action = tenant.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} "${tenant.name}"?`)) return;
    toggleStatus.mutate();
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
              {new Date(tenant.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
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
                      ? new Date(u.lastLoginAt).toLocaleDateString('en-IN')
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
              {tenant.subscriptionHistory.map((s, i) => (
                <tr key={i}>
                  <td className="py-2 font-medium text-slate-800">{s.planName}</td>
                  <td className="py-2 text-slate-500">{s.status}</td>
                  <td className="py-2 text-slate-500 text-xs">
                    {new Date(s.startDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-2 text-slate-500 text-xs">
                    {s.endDate ? new Date(s.endDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="py-2 text-right text-slate-700">₹{s.pricePaid.toLocaleString('en-IN')}</td>
                  <td className="py-2 text-slate-500">{s.isAnnual ? 'Yes' : 'No'}</td>
                </tr>
              ))}
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
      <div className="bg-white rounded-2xl border border-red-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="text-base font-semibold text-red-700">Danger Zone</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Toggling the tenant status will {tenant.isActive ? 'prevent all users from logging in' : 're-enable access for all users'}.
        </p>
        <button
          onClick={handleToggle}
          disabled={toggleStatus.isPending}
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {tenant.isActive ? 'Deactivate Tenant' : 'Activate Tenant'}
        </button>
      </div>
    </div>
  );
}
