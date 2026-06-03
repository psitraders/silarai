import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Save, Download, QrCode, Upload, X, ImageIcon, Lock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { businessApi, type StorefrontSettingsDto } from '../../api/business.api';
import { CustomDomainSettings } from '../../components/storefront/CustomDomainSettings';
import apiClient from '../../api/client';

// ── Image Upload Widget ───────────────────────────────────────────────────────
interface ImageUploadProps {
  label: string;
  hint: string;
  aspect: 'square' | 'wide' | 'favicon'; // square = logo, wide = banner, favicon = favicon
  currentUrl?: string;               // already-saved URL from the server
  onUploaded: (url: string) => void; // called with the new URL once uploaded
  onCleared: () => void;             // called when the user removes the image
}

function ImageUploadWidget({ label, hint, aspect, currentUrl, onUploaded, onCleared }: ImageUploadProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);  // local blob preview
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local preview when the saved URL changes (e.g. after form reset)
  useEffect(() => { setPreview(null); }, [currentUrl]);

  const displayUrl = preview ?? currentUrl ?? null;
  const isWide     = aspect === 'wide';
  const isFavicon  = aspect === 'favicon';

  async function handleFile(file: File) {
    setError(null);
    // Instant local preview
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const type = aspect === 'wide' ? 'banner' : aspect === 'favicon' ? 'favicon' : 'logo';
      const url  = await businessApi.uploadStoreImage(file, type);
      onUploaded(url);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Upload failed. Please try again.';
      setError(msg);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    setPreview(null);
    onCleared();
    if (inputRef.current) inputRef.current.value = '';
  }

  const previewSize = isWide ? 'w-full h-36' : isFavicon ? 'w-14 h-14' : 'w-20 h-20';
  const iconSize    = isWide ? 'w-8 h-8' : 'w-6 h-6';
  const accept      = isFavicon
    ? 'image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml'
    : 'image/jpeg,image/png,image/webp,image/gif';
  const acceptHint  = isFavicon ? 'ICO, PNG, SVG · max 5 MB' : 'PNG, JPG, WebP · max 5 MB';

  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1">{label}</label>
      <p className="text-xs text-slate-400 mb-3">{hint}</p>

      <div className={`flex ${isWide ? 'flex-col' : 'items-start'} gap-4`}>
        {/* ── Current / preview image ── */}
        {displayUrl ? (
          <div className={`relative flex-shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 ${previewSize}`}>
            <img
              src={displayUrl}
              alt={label}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-white rounded-full shadow border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          /* ── Empty drop zone ── */
          <div
            className={`flex-shrink-0 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer ${previewSize}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <ImageIcon className={iconSize} />
            {isWide && <span className="text-xs">Drag & drop or click to upload</span>}
          </div>
        )}

        {/* ── Upload button + hint ── */}
        <div className={`flex flex-col gap-2 ${isWide ? '' : 'justify-center'}`}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : displayUrl ? 'Replace image' : 'Upload image'}
          </button>
          <p className="text-xs text-slate-400">{acceptHint}</p>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function StorefrontSettingsPage() {
  const qc = useQueryClient();

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiClient.get('/subscription').then(r => r.data),
  });
  const planSlug = sub?.planSlug ?? 'basic';
  const hasCustomDomainAccess = planSlug === 'pro' || planSlug === 'professional';

  const { data, isLoading } = useQuery({
    queryKey: ['storefront-settings'],
    queryFn: businessApi.getStorefrontSettings,
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<StorefrontSettingsDto>();

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);


  const slug           = watch('slug');
  const themeColor     = watch('themeColor')     || '#0F766E';
  const secondaryColor = watch('secondaryColor') || '#134E4A';
  const accentColor    = watch('accentColor')    || '';
  const logoUrl        = watch('logoUrl');
  const bannerUrl      = watch('bannerUrl');
  const faviconUrl     = watch('faviconUrl');

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
          <p className="text-xs text-slate-400 mb-4">Shown at the top of your storefront. Leave empty to hide.</p>
          <Input
            label="Announcement Text"
            placeholder="e.g. 🚚 Free delivery on orders above ₹999 · ✨ New arrivals every week"
            {...register('announcementText')}
          />
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-1">Appearance</h2>
          <div className="space-y-6">

            {/* Brand Colors */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-0.5">Brand Colors</p>
              <p className="text-xs text-slate-400 mb-4">
                Pick 2–3 colors from your logo. These are applied across your entire storefront — buttons, prices, gradients, and highlights.
              </p>

              <div className="space-y-4">
                {/* Primary */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Primary Color <span className="font-normal text-slate-400">— buttons, prices, links</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={e => setValue('themeColor', e.target.value, { shouldDirty: true })}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer flex-shrink-0"
                    />
                    <Input {...register('themeColor')} className="font-mono" />
                  </div>
                </div>

                {/* Secondary */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Secondary Color <span className="font-normal text-slate-400">— hero gradient, backgrounds</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={e => setValue('secondaryColor', e.target.value, { shouldDirty: true })}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer flex-shrink-0"
                    />
                    <Input {...register('secondaryColor')} className="font-mono" />
                  </div>
                </div>

                {/* Accent */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Accent Color <span className="font-normal text-slate-400">— optional 3rd highlight color</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor || themeColor}
                      onChange={e => setValue('accentColor', e.target.value, { shouldDirty: true })}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer flex-shrink-0"
                    />
                    <Input {...register('accentColor')} className="font-mono" placeholder="Leave blank to skip" />
                  </div>
                </div>
              </div>

              {/* Live preview strip */}
              <div className="mt-5">
                <p className="text-xs text-slate-400 mb-2">Preview</p>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  {/* Mini hero */}
                  <div
                    className="h-16 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${secondaryColor})` }}
                  >
                    <span className="text-white text-xs font-bold tracking-wide opacity-90">Your Store Name</span>
                  </div>
                  {/* Buttons row */}
                  <div className="bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      Order on WhatsApp
                    </span>
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border-2"
                      style={{ borderColor: secondaryColor, color: secondaryColor }}
                    >
                      View Details
                    </span>
                    {accentColor && (
                      <span
                        className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        Accent
                      </span>
                    )}
                  </div>
                  {/* Price row */}
                  <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Product price:</span>
                    <span className="text-sm font-extrabold" style={{ color: themeColor }}>₹1,499</span>
                    <span className="text-xs text-slate-400 line-through">₹1,999</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Logo Upload */}
            <ImageUploadWidget
              label="Store Logo"
              hint="Shown in the storefront header. Recommended: square image, 128×128 px or larger."
              aspect="square"
              currentUrl={logoUrl}
              onUploaded={url => setValue('logoUrl', url, { shouldDirty: true })}
              onCleared={() => setValue('logoUrl', '', { shouldDirty: true })}
            />

            <div className="border-t border-slate-100" />

            {/* Banner Upload */}
            <ImageUploadWidget
              label="Hero Banner Image"
              hint="Full-width image at the top of your store. Recommended: 1200×400 px. Leave blank to use the animated gradient hero."
              aspect="wide"
              currentUrl={bannerUrl}
              onUploaded={url => setValue('bannerUrl', url, { shouldDirty: true })}
              onCleared={() => setValue('bannerUrl', '', { shouldDirty: true })}
            />

            <div className="border-t border-slate-100" />

            {/* Favicon Upload */}
            <ImageUploadWidget
              label="Browser Tab Icon (Favicon)"
              hint="Shown in the browser tab and bookmarks. Recommended: 32×32 px square PNG or ICO. Falls back to your Store Logo."
              aspect="favicon"
              currentUrl={faviconUrl}
              onUploaded={url => setValue('faviconUrl', url, { shouldDirty: true })}
              onCleared={() => setValue('faviconUrl', '', { shouldDirty: true })}
            />

            <div className="border-t border-slate-100" />

            <Input label="SEO Title" placeholder="My Store - Best Boutique" {...register('seoTitle')} />
            <Input label="SEO Description" placeholder="Shop the best products..." {...register('seoDescription')} />
            <div>
              <Input
                label="SEO Keywords"
                placeholder="ayurvedic skincare, natural hair oil, chemical free facewash, botanical beauty India"
                {...register('seoKeywords')}
              />
              <p className="mt-1 text-xs text-slate-400">
                Comma-separated keywords people might search for. These are embedded in your page's structured data to help Google understand your store.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-1">Return &amp; Refund Policy</h2>
          <p className="text-xs text-slate-400 mb-4">
            Shown to customers in your store footer. Leave blank to use the default generic policy.
          </p>
          <textarea
            rows={10}
            placeholder={`Return & Refund Policy\n\nWe accept returns within 7 days of delivery for unused items in original packaging.\n\nTo initiate a return, contact us on WhatsApp with your order number...`}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y font-mono"
            {...register('returnPolicy')}
          />
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

        <Card>
          <h2 className="font-semibold text-slate-900 mb-1">Branded Loading Screen</h2>
          <p className="text-xs text-slate-400 mb-4">
            Shows your store logo and a themed spinner for 2 seconds when customers first open your store — gives a polished, app-like feel.
          </p>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('loaderEnabled')}
              className="rounded mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-slate-700">Enable branded loading screen</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Uses your store logo (or favicon) and primary/secondary brand colors as the background gradient.
              </p>
            </div>
          </label>
          {/* Mini preview */}
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm"
               style={{ height: 100, background: `linear-gradient(135deg, ${themeColor}, ${secondaryColor})`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {(faviconUrl || logoUrl) ? (
              <img
                src={faviconUrl || logoUrl}
                alt="Logo preview"
                style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', background: 'white' }}
              />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: 'white' }}>
                {(slug ?? 'S').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{ width: 24, height: 24 }}>
              <svg viewBox="0 0 40 40" style={{ width: 24, height: 24 }}>
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="white" strokeWidth="4"
                  strokeLinecap="round" strokeDasharray="50 50"
                  style={{ transformOrigin: '20px 20px', animation: 'rc-spin 0.9s linear infinite' }} />
              </svg>
            </div>
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

      {/* QR Code — outside the form so it doesn't submit on button click */}
      {slug && (
        <Card>
          <div className="flex items-start gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <QrCode className="w-4 h-4 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Store QR Code</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4">Print on packaging, receipts, or social posts.</p>
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

      {/* Custom Domain — Pro/Professional only */}
      {hasCustomDomainAccess ? (
        <CustomDomainSettings />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Custom Domain</h2>
              <p className="text-sm text-gray-500">Available on Pro and Professional plans</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Connect your own domain (e.g. <span className="font-semibold">www.yourstore.com</span>) so customers
            see your brand, not replycart.app. Upgrade to unlock this feature.
          </p>
          <a href="/settings/subscription">
            <Button variant="outline" size="sm">
              View Plans →
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
