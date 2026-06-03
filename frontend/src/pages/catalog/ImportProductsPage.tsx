import { useState } from 'react';
import {
  Download, Search, Globe, ShoppingBag, CheckSquare,
  Square, AlertCircle, CheckCircle, ChevronRight,
  Loader2, ImageOff, Info,
} from 'lucide-react';
import { importApi } from '../../api/import.api';
import type { ImportedProductDto, ImportPreviewResponse } from '../../api/import.api';
import { formatCurrency } from '../../utils/formatCurrency';

type Source = 'shopify' | 'woocommerce' | 'scraper';

const TABS: { id: Source; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'shopify',     label: 'Shopify',     icon: <ShoppingBag className="w-4 h-4" />, color: '#96BF48' },
  { id: 'woocommerce', label: 'WooCommerce', icon: <ShoppingBag className="w-4 h-4" />, color: '#7F54B3' },
  { id: 'scraper',     label: 'Web Scraper', icon: <Globe className="w-4 h-4" />,       color: '#0F766E' },
];

export function ImportProductsPage() {
  const [source, setSource] = useState<Source>('shopify');

  // Form fields
  const [shopUrl,        setShopUrl]        = useState('');
  const [accessToken,    setAccessToken]     = useState('');
  const [siteUrl,        setSiteUrl]         = useState('');
  const [consumerKey,    setConsumerKey]     = useState('');
  const [consumerSecret, setConsumerSecret]  = useState('');

  // State
  const [loading,   setLoading]   = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview,   setPreview]   = useState<ImportPreviewResponse | null>(null);
  const [products,  setProducts]  = useState<ImportedProductDto[]>([]);
  const [result,    setResult]    = useState<{ imported: number; failed: number; errors: string[] } | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  const allSelected   = products.every(p => p.selected);
  const selectedCount = products.filter(p => p.selected).length;

  // ── Fetch preview ────────────────────────────────────────────────────────
  const handlePreview = async () => {
    setError(null); setResult(null); setPreview(null); setProducts([]);
    setLoading(true);
    try {
      const req =
        source === 'shopify'     ? { source, shopUrl: shopUrl.trim(), accessToken: accessToken.trim() } :
        source === 'woocommerce' ? { source, siteUrl: siteUrl.trim(), consumerKey: consumerKey.trim(), consumerSecret: consumerSecret.trim() } :
                                   { source, siteUrl: siteUrl.trim() };

      const res = await importApi.preview(req);
      setPreview(res);
      setProducts(res.products.map(p => ({ ...p, selected: true })));

      if (res.products.length === 0 && res.errors.length > 0) {
        setError(res.errors.join(' '));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  // ── Confirm import ────────────────────────────────────────────────────────
  const handleImport = async () => {
    const selected = products.filter(p => p.selected);
    if (!selected.length) return;
    setImporting(true); setError(null);
    try {
      const res = await importApi.confirm({ products: selected, createCategories: true });
      setResult(res);
      setProducts([]);
      setPreview(null);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const toggle = (idx: number) =>
    setProducts(ps => ps.map((p, i) => i === idx ? { ...p, selected: !p.selected } : p));

  const toggleAll = () =>
    setProducts(ps => ps.map(p => ({ ...p, selected: !allSelected })));

  const tab = TABS.find(t => t.id === source)!;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Import Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pull products from Shopify, WooCommerce, or any e-commerce website
          </p>
        </div>
        <Download className="w-8 h-8 text-slate-300" />
      </div>

      {/* Source tabs */}
      <div className="flex gap-2 bg-slate-100 rounded-2xl p-1.5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setSource(t.id); setPreview(null); setProducts([]); setResult(null); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              source === t.id
                ? 'bg-white shadow text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span style={{ color: source === t.id ? t.color : undefined }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Credentials form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: tab.color + '15', color: tab.color }}>
            {tab.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{tab.label} Connection</p>
            <p className="text-xs text-slate-400">
              {source === 'shopify'     && 'Enter your Shopify Admin API credentials'}
              {source === 'woocommerce' && 'Enter your WooCommerce REST API keys'}
              {source === 'scraper'     && 'Enter any e-commerce store URL to scan for products'}
            </p>
          </div>
        </div>

        {/* Shopify fields */}
        {source === 'shopify' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Shop URL</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="my-store.myshopify.com"
                value={shopUrl} onChange={e => setShopUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Admin API Access Token</label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="shpat_xxxxxxxxxxxxxx"
                value={accessToken} onChange={e => setAccessToken(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Go to your Shopify Admin → <strong>Settings → Apps and sales channels → Develop apps</strong> → Create an app → enable <em>read_products</em> scope → copy the Admin API access token.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* WooCommerce fields */}
        {source === 'woocommerce' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">WordPress Site URL</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://mystore.com"
                value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consumer Key</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="ck_xxxxxxxxxxxxxxxx"
                value={consumerKey} onChange={e => setConsumerKey(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consumer Secret</label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="cs_xxxxxxxxxxxxxxxx"
                value={consumerSecret} onChange={e => setConsumerSecret(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl text-xs text-purple-700">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Go to WooCommerce → <strong>Settings → Advanced → REST API</strong> → Add key → set Permissions to <em>Read</em> → copy Consumer Key and Consumer Secret.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scraper fields */}
        {source === 'scraper' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Store / Category URL</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://somestore.com or https://somestore.com/collections/all"
                value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>
                The scraper works best on sites that include <strong>JSON-LD structured data</strong> (schema.org/Product).
                Modern React/Vue SPAs that render products client-side <strong>may not be detected</strong>.
                Only use this for sites you own or have permission to crawl.
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handlePreview}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-all hover:opacity-90"
          style={{ backgroundColor: tab.color }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Fetching products...' : 'Fetch Products'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className="flex items-start gap-3 p-5 bg-green-50 border border-green-200 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">
              Import complete — {result.imported} product{result.imported !== 1 ? 's' : ''} added
              {result.failed > 0 && `, ${result.failed} failed`}
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs text-red-600">• {e}</li>
                ))}
              </ul>
            )}
            <a
              href="/catalog/products"
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-green-700 hover:underline"
            >
              View products <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Preview table */}
      {products.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Table header bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button onClick={toggleAll} className="text-slate-400 hover:text-slate-700 transition-colors">
                {allSelected
                  ? <CheckSquare className="w-4.5 h-4.5" />
                  : <Square className="w-4.5 h-4.5" />}
              </button>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {preview?.totalFound} products found
                </p>
                <p className="text-xs text-slate-400">
                  {selectedCount} selected
                  {preview?.categories.length ? ` · Categories: ${preview.categories.join(', ')}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleImport}
              disabled={importing || selectedCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-all hover:opacity-90"
              style={{ backgroundColor: tab.color }}
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {importing ? 'Importing...' : `Import ${selectedCount} Product${selectedCount !== 1 ? 's' : ''}`}
            </button>
          </div>

          {/* Product rows */}
          <div className="divide-y divide-slate-50">
            {products.map((p, idx) => (
              <div
                key={p.externalId + idx}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors cursor-pointer hover:bg-slate-50/60 ${
                  !p.selected ? 'opacity-50' : ''
                }`}
                onClick={() => toggle(idx)}
              >
                {/* Checkbox */}
                <span className="text-slate-400 flex-shrink-0">
                  {p.selected
                    ? <CheckSquare className="w-4 h-4 text-teal-600" />
                    : <Square className="w-4 h-4" />}
                </span>

                {/* Image */}
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-4 h-4 text-slate-300" />
                      </div>}
                </div>

                {/* Title + category */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                    )}
                    {p.sku && <span className="text-[10px] text-slate-400">SKU: {p.sku}</span>}
                    {p.stockQuantity != null && (
                      <span className="text-[10px] text-slate-400">Stock: {p.stockQuantity}</span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(p.discountedPrice ?? p.basePrice, 'INR')}
                  </p>
                  {p.discountedPrice && (
                    <p className="text-xs text-slate-400 line-through">
                      {formatCurrency(p.basePrice, 'INR')}
                    </p>
                  )}
                </div>

                {/* Image count badge */}
                {p.additionalImages.length > 0 && (
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    +{p.additionalImages.length} img
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Bottom import button (sticky feel) */}
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Images are stored as external URLs — re-upload via the product editor if needed.
            </p>
            <button
              onClick={handleImport}
              disabled={importing || selectedCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-all hover:opacity-90"
              style={{ backgroundColor: tab.color }}
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {importing ? 'Importing...' : `Import ${selectedCount} Selected`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
