import { useState, useEffect, useRef } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import {
  X, ArrowRight, ArrowLeft, Check, Copy, ExternalLink,
  MessageCircle, Store, Package, Rocket, Sparkles,
  CheckCircle2, Upload, Image as ImageIcon,
} from 'lucide-react';
import { businessApi } from '../../api/business.api';
import { catalogApi } from '../../api/catalog.api';

// ── Constants ─────────────────────────────────────────────────────────────────

const THEME_COLORS = [
  { hex: '#0F766E', label: 'Teal'   },
  { hex: '#2563EB', label: 'Blue'   },
  { hex: '#7C3AED', label: 'Violet' },
  { hex: '#DB2777', label: 'Pink'   },
  { hex: '#EA580C', label: 'Orange' },
  { hex: '#16A34A', label: 'Green'  },
  { hex: '#DC2626', label: 'Red'    },
  { hex: '#475569', label: 'Slate'  },
];

const CURRENCIES = [
  { code: 'INR', label: 'INR — Indian Rupee (₹)' },
  { code: 'USD', label: 'USD — US Dollar ($)'     },
  { code: 'EUR', label: 'EUR — Euro (€)'          },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
  { code: 'AED', label: 'AED — UAE Dirham'        },
  { code: 'SGD', label: 'SGD — Singapore Dollar'  },
];

const STEP_LABELS = ['Business', 'Storefront', 'Product', 'Go Live'];

// ── Types ─────────────────────────────────────────────────────────────────────

type WizardStep = 0 | 1 | 2 | 3 | 4; // 0 = welcome, 1-3 = form, 4 = golive

interface FormState {
  // Step 1 — Business
  name: string;
  whatsAppNumber: string;
  description: string;
  currency: string;
  // Step 2 — Storefront
  themeColor: string;
  slug: string;
  whatsAppCtaLabel: string;
  slugEdited: boolean; // true once user manually changed the slug
  // Step 3 — Product
  productName: string;
  productPrice: string;
  productDescription: string;
  productImageFile: File | null;
  productImagePreview: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 50);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, type = 'text', autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
    />
  );
}

function StepProgress({ step }: { step: WizardStep }) {
  if (step === 0 || step === 4) return null;
  const idx = step - 1; // 0-based index into STEP_LABELS
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < idx ? 'bg-teal-600 text-white' :
                i === idx ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
                'bg-slate-100 text-slate-400'
              }`}
            >
              {i < idx ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${i === idx ? 'text-teal-700' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`w-12 sm:w-16 h-0.5 mb-4 mx-1 transition-colors ${i < idx ? 'bg-teal-600' : 'bg-slate-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  initialName?: string;
  onDismiss: () => void;
}

export function OnboardingWizard({ initialName = '', onDismiss }: OnboardingWizardProps) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<WizardStep>(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [productSkipped, setProductSkipped] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: initialName,
    whatsAppNumber: '',
    description: '',
    currency: 'INR',
    themeColor: '#0F766E',
    slug: toSlug(initialName),
    whatsAppCtaLabel: 'Order on WhatsApp',
    slugEdited: false,
    productName: '',
    productPrice: '',
    productDescription: '',
    productImageFile: null,
    productImagePreview: null,
  });

  const set = (patch: Partial<FormState>) => setForm(prev => ({ ...prev, ...patch }));

  // Fetch existing storefront settings to pre-populate slug & theme
  const { data: storefrontData } = useQuery({
    queryKey: ['storefront-settings'],
    queryFn: businessApi.getStorefrontSettings,
  });

  useEffect(() => {
    if (storefrontData) {
      set({
        themeColor: storefrontData.themeColor || '#0F766E',
        slug: storefrontData.slug || toSlug(form.name),
        whatsAppCtaLabel: storefrontData.whatsAppCtaLabel || 'Order on WhatsApp',
        slugEdited: !!storefrontData.slug,
      });
    }
  }, [storefrontData]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveProfile = useMutation({
    mutationFn: () => businessApi.updateBusiness({
      name: form.name,
      category: '',
      description: form.description || undefined,
      whatsAppNumber: form.whatsAppNumber || undefined,
      instagramHandle: undefined,
      facebookPageUrl: undefined,
      currency: form.currency,
      welcomeText: undefined,
      deliveryInfo: undefined,
    } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business'] });
      setError(null);
      setStep(2);
    },
    onError: () => setError('Failed to save business profile. Please try again.'),
  });

  const saveStorefront = useMutation({
    mutationFn: () => businessApi.updateStorefrontSettings({
      themeColor: form.themeColor,
      slug: form.slug,
      whatsAppCtaLabel: form.whatsAppCtaLabel,
      // Preserve existing values; fall back to sensible defaults for new tenants
      instagramCtaLabel: storefrontData?.instagramCtaLabel ?? 'Follow on Instagram',
      facebookCtaLabel:  storefrontData?.facebookCtaLabel  ?? 'Like on Facebook',
      showOutOfStockProducts: storefrontData?.showOutOfStockProducts ?? false,
      allowPublicInquiries:   storefrontData?.allowPublicInquiries   ?? true,
    } as any),
    onSuccess: () => {
      setError(null);
      setStep(3);
    },
    onError: () => setError('Failed to save storefront settings. Please try again.'),
  });

  const saveProduct = useMutation({
    mutationFn: async () => {
      const created = await catalogApi.createProduct({
        title: form.productName,
        basePrice: parseFloat(form.productPrice),
        description: form.productDescription || undefined,
        status: 'Active',
        isFeatured: true,
        tags: [],
      });
      if (form.productImageFile && created.id) {
        await catalogApi.uploadImage(created.id, form.productImageFile);
      }
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      setError(null);
      setStep(4);
    },
    onError: () => setError('Failed to create product. Please try again.'),
  });

  // ── Step handlers ──────────────────────────────────────────────────────────

  const handleNext1 = () => {
    if (!form.name.trim()) { setError('Business name is required.'); return; }
    setError(null);
    saveProfile.mutate();
  };

  const handleNext2 = () => {
    if (!form.slug.trim()) { setError('Store URL is required.'); return; }
    setError(null);
    saveStorefront.mutate();
  };

  const handleNext3 = () => {
    if (!form.productName.trim()) { setError('Product name is required.'); return; }
    if (!form.productPrice || isNaN(parseFloat(form.productPrice)) || parseFloat(form.productPrice) <= 0) {
      setError('Please enter a valid price.'); return;
    }
    setError(null);
    saveProduct.mutate();
  };

  const handleSkipProduct = () => {
    setProductSkipped(true);
    setStep(4);
  };

  const handleDone = () => {
    qc.invalidateQueries({ queryKey: ['business'] });
    onDismiss();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    set({ productImageFile: file, productImagePreview: preview });
  };

  const storeUrl = `${window.location.origin}/${form.slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Close button (shows after welcome) */}
        {step > 0 && step < 4 && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="Skip setup"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* ── Step 0: Welcome ─────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="relative overflow-hidden">
            {/* Gradient hero */}
            <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 px-8 pt-12 pb-10 text-white text-center relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome to ReplyCart!</h1>
                <p className="text-teal-100 text-sm leading-relaxed max-w-xs mx-auto">
                  Your all-in-one WhatsApp commerce platform. Let's set up your store in 4 quick steps.
                </p>
              </div>
            </div>

            {/* What you'll set up */}
            <div className="px-8 py-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">What we'll set up</p>
              <div className="space-y-3">
                {[
                  { icon: Store,          color: 'bg-teal-50 text-teal-600',    title: 'Business Profile',   sub: 'Name, WhatsApp number & description' },
                  { icon: Sparkles,       color: 'bg-violet-50 text-violet-600', title: 'Storefront Design',  sub: 'Theme color & your unique store URL' },
                  { icon: Package,        color: 'bg-blue-50 text-blue-600',    title: 'First Product',      sub: 'Add something for customers to buy' },
                  { icon: Rocket,         color: 'bg-amber-50 text-amber-600',  title: 'Go Live',            sub: 'Share your store and start selling' },
                ].map(({ icon: Icon, color, title, sub }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="mt-6 w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-teal-200"
              >
                Let's Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onDismiss}
                className="mt-2 w-full py-2 text-sm text-slate-400 hover:text-slate-600 transition"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* ── Steps 1–3: Forms ────────────────────────────────────────────── */}
        {step >= 1 && step <= 3 && (
          <div className="px-8 py-7">
            <StepProgress step={step} />

            {/* Error banner */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* ── Step 1: Business Profile ──────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Your Business</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Tell customers who you are.</p>
                </div>

                <div>
                  <FieldLabel required>Business Name</FieldLabel>
                  <TextInput
                    value={form.name}
                    onChange={v => {
                      set({ name: v, slug: form.slugEdited ? form.slug : toSlug(v) });
                    }}
                    placeholder="e.g. Riya's Boutique"
                    autoFocus
                  />
                </div>

                <div>
                  <FieldLabel>WhatsApp Number</FieldLabel>
                  <TextInput
                    value={form.whatsAppNumber}
                    onChange={v => set({ whatsAppNumber: v })}
                    placeholder="+91 98765 43210"
                    type="tel"
                  />
                  <p className="text-xs text-slate-400 mt-1">Customers will contact you here for orders.</p>
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={e => set({ description: e.target.value })}
                    placeholder="What does your store sell? (e.g. Handcrafted jewellery and accessories)"
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition"
                  />
                </div>

                <div>
                  <FieldLabel>Currency</FieldLabel>
                  <select
                    value={form.currency}
                    onChange={e => set({ currency: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNext1}
                    disabled={saveProfile.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
                  >
                    {saveProfile.isPending ? 'Saving…' : <>Next: Storefront <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Storefront ────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Storefront Design</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Make it yours with colors and a URL.</p>
                </div>

                {/* Theme color */}
                <div>
                  <FieldLabel>Theme Color</FieldLabel>
                  <div className="flex flex-wrap gap-2.5">
                    {THEME_COLORS.map(c => (
                      <button
                        key={c.hex}
                        title={c.label}
                        onClick={() => set({ themeColor: c.hex })}
                        className={`w-9 h-9 rounded-xl transition-all ${form.themeColor === c.hex ? 'ring-2 ring-offset-2 ring-teal-500 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {form.themeColor === c.hex && <Check className="w-4 h-4 text-white mx-auto" />}
                      </button>
                    ))}
                    {/* Custom picker */}
                    <div className="relative">
                      <input
                        type="color"
                        value={form.themeColor}
                        onChange={e => set({ themeColor: e.target.value })}
                        className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer opacity-0 absolute inset-0"
                        title="Custom color"
                      />
                      <div
                        className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs pointer-events-none"
                        title="Custom color"
                      >
                        +
                      </div>
                    </div>
                  </div>
                  {/* Preview */}
                  <div
                    className="mt-3 rounded-xl px-4 py-3 text-white text-sm font-medium flex items-center gap-2 transition-colors"
                    style={{ backgroundColor: form.themeColor }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {form.whatsAppCtaLabel || 'Order on WhatsApp'}
                  </div>
                </div>

                {/* Slug / URL */}
                <div>
                  <FieldLabel required>Store URL</FieldLabel>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                    <span className="text-xs text-slate-400 flex-shrink-0 hidden sm:inline">
                      {window.location.host}/
                    </span>
                    <input
                      value={form.slug}
                      onChange={e => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''), slugEdited: true })}
                      placeholder="your-store"
                      className="flex-1 bg-transparent text-sm text-slate-900 font-medium focus:outline-none min-w-0"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    Your store: <span className="text-teal-700 font-medium">{storeUrl}</span>
                  </p>
                </div>

                {/* WhatsApp CTA label */}
                <div>
                  <FieldLabel>WhatsApp Button Label</FieldLabel>
                  <TextInput
                    value={form.whatsAppCtaLabel}
                    onChange={v => set({ whatsAppCtaLabel: v })}
                    placeholder="Order on WhatsApp"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNext2}
                    disabled={saveStorefront.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
                  >
                    {saveStorefront.isPending ? 'Saving…' : <>Next: Add a Product <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: First Product ─────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">First Product</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Add something for customers to buy.</p>
                </div>

                {/* Image upload */}
                <div>
                  <FieldLabel>Product Image</FieldLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  {form.productImagePreview ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200">
                      <img src={form.productImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => set({ productImageFile: null, productImagePreview: null })}
                        className="absolute top-2 right-2 p-1 bg-white/90 rounded-lg text-slate-500 hover:text-red-500 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-teal-400 hover:text-teal-500 transition group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium">Click to upload an image</span>
                      <span className="text-xs">Optional — you can add more later</span>
                    </button>
                  )}
                </div>

                <div>
                  <FieldLabel required>Product Name</FieldLabel>
                  <TextInput
                    value={form.productName}
                    onChange={v => set({ productName: v })}
                    placeholder="e.g. Handcrafted Silk Dupatta"
                    autoFocus
                  />
                </div>

                <div>
                  <FieldLabel required>Price ({form.currency})</FieldLabel>
                  <TextInput
                    value={form.productPrice}
                    onChange={v => set({ productPrice: v })}
                    placeholder="e.g. 499"
                    type="number"
                  />
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={form.productDescription}
                    onChange={e => set({ productDescription: e.target.value })}
                    placeholder="Briefly describe the product…"
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNext3}
                    disabled={saveProduct.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
                  >
                    {saveProduct.isPending ? (
                      <><Upload className="w-4 h-4 animate-bounce" /> Saving…</>
                    ) : (
                      <>Add Product <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleSkipProduct}
                  className="w-full text-sm text-slate-400 hover:text-slate-600 transition py-1"
                >
                  Skip for now — I'll add products later
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Go Live! ────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="px-8 py-10 text-center">
            {/* Celebration */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-teal-100 animate-ping opacity-30" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-200">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {productSkipped ? 'Store Created! 🎉' : 'You\'re Live! 🚀'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {productSkipped
                ? 'Your store is ready. Add products to start receiving orders.'
                : 'Your store and first product are live. Time to share it!'}
            </p>

            {/* Store URL card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 mb-5 text-left">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Your Store URL</p>
              <p className="text-sm font-mono font-semibold text-teal-700 break-all">{storeUrl}</p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleCopyUrl}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                    copied
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700'
                  }`}
                >
                  {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                </button>
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 transition"
                >
                  <ExternalLink className="w-4 h-4" /> Visit Store
                </a>
              </div>

              {/* WhatsApp share */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🛍️ Check out my new online store — ${form.name}!\n\nShop here: ${storeUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition"
                style={{ backgroundColor: form.themeColor }}
              >
                <MessageCircle className="w-4 h-4" /> Share on WhatsApp
              </a>

              <button
                onClick={handleDone}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
