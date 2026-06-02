import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ordersApi } from '../../api/orders.api';
import { catalogApi } from '../../api/catalog.api';
import { formatCurrency } from '../../utils/formatCurrency';

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

export function OrderFormPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [itemError, setItemError] = useState('');

  const { data: productsData } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => catalogApi.getProducts({ pageSize: 100 }),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { sourceChannel: 'WhatsApp' },
  });

  const addItem = () => {
    setItems(prev => [...prev, { productId: '', productTitle: '', quantity: 1, unitPrice: 0 }]);
    setItemError('');
  };

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      if (field === 'productId' && typeof value === 'string') {
        const product = productsData?.items?.find(p => p.id === value);
        updated[index] = {
          ...updated[index],
          productId: value,
          productTitle: product?.title ?? '',
          unitPrice: (product as any)?.discountedPrice ?? (product as any)?.basePrice ?? 0,
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (items.length === 0) throw new Error('no-items');
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
      if (err.message === 'no-items') setItemError('Add at least one item to the order.');
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
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Product</label>
                    <select
                      value={item.productId}
                      onChange={e => updateItem(i, 'productId', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">— Select —</option>
                      {productsData?.items?.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
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
              ))}

              <div className="flex justify-between pt-3 border-t border-slate-100 font-semibold text-slate-900">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {itemError && <p className="text-sm text-red-500 mt-2">{itemError}</p>}
        </Card>

        {mutation.isError && !(mutation.error as any)?.message?.includes('no-items') && (
          <p className="text-sm text-red-500">Failed to create order. Please try again.</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={mutation.isPending} className="flex-1">
            Create Order
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
