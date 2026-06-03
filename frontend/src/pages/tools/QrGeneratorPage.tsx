import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { businessApi } from '../../api/business.api';

// QR generation using the free QR API (no npm package needed)
function QrImage({ url, size = 256 }: { url: string; size?: number }) {
  const encoded = encodeURIComponent(url);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10&color=0f766e`;
  return (
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-xl border border-slate-100"
    />
  );
}

const STORE_BASE = window.location.origin;

export function QrGeneratorPage() {
  const [tab, setTab]             = useState<'store' | 'product' | 'custom'>('store');
  const [customUrl, setCustomUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [copied, setCopied]       = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const { data: storefront } = useQuery({
    queryKey: ['storefront-settings'],
    queryFn: businessApi.getStorefrontSettings,
  });

  const storeUrl  = storefront?.slug ? `${STORE_BASE}/${storefront.slug}` : '';
  const activeUrl = tab === 'store' ? storeUrl : tab === 'product' ? productUrl : customUrl;
  const isValid   = activeUrl.length > 5;

  const copyUrl = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    if (!isValid) return;
    const encoded = encodeURIComponent(activeUrl);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encoded}&margin=15&color=0f766e`;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.png';
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.click();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-teal-600" />
          QR Code Generator
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate QR codes for your store, products, or any link — print on packaging, posters, or visiting cards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left: options */}
        <Card>
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
            {(['store', 'product', 'custom'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${tab === t ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'store' ? '🏪 My Store' : t === 'product' ? '📦 Product' : '🔗 Custom'}
              </button>
            ))}
          </div>

          {tab === 'store' && (
            <div>
              <p className="text-sm text-slate-500 mb-3">QR code for your public storefront:</p>
              {storeUrl ? (
                <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm font-mono text-teal-700 break-all">{storeUrl}</div>
              ) : (
                <p className="text-sm text-amber-600">Set up your store slug in Settings → Storefront first.</p>
              )}
            </div>
          )}

          {tab === 'product' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Enter the product page URL:</p>
              <Input
                label="Product URL"
                placeholder={`${STORE_BASE}/your-store/products/123`}
                value={productUrl}
                onChange={e => setProductUrl(e.target.value)}
              />
            </div>
          )}

          {tab === 'custom' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Enter any URL (WhatsApp link, Instagram, website):</p>
              <Input
                label="URL"
                placeholder="https://wa.me/91XXXXXXXXXX"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
              />
            </div>
          )}

          {isValid && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-500 flex-1 break-all font-mono">{activeUrl}</span>
                <button onClick={copyUrl} className="flex-shrink-0 text-slate-400 hover:text-teal-600 transition">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={downloadQr}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
              >
                <Download className="w-4 h-4" /> Download QR (512×512)
              </button>
            </div>
          )}
        </Card>

        {/* Right: QR Preview */}
        <div className="flex flex-col items-center justify-center gap-4">
          {isValid ? (
            <>
              <div ref={imgRef} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <QrImage url={activeUrl} size={200} />
              </div>
              <p className="text-xs text-slate-400 text-center">
                Scan to visit · Print-ready at 512×512px
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 w-full">
              <QrCode className="w-12 h-12 text-slate-200" />
              <p className="text-sm text-slate-400 text-center">Your QR code will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <Card>
        <h3 className="font-semibold text-slate-900 mb-3">💡 How to use QR codes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📦', title: 'Product Packaging', desc: 'Print on tags or stickers so customers can reorder easily' },
            { icon: '🖼️', title: 'In-Store Poster', desc: 'Let walk-in customers browse and order from your online store' },
            { icon: '💌', title: 'Visiting Card', desc: 'Add your store QR so new contacts can instantly view your products' },
          ].map(tip => (
            <div key={tip.title} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-700">{tip.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
