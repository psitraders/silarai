import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { businessApi } from '../../api/business.api';
import type { BusinessDto } from '../../api/business.api';

export function BusinessProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: businessApi.getBusiness,
  });

  const { register, handleSubmit, reset } = useForm<BusinessDto>();

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: BusinessDto) => businessApi.updateBusiness(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Business Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your store and contact details.</p>
      </div>

      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-6">
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Store Info</h2>
          <div className="space-y-4">
            <Input label="Business Name *" {...register('name', { required: true })} />
            <Input label="Category" placeholder="e.g. Clothing, Jewellery" {...register('category')} />
            <Input label="Description" {...register('description')} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select
                {...register('currency')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="AED">AED — UAE Dirham (د.إ)</option>
                <option value="SGD">SGD — Singapore Dollar (S$)</option>
              </select>
            </div>
            <Input label="Welcome Message" placeholder="Shown on storefront" {...register('welcomeText')} />
            <Input label="Delivery Info" placeholder="e.g. Delivery in 3-5 days across India" {...register('deliveryInfo')} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Social & Contact</h2>
          <div className="space-y-4">
            <Input label="WhatsApp Number" placeholder="+91 9876543210" {...register('whatsAppNumber')} />
            <Input label="Instagram Handle" placeholder="@yourstore" {...register('instagramHandle')} />
            <Input label="Facebook Page URL" {...register('facebookPageUrl')} />
          </div>
        </Card>

        <div className="flex gap-3 items-center">
          <Button type="submit" loading={mutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          {mutation.isSuccess && (
            <p className="text-sm text-green-600 font-medium">Saved successfully!</p>
          )}
        </div>
      </form>
    </div>
  );
}
