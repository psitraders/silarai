import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Eye, Shield, Bell } from 'lucide-react';
import apiClient from '../../api/client';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TenantPlan {
  planName: string;
  planSlug: string;
  status: string;
  endDate?: string;
  daysRemaining?: number;
}

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
  currentPlan?: TenantPlan;
  productCount: number;
  leadCount: number;
  orderCount: number;
}

interface TenantsResponse {
  items: TenantItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Plan badge helpers ────────────────────────────────────────────────────────

function planBadgeClass(slug?: string): string {
  switch (slug) {
    case 'pro': return 'bg-teal-100 text-teal-800';
    case 'professional': return 'bg-violet-100 text-violet-800';
    default: return 'bg-slate-100 text-slate-700';
  }
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-100 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AdminTenantsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery<TenantsResponse>({
    queryKey: ['admin-tenants', page, debouncedSearch],
    queryFn: () =>
      apiClient
        .get('/admin/tenants', { params: { page, pageSize: PAGE_SIZE, search: debouncedSearch || undefined } })
        .then(r => r.data),
  });

  // Pending upgrade requests — polled every 60s for in-app notification
  const { data: pendingData } = useQuery<{
    count: number;
    items: { id: string; tenantId: string; tenantName: string; tenantEmail: string; planName: string; isAnnual: boolean; pricePaid: number; createdAt: string }[]
  }>({
    queryKey: ['admin-pending-upgrades'],
    queryFn: () => apiClient.get('/admin/tenants/pending-upgrades').then(r => r.data),
    refetchInterval: 60_000,
  });
  const pendingCount = pendingData?.count ?? 0;
  const pendingItems = pendingData?.items ?? [];

  const toggleStatus = useMutation({
    mutationFn: (id: string) => apiClient.put(`/admin/tenants/${id}/toggle-status`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] }),
  });

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleToggle = (tenant: TenantItem) => {
    const action = tenant.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} "${tenant.name}"?`)) return;
    toggleStatus.mutate(tenant.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin — All Tenants</h1>
            <p className="text-slate-500 text-sm">
              {isLoading ? 'Loading...' : `${totalCount} tenant${totalCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* Pending upgrade requests banner */}
      {pendingCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">
                {pendingCount} pending upgrade request{pendingCount !== 1 ? 's' : ''} awaiting approval
              </p>
              <p className="text-xs text-amber-600">Click a tenant to approve or reject from their detail page</p>
            </div>
          </div>
          <div className="space-y-2">
            {pendingItems.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/admin/tenants/${item.tenantId}`)}
                className="flex items-center justify-between bg-white rounded-xl border border-amber-100 px-4 py-2.5 cursor-pointer hover:border-amber-300 hover:bg-amber-50/60 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.tenantName}</p>
                  <p className="text-xs text-slate-400">{item.tenantEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                    {item.planName} · {item.isAnnual ? 'Annual' : 'Monthly'}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">₹{item.pricePaid.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Tenant</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Products</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Leads</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Orders</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : items.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.contactEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        {t.currentPlan ? (
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${planBadgeClass(t.currentPlan.planSlug)}`}>
                              {t.currentPlan.planName}
                            </span>
                            <p className="text-xs text-slate-400 mt-0.5">{t.currentPlan.status}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(t)}
                          disabled={toggleStatus.isPending}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            t.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {t.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{t.productCount}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{t.leadCount}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{t.orderCount}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/tenants/${t.id}`)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && items.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tenants found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => Math.abs(p - page) < 3)
            .map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium border transition-all ${
                  p === page
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
