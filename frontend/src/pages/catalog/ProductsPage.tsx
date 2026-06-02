import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { catalogApi } from '../../api/catalog.api';
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
  const [activeTab, setActiveTab] = useState<'All' | ProductStatus>('All');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', activeTab, search],
    queryFn: () => catalogApi.getProducts({
      status: activeTab === 'All' ? undefined : activeTab,
      search: search || undefined,
    }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your product catalog and inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/catalog/products/new')}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card padding="none">
        {/* Filters */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-wrap gap-3">
          {/* Status tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
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
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or category..."
                className="bg-transparent text-sm outline-none w-44"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {!data?.items?.length ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No products yet"
            description="Add your first product to start building your catalog."
            action={{ label: '+ Add Product', onClick: () => navigate('/catalog/products/new') }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {data.items.map((product) => (
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
                  <div className="absolute top-2 right-2">
                    <button
                      className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <span className="w-3.5 h-3.5 text-slate-600 text-xs">···</span>
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
          Showing {data.items.length} of {data.totalCount} products
        </p>
      )}
    </div>
  );
}
