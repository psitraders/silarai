import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { leadsApi } from '../../api/leads.api';
import { catalogApi } from '../../api/catalog.api';
import type { SocialPlatform } from '../../types/lead.types';

const CHANNELS: SocialPlatform[] = ['WhatsApp', 'Instagram', 'Facebook', 'Direct', 'Other'];

type FormValues = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  sourceChannel: SocialPlatform;
  interestedProductId: string;
  inquiryNote: string;
  followUpDate: string;
};

export function LeadFormPage() {
  const navigate = useNavigate();

  const { data: productsData } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => catalogApi.getProducts({ pageSize: 100 }),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { sourceChannel: 'WhatsApp' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      leadsApi.createLead({
        customerName: values.customerName,
        customerPhone: values.customerPhone || undefined,
        customerEmail: values.customerEmail || undefined,
        sourceChannel: values.sourceChannel,
        interestedProductId: values.interestedProductId || undefined,
        inquiryNote: values.inquiryNote || undefined,
        followUpDate: values.followUpDate || undefined,
      }),
    onSuccess: (data) => navigate(`/leads/${data.id}`),
  });

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Lead</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manually create a new customer inquiry.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4">
          <Input
            label="Customer Name"
            placeholder="Anita Sharma"
            required
            error={errors.customerName?.message}
            {...register('customerName', { required: 'Name is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              type="tel"
              {...register('customerPhone')}
            />
            <Input
              label="Email (optional)"
              placeholder="anita@gmail.com"
              type="email"
              {...register('customerEmail')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source Channel</label>
            <select
              {...register('sourceChannel')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {CHANNELS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Interested Product (optional)</label>
            <select
              {...register('interestedProductId')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">— Select a product —</option>
              {productsData?.items?.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Inquiry Note (optional)</label>
            <textarea
              {...register('inquiryNote')}
              rows={3}
              placeholder="Customer asked about pricing, wants delivery by Diwali..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <Input
            label="Follow-up Date (optional)"
            type="date"
            {...register('followUpDate')}
          />

          {mutation.isError && (
            <p className="text-sm text-red-500">Failed to create lead. Please try again.</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending} className="flex-1">
              Create Lead
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
