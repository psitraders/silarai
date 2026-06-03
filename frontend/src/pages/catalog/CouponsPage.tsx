import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { couponsApi, type CouponDto, type SaveCouponDto } from '../../api/coupons.api';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

type CouponType = 'Percentage' | 'Flat' | 'BuyXGetY';

const TYPE_LABELS: Record<CouponType, string> = {
  Percentage: '% Off',
  Flat: 'Flat Off',
  BuyXGetY: 'Buy X Get Y',
};

const TYPE_COLORS: Record<CouponType, string> = {
  Percentage: 'bg-teal-50 text-teal-700',
  Flat: 'bg-blue-50 text-blue-700',
  BuyXGetY: 'bg-violet-50 text-violet-700',
};

function couponSummary(c: CouponDto) {
  if (c.type === 'Percentage') return `${c.value}% off`;
  if (c.type === 'Flat') return `${formatCurrency(c.value)} off`;
  return `Buy ${c.buyQuantity} Get ${c.getQuantity} Free`;
}

export function CouponsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CouponDto | null>(null);

  const { data: coupons = [], isLoading } = useQuery({ queryKey: ['coupons'], queryFn: couponsApi.getAll });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SaveCouponDto>({
    defaultValues: { type: 'Percentage', isActive: true, value: 10 },
  });
  const couponType = watch('type') as CouponType;

  const openNew = () => { reset({ type: 'Percentage', isActive: true, value: 10 }); setEditing(null); setOpen(true); };
  const openEdit = (c: CouponDto) => {
    reset({ code: c.code, type: c.type, value: c.value, minOrderAmount: c.minOrderAmount, maxUses: c.maxUses, validFrom: c.validFrom?.slice(0, 10), validTo: c.validTo?.slice(0, 10), isActive: c.isActive, buyQuantity: c.buyQuantity, getQuantity: c.getQuantity });
    setEditing(c);
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: SaveCouponDto) => editing ? couponsApi.update(editing.id, data) : couponsApi.create(data) as Promise<any>,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: couponsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
          <p className="text-slate-500 text-sm mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /> New Coupon</Button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon={<Tag className="w-8 h-8 text-slate-400" />} title="No coupons yet" description="Create discount codes to share with customers on WhatsApp or social media." />
      ) : (
        <Card padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Code</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Discount</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Uses</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Valid Until</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{c.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[c.type as CouponType]}`}>{TYPE_LABELS[c.type as CouponType]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{couponSummary(c)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.validTo ? formatDate(c.validTo) : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Coupon' : 'New Coupon'}>
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Coupon Code *" placeholder="SAVE20" error={errors.code?.message} {...register('code', { required: 'Code is required' })} className="uppercase" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
              <select {...register('type')} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="Percentage">% Off</option>
                <option value="Flat">Flat Amount Off</option>
                <option value="BuyXGetY">Buy X Get Y Free</option>
              </select>
            </div>
          </div>

          {couponType === 'BuyXGetY' ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Buy Quantity" type="number" min={1} {...register('buyQuantity', { valueAsNumber: true })} />
              <Input label="Get Quantity Free" type="number" min={1} {...register('getQuantity', { valueAsNumber: true })} />
            </div>
          ) : (
            <Input
              label={couponType === 'Percentage' ? 'Discount % *' : 'Discount Amount (₹) *'}
              type="number" step="0.01" min={0}
              error={errors.value?.message}
              {...register('value', { required: 'Value is required', valueAsNumber: true })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Order Amount (₹)" type="number" step="0.01" {...register('minOrderAmount', { valueAsNumber: true })} />
            <Input label="Max Uses" type="number" min={1} {...register('maxUses', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valid From" type="date" {...register('validFrom')} />
            <Input label="Valid To" type="date" {...register('validTo')} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isActive')} className="rounded" />
            <span className="text-sm text-slate-700">Active</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saveMutation.isPending} className="flex-1">{editing ? 'Save Changes' : 'Create Coupon'}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
          {saveMutation.isError && (
            <p className="text-sm text-red-500">{(saveMutation.error as any)?.response?.data?.errors?.[0] ?? 'Something went wrong.'}</p>
          )}
        </form>
      </Modal>
    </div>
  );
}
