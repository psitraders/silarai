import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, RefreshCw, MessageCircle, Copy, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { catalogApi } from '../../api/catalog.api';
import { businessApi } from '../../api/business.api';
import { formatCurrency } from '../../utils/formatCurrency';
import type { ProductStatus } from '../../types/catalog.types';

const statusTabs: { label: string; value?: ProductStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Out of Stock', value: 'OutOfStock' },
];

const statusBadge: Record<string, string> = {
  Active: 'success',
  Draft: 'warning',
  Archived: 'default',
  OutOfStock: 'danger',
};

export function ProductsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'All' | ProductStatus>('All');
  const [search, setSearch] = useState('');
  const [syncMsg, setSyncMsg] = useState('');
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    onSettled: () => setDeletingId(null),
  });

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const cloneMutation = useMutation({
    mutationFn: (id: string) => catalogApi.cloneProduct(id),
    onMutate: (id) => setCloningId(id),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      navigate(`/catalog/products/${result.id}`);
    },
    onSettled: () => setCloningId(null),
  });

  const { data: integrations } = useQuery({
    queryKey: ['integration-settings'],
    queryFn: businessApi.getIntegrationSettings,
  });

  const syncMutation = useMutation({
    mutationFn: businessApi.syncWhatsAppCatalog,
    onSuccess: (result) => setSyncMsg(`✅ ${result.message}`),
    onError: (err: any) => setSyncMsg(`❌ ${err?.response?.data?.message ?? 'Sync failed'}`),
  });

  // Always fetch ALL products (no status filter) so tab counts are always accurate.
  // Status filtering is done client-side; search is server-side.
  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => catalogApi.getProducts({
      search: search || undefined,
      pageSize: 500,
    }),
  });

  // Client-side filter for the active tab
  const filteredItems = activeTab === 'All'
    ? (data?.items ?? [])
    : (data?.items ?? []).filter(p => p.status === activeTab);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your product catalog and inventory.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {integrations?.whatsAppConfigured && (
            <div className="flex flex-col items-end gap-1">
              <Button
                variant="outline"
                onClick={() => { setSyncMsg(''); syncMutation.mutate(); }}
                loading={syncMutation.isPending}
              >
                <MessageCircle className="w-4 h-4 mr-1.5 text-green-600" />
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Sync WA Catalog
              </Button>
              {syncMsg && <p className="text-xs text-slate-600">{syncMsg}</p>}
            </div>
          )}
          <Button onClick={() => navigate('/catalog/products/new')}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card padding="none">
        {/* Filters */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-wrap gap-3">
          {/* Status tabs */}
          <div className="overflow-x-auto flex-shrink-0 max-w-full">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-max">
            {statusTabs.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setActiveTab(value === 'All' ? 'All' : value as ProductStatus)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
                {value !== 'All' && data && (
                  <span className="ml-1 text-slate-400">
                    ({data.items.filter(p => p.status === value).length})
                  </span>
                )}
                {value === 'All' && data && (
                  <span className="ml-1 text-slate-400">({data.items.length})</span>
                )}
              </button>
            ))}
          </div>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent text-sm outline-none w-full min-w-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {!filteredItems.length ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title={activeTab === 'All' ? 'No products yet' : `No ${activeTab === 'OutOfStock' ? 'out-of-stock' : activeTab.toLowerCase()} products`}
            description={activeTab === 'All' ? 'Add your first product to start building your catalog.' : `All products that are ${activeTab === 'OutOfStock' ? 'out of stock' : activeTab.toLowerCase()} will appear here.`}
            action={activeTab === 'All' ? { label: '+ Add Product', onClick: () => navigate('/catalog/products/new') } : undefined}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {filteredItems.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/catalog/products/${product.id}`)}
              >
                <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-3">
                  {product.primaryImageUrl ? (
                    <img
                      src={product.primaryImageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <button
                      title="Clone product"
                      className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      disabled={cloningId === product.id}
                      onClick={(e) => { e.stopPropagation(); cloneMutation.mutate(product.id); }}
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button
                      title="Delete product"
                      className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-red-50"
                      disabled={deletingId === product.id}
                      onClick={(e) => handleDelete(e, product.id, product.title)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-900 truncate">{product.title}</h3>
                <p className="text-sm font-bold text-teal-700 mt-0.5">
                  {formatCurrency(product.discountedPrice ?? product.basePrice)}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge variant={(statusBadge[product.status] ?? 'default') as any}>
                    {product.status === 'OutOfStock' ? '• Out of Stock' :
                     product.status === 'Active' ? '• In Stock' : product.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {data && (
        <p className="text-sm text-slate-500 text-center">
          Showing {filteredItems.length}{activeTab !== 'All' ? ` ${activeTab === 'OutOfStock' ? 'out-of-stock' : activeTab.toLowerCase()}` : ''} of {data.items.length} total products
        </p>
      )}
    </div>
  );
}
