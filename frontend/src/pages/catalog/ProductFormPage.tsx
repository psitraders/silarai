import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Upload, Trash2, Star, Plus, X, Sparkles, Package, Building2 } from 'lucide-react';
import { AiDescriptionPanel } from '../../components/ai/AiDescriptionPanel';
import { WholesaleTiersEditor } from '../../components/catalog/WholesaleTiersEditor';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { PageLoader } from '../../components/ui/Spinner';
import { catalogApi } from '../../api/catalog.api';
import apiClient from '../../api/client';
import type { ProductImageDto, SaveVariantDto } from '../../types/catalog.types';

// ── Variant editor ────────────────────────────────────────────────────────────
interface VariantRow extends SaveVariantDto {
  _key: string;
}

const COMMON_OPTIONS = ['Size', 'Color', 'Material', 'Style', 'Weight', 'Flavour'];

function VariantEditor({ variants, onChange }: { variants: VariantRow[]; onChange: (rows: VariantRow[]) => void }) {
  const groups = Array.from(new Set(variants.map(v => v.name)));

  const addGroup = () => {
    const name = prompt('Option name (e.g. Size, Color):')?.trim();
    if (!name) return;
    onChange([...variants, { _key: crypto.randomUUID(), name, value: '', priceAdjustment: undefined, stockQuantity: undefined, isAvailable: true }]);
  };

  const addValue = (groupName: string) =>
    onChange([...variants, { _key: crypto.randomUUID(), name: groupName, value: '', priceAdjustment: undefined, stockQuantity: undefined, isAvailable: true }]);

  const removeRow = (key: string) => onChange(variants.filter(v => v._key !== key));

  const updateRow = (key: string, patch: Partial<VariantRow>) =>
    onChange(variants.map(v => v._key === key ? { ...v, ...patch } : v));

  const removeGroup = (groupName: string) => onChange(variants.filter(v => v.name !== groupName));

  return (
    <div className="space-y-4">
      {groups.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          No variants yet. Add an option like Size or Color to offer multiple versions of this product.
        </p>
      )}

      {groups.map(groupName => (
        <div key={groupName} className="border border-slate-200 rounded-xl overflow-hidden">
          {/* Group header */}
          <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-700">{groupName}</span>
            <button type="button" onClick={() => removeGroup(groupName)} className="text-slate-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-4 py-1.5 bg-slate-50/50 border-b border-slate-100">
            <div className="col-span-3 text-xs font-medium text-slate-400">Value</div>
            <div className="col-span-3 text-xs font-medium text-slate-400">Price Adj (₹)</div>
            <div className="col-span-3 text-xs font-medium text-slate-400">Stock qty</div>
            <div className="col-span-2 text-xs font-medium text-slate-400">Available</div>
            <div className="col-span-1" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            {variants.filter(v => v.name === groupName).map(row => (
              <div key={row._key} className="grid grid-cols-12 gap-2 px-4 py-2 items-center bg-white">
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="e.g. Small"
                    value={row.value}
                    onChange={e => updateRow(row._key, { value: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="0"
                    step="0.01"
                    value={row.priceAdjustment ?? ''}
                    onChange={e => updateRow(row._key, { priceAdjustment: e.target.value !== '' ? Number(e.target.value) : undefined })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="∞"
                    min={0}
                    value={row.stockQuantity ?? ''}
                    onChange={e => updateRow(row._key, { stockQuantity: e.target.value !== '' ? Number(e.target.value) : undefined })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => updateRow(row._key, { isAvailable: !row.isAvailable })}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${row.isAvailable ? 'bg-teal-500' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${row.isAvailable ? 'translate-x-4' : ''}`} />
                  </button>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button type="button" onClick={() => removeRow(row._key)} className="text-slate-300 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-2 bg-white border-t border-slate-100">
            <button
              type="button"
              onClick={() => addValue(groupName)}
              className="flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add {groupName} value
            </button>
          </div>
        </div>
      ))}

      {/* Quick-add common option chips + custom */}
      <div className="flex flex-wrap gap-2">
        {COMMON_OPTIONS.filter(opt => !groups.includes(opt)).map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => addValue(opt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 hover:border-teal-400 hover:text-teal-700 transition-colors"
          >
            <Plus className="w-3 h-3" /> {opt}
          </button>
        ))}
        <button
          type="button"
          onClick={addGroup}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 hover:border-teal-400 hover:text-teal-700 transition-colors"
        >
          <Plus className="w-3 h-3" /> Custom option...
        </button>
      </div>
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────
interface FormValues {
  title: string;
  description: string;
  basePrice: number;
  discountedPrice: number | '';
  status: string;
  isFeatured: boolean;
  categoryId: string;
  stockQuantity: number | '';
  tags: string;
  attributes: string;
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<ProductImageDto[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogApi.getProduct(id!),
    enabled: isEdit,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { status: 'Draft', isFeatured: false },
  });

  const [showAiPanel, setShowAiPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'wholesale'>('details');

  const watchedStock = watch('stockQuantity');
  const watchedStatus = watch('status');
  // Show a hint when the store owner sets stock to 0 while the product is Active
  const willAutoOutOfStock =
    watchedStatus === 'Active' &&
    watchedStock !== '' &&
    Number(watchedStock) <= 0;

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description ?? '',
        basePrice: product.basePrice,
        discountedPrice: product.discountedPrice ?? '',
        status: product.status,
        isFeatured: product.isFeatured,
        categoryId: product.categoryId ?? '',
        stockQuantity: product.stockQuantity ?? '',
        tags: product.tags?.join(', ') ?? '',
        attributes: product.attributes ?? '',
      });
      setLocalImages((product as any)?.images ?? []);
      // Seed variant editor from existing variants
      const existingVariants: VariantRow[] = ((product as any)?.variants ?? []).map((v: any) => ({
        _key: crypto.randomUUID(),
        name: v.name,
        value: v.value,
        priceAdjustment: v.priceAdjustment ?? undefined,
        stockQuantity: v.stockQuantity ?? undefined,
        isAvailable: v.isAvailable ?? true,
      }));
      setVariants(existingVariants);
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const variantPayload: SaveVariantDto[] = variants
        .filter(v => v.name.trim() && v.value.trim())
        .map(({ _key, ...rest }) => rest);

      const payload = {
        ...values,
        basePrice: Number(values.basePrice),
        discountedPrice: values.discountedPrice !== '' ? Number(values.discountedPrice) : undefined,
        stockQuantity: values.stockQuantity !== '' ? Number(values.stockQuantity) : undefined,
        categoryId: values.categoryId || undefined,
        tags: (values.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        variants: variantPayload,
      };
      return isEdit
        ? catalogApi.updateProduct(id!, payload as any)
        : catalogApi.createProduct(payload as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      if (id) qc.invalidateQueries({ queryKey: ['product', id] });
      navigate('/catalog/products');
    },
  });

  const saveError = mutation.isError
    ? (() => {
        const err = mutation.error as any;
        const serverMsg =
          err?.response?.data?.errors?.[0] ??
          err?.response?.data?.message ??
          err?.response?.data?.title;
        return serverMsg || 'Something went wrong. Please try again.';
      })()
    : null;

  // ── Image upload ─────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !id) return;
    setUploadingImage(true);
    setImageError(null);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        const { data: newImage } = await apiClient.post(`/products/${id}/images`, form, {
          headers: { 'Content-Type': undefined },
        });
        setLocalImages(prev => [...prev, newImage]);
      }
    } catch (err: any) {
      setImageError(err?.response?.data?.errors?.[0] ?? 'Upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => apiClient.delete(`/products/${id}/images/${imageId}`),
    onSuccess: (_, imageId) => {
      setLocalImages(prev => {
        const remaining = prev.filter(img => img.id !== imageId);
        const wasDeleted = prev.find(img => img.id === imageId);
        if (wasDeleted?.isPrimary && remaining.length > 0)
          return remaining.map((img, idx) => idx === 0 ? { ...img, isPrimary: true } : img);
        return remaining;
      });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (imageId: string) => apiClient.put(`/products/${id}/images/${imageId}/primary`, {}),
    onSuccess: (_, imageId) => {
      setLocalImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === imageId })));
    },
  });

  if (isEdit && loadingProduct) return <PageLoader />;

  // Build flat options: parent categories + their subcategories indented with ↳
  const categoryOptions = [
    { value: '', label: 'No category' },
    ...categories.flatMap(c => [
      { value: c.id, label: c.name },
      ...(c.subCategories ?? []).map(sub => ({
        value: sub.id,
        label: `  ↳ ${sub.name}`,
      })),
    ]),
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{isEdit ? 'Update product details' : 'Add a new product to your catalog'}</p>
        </div>
      </div>

      {/* Tabs — only when editing an existing product */}
      {isEdit && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'details' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Product Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wholesale')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'wholesale' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> B2B Wholesale
          </button>
        </div>
      )}

      {/* ── B2B Wholesale tab ── */}
      {isEdit && activeTab === 'wholesale' && id && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-700">
            <p className="font-semibold mb-0.5">Wholesale / Quantity-break Pricing</p>
            <p className="text-xs text-indigo-600">
              Set tiered prices for B2B buyers. These override the standard price when a buyer
              orders within the specified quantity range on your storefront.
            </p>
          </div>
          <WholesaleTiersEditor productId={id} />
        </div>
      )}

      {/* ── Product Details form (hidden when on wholesale tab) ── */}
      <form
        onSubmit={handleSubmit(v => mutation.mutate(v))}
        className={`space-y-6 ${isEdit && activeTab === 'wholesale' ? 'hidden' : ''}`}
      >
        {/* Basic Info */}
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Basic Info</h2>
          <div className="space-y-4">
            <Input label="Product Title *" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />

            {/* Description + AI panel */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <button
                  type="button"
                  onClick={() => setShowAiPanel(v => !v)}
                  disabled={!watch('title')?.trim()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-violet-500 text-white hover:from-teal-600 hover:to-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {showAiPanel ? 'Hide AI' : 'Write with AI'}
                </button>
              </div>
              <Textarea rows={4} {...register('description')} />
              {!watch('title')?.trim() && (
                <p className="text-xs text-slate-400 mt-1">Enter a product title to unlock AI suggestions.</p>
              )}

              {showAiPanel && watch('title')?.trim() && (
                <AiDescriptionPanel
                  productTitle={watch('title')}
                  onSelect={text => {
                    setValue('description', text, { shouldDirty: true });
                  }}
                  onClose={() => setShowAiPanel(false)}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Base Price (₹) *" type="number" step="0.01" error={errors.basePrice?.message} {...register('basePrice', { required: 'Price is required', min: 0 })} />
              <Input label="Discounted Price (₹)" type="number" step="0.01" {...register('discountedPrice')} />
            </div>
            <div>
              <Input
                label="Stock Quantity"
                type="number"
                min={0}
                disabled={variants.length > 0}
                placeholder={variants.length > 0 ? 'Managed per variant below' : undefined}
                {...register('stockQuantity', { valueAsNumber: true })}
              />
              {variants.length > 0 && (
                <p className="mt-1 text-xs text-slate-400">
                  Stock is managed individually per variant below.
                </p>
              )}
              {variants.length === 0 && willAutoOutOfStock && (
                <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                  ⚠️ Stock is 0 — this product will automatically be marked <strong>Out of Stock</strong> when saved.
                </p>
              )}
              {variants.length === 0 && !willAutoOutOfStock && (watchedStock === '' || watchedStock === null) && (
                <p className="mt-1 text-xs text-slate-400">Leave blank for unlimited stock (no tracking).</p>
              )}
            </div>
          </div>
        </Card>

        {/* Variants */}
        <Card>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-slate-900">Variants</h2>
            {variants.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{variants.length} option{variants.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-2">Add size, color, or any other options customers can choose from.</p>

          {/* Red ordering rule */}
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
            <span className="text-red-500 text-sm leading-none mt-0.5">⚠️</span>
            <p className="text-xs text-red-600 font-medium leading-relaxed">
              Always add size variants in <strong>increasing order</strong> — e.g. XS → S → M → L → XL → XXL. The first variant is shown as the default on your storefront and its stock is tracked separately.
            </p>
          </div>

          <VariantEditor variants={variants} onChange={setVariants} />
        </Card>

        {/* Organisation */}
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Organisation</h2>
          <div className="space-y-4">
            <Select label="Category" options={categoryOptions} {...register('categoryId')} />
            <Select
              label="Status"
              options={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Active', label: 'Active' },
                { value: 'Archived', label: 'Archived' },
              ]}
              {...register('status')}
            />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" {...register('isFeatured')} className="rounded" />
              <label htmlFor="featured" className="text-sm text-slate-700">Featured product (shown at top of storefront)</label>
            </div>
            <Input label="Tags (comma-separated)" placeholder="e.g. summer, kurti, cotton" {...register('tags')} />
          </div>
        </Card>

        {/* Product Images (edit-only) */}
        {isEdit && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Product Images</h2>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                <Button type="button" variant="outline" size="sm" loading={uploadingImage} onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Image
                </Button>
              </div>
            </div>

            {imageError && <p className="text-sm text-red-500 mb-3">{imageError}</p>}

            {localImages.length === 0 ? (
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center cursor-pointer hover:border-slate-300 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click to upload your first product image</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — max 10 MB</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {localImages.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={img.url} alt={img.altText ?? ''} className="w-full h-full object-cover" />
                    {img.isPrimary && (
                      <div className="absolute top-1 left-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5" /> Primary
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.isPrimary && (
                        <button type="button" title="Set as primary" onClick={() => setPrimaryMutation.mutate(img.id)} className="p-1.5 bg-white/90 rounded-lg text-amber-500 hover:bg-white">
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button type="button" title="Delete image" onClick={() => deleteImageMutation.mutate(img.id)} className="p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs">Add</span>
                </button>
              </div>
            )}
          </Card>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={mutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>

        {saveError && <p className="text-sm text-red-500">{saveError}</p>}
      </form>

    </div>
  );
}
