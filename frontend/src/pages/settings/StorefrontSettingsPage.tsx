import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Save, Download, QrCode } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { businessApi, type StorefrontSettingsDto } from '../../api/business.api';

export function StorefrontSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['storefront-settings'],
    queryFn: businessApi.getStorefrontSettings,
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<StorefrontSettingsDto>();

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const slug = watch('slug');
  const themeColor = watch('themeColor');

  const mutation = useMutation({
    mutationFn: (values: StorefrontSettingsDto) => businessApi.updateStorefrontSettings(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['storefront-settings'] }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Storefront</h1>
          <p className="text-slate-500 text-sm mt-0.5">Customize your public store page.</p>
        </div>
        {slug && (
          <a href={`/${slug}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview Store
            </Button>
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-6">
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Store URL</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 shrink-0">{window.location.origin}/</span>
            <Input placeholder="your-store" {...register('slug', { required: true })} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-1">Announcement Bar</h2>
          <p className="text-xs text-slate-400 mb-4">Shown at the top of your storefront. Leave empty to hide the bar.</p>
          <Input
            label="Announcement Text"
            placeholder="e.g. 🚚 Free delivery on orders above ₹999 · ✨ New arrivals every week"
            {...register('announcementText')}
          />
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Theme Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColor || '#0F766E'}
                  onChange={e => setValue('themeColor', e.target.value, { shouldDirty: true })}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                />
                <Input {...register('themeColor')} className="font-mono" />
              </div>
            </div>
            <Input label="SEO Title" placeholder="My Store - Best Boutique" {...register('seoTitle')} />
            <Input label="SEO Description" placeholder="Shop the best products..." {...register('seoDescription')} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">CTA Labels</h2>
          <div className="space-y-4">
            <Input label="WhatsApp Button" {...register('whatsAppCtaLabel')} />
            <Input label="Instagram Button" {...register('instagramCtaLabel')} />
            <Input label="Facebook Button" {...register('facebookCtaLabel')} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Visibility</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" {...register('showOutOfStockProducts')} className="rounded" />
              <span className="text-sm text-slate-700">Show out-of-stock products</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" {...register('allowPublicInquiries')} className="rounded" />
              <span className="text-sm text-slate-700">Allow public inquiries (no login required)</span>
            </label>
          </div>
        </Card>

        <div className="flex gap-3 items-center">
          <Button type="submit" loading={mutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          {mutation.isSuccess && (
            <p className="text-sm text-green-600 font-medium">Saved!</p>
          )}
        </div>
      </form>

      {/* QR Code card — outside the form so it doesn't submit on button click */}
      {slug && (
        <Card>
          <div className="flex items-start gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <QrCode className="w-4 h-4 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Store QR Code</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4">Print this on packaging, receipts, or social posts so customers can open your store instantly.</p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/${slug}`)}&format=png`}
                  download={`${slug}-qr.png`}
                  className="inline-flex items-center gap-1.5 text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl font-medium transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </a>
                <a href={`/${slug}`} target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-teal-700 transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> {window.location.origin}/{slug}
                </a>
              </div>
            </div>
            <div className="flex-shrink-0 border border-slate-100 rounded-xl overflow-hidden p-2 bg-white">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/${slug}`)}`}
                alt="Store QR Code"
                width={120}
                height={120}
                className="rounded-lg"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
