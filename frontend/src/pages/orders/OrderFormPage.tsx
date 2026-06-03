import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, AlertTriangle, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ordersApi } from '../../api/orders.api';
import { catalogApi } from '../../api/catalog.api';
import { formatCurrency } from '../../utils/formatCurrency';
import type { Product } from '../../types/catalog.types';

const CHANNELS = ['WhatsApp', 'Instagram', 'Facebook', 'Direct', 'Other'];

type OrderItem = {
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
};

type FormValues = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  sourceChannel: string;
};

/** Returns the available stock for a product (null = unlimited / untracked). */
function getAvailableStock(product: Product | undefined): number | null {
  if (!product) return null;
  if (product.status === 'OutOfStock') return 0;
  return product.stockQuantity ?? null; // null = not tracked = unlimited
}

export function OrderFormPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [itemError, setItemError] = useState('');
  const [serverError, setServerError] = useState('');

  const { data: productsData } = useQuery({
    // Use the same base key as ProductsPage/ProductFormPage so that adding/editing
    // a product immediately invalidates this list too (no stale cache).
    queryKey: ['products'],
    queryFn: () => catalogApi.getProducts({ pageSize: 500 }),
    staleTime: 0, // always re-fetch when the order form mounts
  });

  // Only show Active products in the dropdown (OutOfStock products are blocked at backend too,
  // but we exclude them here to avoid confusion)
  const availableProducts = productsData?.items?.filter(p => p.status === 'Active') ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { sourceChannel: 'WhatsApp' },
  });

  const addItem = () => {
    setItems(prev => [...prev, { productId: '', productTitle: '', quantity: 1, unitPrice: 0 }]);
    setItemError('');
    setServerError('');
  };

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      if (field === 'productId' && typeof value === 'string') {
        const product = availableProducts.find(p => p.id === value);
        const stock = getAvailableStock(product);
        updated[index] = {
          ...updated[index],
          productId: value,
          productTitle: product?.title ?? '',
          unitPrice: product?.discountedPrice ?? product?.basePrice ?? 0,
          // Clamp qty to 1..available when switching products
          quantity: stock !== null ? Math.min(updated[index].quantity, Math.max(1, stock)) : Math.max(1, updated[index].quantity),
        };
      } else if (field === 'quantity') {
        const product = availableProducts.find(p => p.id === updated[index].productId);
        const stock = getAvailableStock(product);
        const raw = Number(value);
        const clamped = stock !== null ? Math.min(raw, stock) : raw;
        updated[index] = { ...updated[index], quantity: Math.max(1, clamped) };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
    setServerError('');
  };

  /** Live per-row stock check — returns error message or null */
  const getRowStockError = (item: OrderItem): string | null => {
    if (!item.productId) return null;
    const product = availableProducts.find(p => p.id === item.productId);
    const stock = getAvailableStock(product);
    if (stock === null) return null; // unlimited
    if (stock === 0) return 'This product is out of stock.';
    if (item.quantity > stock) return `Only ${stock} unit${stock === 1 ? '' : 's'} available.`;
    return null;
  };

  const hasStockErrors = items.some(i => getRowStockError(i) !== null);
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (items.length === 0) throw new Error('no-items');
      setServerError('');
      return ordersApi.createOrder({
        customerName: values.customerName,
        customerPhone: values.customerPhone || undefined,
        deliveryAddress: values.deliveryAddress || undefined,
        notes: values.notes || undefined,
        sourceChannel: values.sourceChannel as any,
        items: items.map(i => ({
          productId: i.productId,
          productTitle: i.productTitle,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      } as any);
    },
    onSuccess: (data) => navigate(`/orders/${data.id}`),
    onError: (err: any) => {
      if (err.message === 'no-items') {
        setItemError('Add at least one item to the order.');
        return;
      }
      // Surface the backend error message (InsufficientStockException → 422)
      const msg =
        err?.response?.data?.errors?.[0] ??
        err?.response?.data?.message ??
        'Failed to create order. Please check the items and try again.';
      setServerError(msg);
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Order</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manually create a new order.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-6">
        {/* Customer Info */}
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Customer Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Customer Name"
                placeholder="Anita Sharma"
                required
                error={errors.customerName?.message}
                {...register('customerName', { required: 'Name is required' })}
              />
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                type="tel"
                {...register('customerPhone')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Channel</label>
                <select
                  {...register('sourceChannel')}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {CHANNELS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Input
                label="Delivery Address (optional)"
                placeholder="123 Main St, Mumbai"
                {...register('deliveryAddress')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder="Special instructions, delivery notes..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Order Items</h2>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-400 text-sm">No items added yet.</p>
              <button type="button" onClick={addItem} className="text-teal-700 text-sm font-medium mt-1 hover:underline">
                + Add your first item
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, i) => {
                const product = availableProducts.find(p => p.id === item.productId);
                const stock = getAvailableStock(product);
                const rowError = getRowStockError(item);

                return (
                  <div key={i} className="space-y-1.5">
                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                      {/* Product select */}
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Product</label>
                        <select
                          value={item.productId}
                          onChange={e => updateItem(i, 'productId', e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            rowError ? 'border-red-300 bg-red-50' : 'border-slate-200'
                          }`}
                        >
                          <option value="">— Select —</option>
                          {availableProducts.map(p => {
                            const s = getAvailableStock(p);
                            const label = s !== null ? `${p.title} (${s} in stock)` : p.title;
                            return <option key={p.id} value={p.id}>{label}</option>;
                          })}
                        </select>
                      </div>

                      {/* Quantity — hard-capped at available stock */}
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">
                          Qty{stock !== null && <span className="text-slate-400 ml-1">/ {stock} avail.</span>}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={stock !== null ? stock : undefined}
                          value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                          className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            rowError ? 'border-red-300 bg-red-50' : 'border-slate-200'
                          }`}
                        />
                      </div>

                      {/* Unit price */}
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Unit Price (₹)</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Per-row stock error */}
                    {rowError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 pl-1">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        {rowError}
                      </div>
                    )}

                    {/* Stock availability hint when all is fine */}
                    {!rowError && stock !== null && item.productId && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-1">
                        <Package className="w-3.5 h-3.5 flex-shrink-0" />
                        {stock - item.quantity} unit{stock - item.quantity === 1 ? '' : 's'} will remain after this order.
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-between pt-3 border-t border-slate-100 font-semibold text-slate-900">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {itemError && <p className="text-sm text-red-500 mt-2">{itemError}</p>}
        </Card>

        {/* Backend / server error banner */}
        {serverError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{serverError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={hasStockErrors}
            className="flex-1"
          >
            Create Order
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>

        {hasStockErrors && (
          <p className="text-xs text-red-500 text-center -mt-3">
            Fix the stock errors above before submitting.
          </p>
        )}
      </form>
    </div>
  );
}
