import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, getOrderStatusBadge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ordersApi } from '../../api/orders.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import type { OrderStatus } from '../../types/order.types';

const statuses: { label: string; value?: OrderStatus }[] = [
  { label: 'All' },
  { label: 'New', value: 'New' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Payment Pending', value: 'PaymentPending' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Delivered', value: 'Delivered' },
];

export function OrdersPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', status],
    queryFn: () => ordersApi.getOrders({ status }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and manage all your orders.</p>
        </div>
        <Button onClick={() => navigate('/orders/new')}>
          <Plus className="w-4 h-4" /> Create Order
        </Button>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex gap-1 bg-slate-50 overflow-x-auto">
          {statuses.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setStatus(value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                status === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {!data?.items?.length ? (
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8" />}
            title="No orders yet"
            description="Create orders manually or convert leads into orders."
            action={{ label: '+ Create Order', onClick: () => navigate('/orders/new') }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 font-medium border-b border-slate-50 bg-slate-50/50">
                  <th className="text-left px-6 py-3">Order</th>
                  <th className="text-left px-6 py-3 hidden sm:table-cell">Customer</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Channel</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-right px-6 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-slate-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-slate-700">{order.customerName ?? 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs text-slate-500">{order.sourceChannel}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 hidden md:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getOrderStatusBadge(order.status)}>
                        {order.status.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
