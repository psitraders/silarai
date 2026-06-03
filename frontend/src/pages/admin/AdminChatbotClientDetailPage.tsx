import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bot, ArrowLeft, Copy, Check, RefreshCw, Plus, Trash2,
  Save, Code, Package, Settings, Send, MessageCircle,
  ShoppingBag, Upload, RefreshCcw, Pencil, X, CheckCircle2,
} from 'lucide-react';
import apiClient from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';

const API_BASE = (import.meta.env.VITE_API_URL as string || '')
  .replace(/\/api\/v1\/?$/, '');
const APP_URL = (import.meta.env.VITE_APP_URL as string || '').replace(/\/$/, '');

// ── Platform icons ────────────────────────────────────────────────────────────
const WhatsAppIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface ChatbotProduct {
  id: string; title: string; description: string | null;
  price: number; salePrice: number | null; variants: string | null;
  imageUrl: string | null; category: string | null; isAvailable: boolean;
}
interface ChatbotClientDetail {
  id: string; name: string; businessDesc: string; apiKey: string;
  currency: string; language: string; contactEmail: string | null;
  contactPhone: string | null; webhookUrl: string | null; logoUrl: string | null;
  welcomeMessage: string | null; isActive: boolean; createdAt: string;
  products: ChatbotProduct[];
  waPhoneNumberId: string | null; waAccessToken: string | null;
  waPhoneNumber: string | null; waBusinessId: string | null;
  fbPageId: string | null; fbPageAccessToken: string | null;
  igAccountId: string | null; igAccessToken: string | null;
  shopifyDomain: string | null; shopifyApiKey: string | null;
  lastShopifySync: string | null;
}
type Tab = 'products' | 'channels' | 'catalog' | 'settings' | 'embed';

// ── Input helper ──────────────────────────────────────────────────────────────
const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white';

export function AdminChatbotClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('products');
  const [copied, setCopied] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [testReply, setTestReply] = useState('');

  const { data: client, isLoading } = useQuery<ChatbotClientDetail>({
    queryKey: ['admin-chatbot-client', id],
    queryFn: () => apiClient.get(`/admin/chatbot-clients/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const regenMutation = useMutation({
    mutationFn: () => apiClient.post(`/admin/chatbot-clients/${id}/regenerate-key`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-chatbot-client', id] }),
  });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const testMutation = useMutation({
    mutationFn: () => apiClient.post(`/chatbot/${client?.apiKey}/message`, { sessionId: 'admin-test', message: testMsg }),
    onSuccess: (res) => setTestReply(res.data.reply),
  });

  if (isLoading) return <PageLoader />;
  if (!client) return <div className="p-8 text-slate-500">Client not found.</div>;

  const embedCode = `<script>
  window.RCChatbotConfig = {
    apiKey: "${client.apiKey}",
    apiBase: "${API_BASE}",
  };
</script>
<script src="${APP_URL}/chatbot-widget.js" async></script>`;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'channels', label: 'Channels', icon: MessageCircle },
    { id: 'catalog',  label: 'Catalog Sync', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'embed',    label: 'Embed', icon: Code },
  ];

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-chatbot-client', id] });

  return (
    <div className="max-w-4xl space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/chatbot-clients')}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center">
          <Bot className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate">{client.name}</h1>
          <p className="text-sm text-slate-400">{client.contactEmail ?? client.contactPhone ?? 'No contact info'}</p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${client.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {client.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* ── API Key ── */}
      <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">API Key</p>
          <code className="text-sm text-teal-400 font-mono truncate block">{client.apiKey}</code>
        </div>
        <button onClick={() => copy(client.apiKey, 'key')}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          {copied === 'key' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
        </button>
        <button onClick={() => confirm('Regenerate key? Old key stops working immediately.') && regenMutation.mutate()}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <RefreshCw className={`w-4 h-4 text-slate-400 ${regenMutation.isPending ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Channel pills ── */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'WhatsApp', active: !!client.waPhoneNumberId, icon: <WhatsAppIcon />, color: 'green' },
          { label: 'Facebook', active: !!client.fbPageId,        icon: <FacebookIcon />,   color: 'blue' },
          { label: 'Instagram', active: !!client.igAccountId,   icon: <InstagramIcon />,  color: 'pink' },
          { label: 'Shopify',  active: !!client.shopifyDomain,  icon: <ShoppingBag className="w-3.5 h-3.5" />, color: 'orange' },
          { label: 'Widget',   active: true,                    icon: <Code className="w-3.5 h-3.5" />,       color: 'teal' },
        ].map(({ label, active, icon, color }) => {
          const on: Record<string, string> = {
            green: 'bg-green-50 text-green-700 border-green-200',
            blue:  'bg-blue-50 text-blue-700 border-blue-200',
            pink:  'bg-pink-50 text-pink-700 border-pink-200',
            orange:'bg-orange-50 text-orange-700 border-orange-200',
            teal:  'bg-teal-50 text-teal-700 border-teal-200',
          };
          return (
            <span key={label} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${active ? on[color] : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              {icon} {label} {active ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-slate-300">—</span>}
            </span>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-0 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === 'products' && <ProductsTab client={client} onRefresh={refresh} />}
      {tab === 'channels' && <ChannelsTab client={client} onRefresh={refresh} />}
      {tab === 'catalog'  && <CatalogTab  client={client} onRefresh={refresh} />}
      {tab === 'settings' && <SettingsTab client={client} onRefresh={refresh} />}
      {tab === 'embed' && (
        <div className="space-y-4">
          <Card>
            <p className="text-sm font-semibold text-slate-700 mb-1">Embed on any website</p>
            <p className="text-xs text-slate-400 mb-3">Paste before <code className="bg-slate-100 px-1 rounded">&lt;/body&gt;</code></p>
            <div className="relative">
              <pre className="bg-slate-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed">{embedCode}</pre>
              <button onClick={() => copy(embedCode, 'embed')}
                className="absolute top-3 right-3 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                {copied === 'embed' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              </button>
            </div>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-slate-700 mb-3">Test the AI</p>
            <div className="flex gap-2">
              <input value={testMsg} onChange={e => setTestMsg(e.target.value)}
                placeholder="Type a test message…"
                onKeyDown={e => e.key === 'Enter' && testMsg && testMutation.mutate()}
                className={inp} />
              <Button type="button" loading={testMutation.isPending} disabled={!testMsg} onClick={() => testMutation.mutate()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {testReply && (
              <div className="mt-3 bg-teal-50 border border-teal-100 rounded-xl p-3 text-sm text-teal-800">
                <p className="text-xs font-semibold text-teal-500 mb-1">AI Reply</p>
                {testReply}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Products Tab — clean table + inline add/edit ───────────────────────────────
function emptyProduct(): Partial<ChatbotProduct> {
  return { title: '', price: 0, isAvailable: true, description: '', category: '', variants: '', salePrice: null };
}

function ProductsTab({ client, onRefresh }: { client: ChatbotClientDetail; onRefresh: () => void }) {
  const [products, setProducts] = useState<Partial<ChatbotProduct>[]>(client.products);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Partial<ChatbotProduct>>(emptyProduct());
  const [saved, setSaved] = useState(false);

  const saveMutation = useMutation({
    mutationFn: () => apiClient.put(`/admin/chatbot-clients/${client.id}/products`, products),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); onRefresh(); },
  });

  const set = (k: string, v: unknown) => setDraft(d => ({ ...d, [k]: v }));

  function openAdd() { setDraft(emptyProduct()); setEditIdx(null); setAdding(true); }
  function openEdit(idx: number) { setDraft({ ...products[idx] }); setEditIdx(idx); setAdding(false); }
  function cancelDraft() { setAdding(false); setEditIdx(null); }

  function commitDraft() {
    if (!draft.title?.trim()) return;
    if (adding) {
      setProducts(p => [...p, draft]);
    } else if (editIdx !== null) {
      setProducts(p => p.map((x, i) => i === editIdx ? draft : x));
    }
    setAdding(false); setEditIdx(null);
  }

  function remove(idx: number) {
    setProducts(p => p.filter((_, i) => i !== idx));
    if (editIdx === idx) { setAdding(false); setEditIdx(null); }
  }

  const showForm = adding || editIdx !== null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{products.length}</span> products
          {products.length === 0 && <span className="ml-1">— add manually or use <strong>Catalog Sync</strong></span>}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Product
          </Button>
          <Button type="button" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            <Save className="w-4 h-4 mr-1.5" /> Save
          </Button>
        </div>
      </div>
      {saved && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Products saved!</p>}

      {/* Add / Edit form */}
      {showForm && (
        <Card className="border-teal-200 bg-teal-50/40">
          <p className="text-sm font-semibold text-slate-700 mb-4">{adding ? 'Add Product' : 'Edit Product'}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600">Title *</label>
              <input value={draft.title ?? ''} onChange={e => set('title', e.target.value)}
                placeholder="Product name" className={`mt-1 ${inp}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Price ({client.currency})</label>
              <input type="number" value={draft.price ?? 0} onChange={e => set('price', parseFloat(e.target.value) || 0)}
                className={`mt-1 ${inp}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Sale Price (optional)</label>
              <input type="number" value={draft.salePrice ?? ''} placeholder="Leave empty if no sale"
                onChange={e => set('salePrice', e.target.value ? parseFloat(e.target.value) : null)}
                className={`mt-1 ${inp}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Category</label>
              <input value={draft.category ?? ''} onChange={e => set('category', e.target.value)}
                placeholder="e.g. T-Shirts" className={`mt-1 ${inp}`} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Variants</label>
              <input value={draft.variants ?? ''} onChange={e => set('variants', e.target.value)}
                placeholder="S, M, L, XL" className={`mt-1 ${inp}`} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600">Description</label>
              <input value={draft.description ?? ''} onChange={e => set('description', e.target.value)}
                placeholder="Short description for the AI to use" className={`mt-1 ${inp}`} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600">Image URL</label>
              <div className="flex gap-2 mt-1">
                <input value={draft.imageUrl ?? ''} onChange={e => set('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg" className={inp} />
                {draft.imageUrl && (
                  <img src={draft.imageUrl} alt="preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={draft.isAvailable ?? true}
                onChange={e => set('isAvailable', e.target.checked)}
                className="w-4 h-4 rounded accent-teal-600" />
              <span className="text-sm text-slate-700">Show in AI catalog</span>
            </label>
            <div className="flex-1" />
            <button onClick={cancelDraft}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={commitDraft}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700">
              <Check className="w-4 h-4" /> {adding ? 'Add' : 'Update'}
            </button>
          </div>
        </Card>
      )}

      {/* Product table */}
      {products.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Price</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p, idx) => (
                <tr key={idx} className={`transition-colors ${editIdx === idx ? 'bg-teal-50' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                            onError={e => (e.currentTarget.style.display = 'none')} />
                        : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-slate-300" />
                          </div>
                      }
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{p.title || <span className="text-slate-400 italic">Untitled</span>}</p>
                        {p.variants && <p className="text-xs text-slate-400 mt-0.5">Variants: {p.variants}</p>}
                        {p.description && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.category
                      ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{p.category}</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.salePrice
                      ? <div>
                          <span className="font-semibold text-slate-800">{client.currency} {p.salePrice}</span>
                          <span className="text-xs text-slate-400 line-through ml-1">{p.price}</span>
                        </div>
                      : <span className="font-semibold text-slate-800">{client.currency} {p.price}</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isAvailable ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.isAvailable ? 'Live' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !showForm && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No products yet</p>
            <p className="text-sm text-slate-400 mt-1">Add manually or sync from Shopify / CSV</p>
            <button onClick={openAdd}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700">
              <Plus className="w-4 h-4" /> Add First Product
            </button>
          </div>
        )
      )}
    </div>
  );
}

// ── Channels Tab ──────────────────────────────────────────────────────────────
function ChannelsTab({ client, onRefresh }: { client: ChatbotClientDetail; onRefresh: () => void }) {
  const [form, setForm] = useState({
    waPhoneNumberId: client.waPhoneNumberId ?? '', waAccessToken: client.waAccessToken ?? '',
    waPhoneNumber: client.waPhoneNumber ?? '',     waBusinessId: client.waBusinessId ?? '',
    fbPageId: client.fbPageId ?? '',               fbPageAccessToken: client.fbPageAccessToken ?? '',
    igAccountId: client.igAccountId ?? '',         igAccessToken: client.igAccessToken ?? '',
  });
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: () => apiClient.put(`/admin/chatbot-clients/${client.id}`, {
      name: client.name, businessDesc: client.businessDesc, currency: client.currency,
      language: client.language, webhookUrl: client.webhookUrl, contactEmail: client.contactEmail,
      contactPhone: client.contactPhone, logoUrl: client.logoUrl, welcomeMessage: client.welcomeMessage,
      ...form,
      shopifyDomain: client.shopifyDomain, shopifyApiKey: client.shopifyApiKey,
    }),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); onRefresh(); },
  });

  return (
    <div className="space-y-4">
      {/* WhatsApp */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center text-white"><WhatsAppIcon /></div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">WhatsApp Business</p>
            <p className="text-xs text-slate-400">Customer messages → AI replies automatically</p>
          </div>
          {client.waPhoneNumberId && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">Connected ✓</span>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PField label="Phone Number ID *" value={form.waPhoneNumberId} onChange={v => set('waPhoneNumberId', v)} placeholder="116894353629536" hint="Meta Developer → WhatsApp → API Setup" />
          <PField label="Display Number" value={form.waPhoneNumber} onChange={v => set('waPhoneNumber', v)} placeholder="+91 98765 43210" />
          <PField label="WABA ID" value={form.waBusinessId} onChange={v => set('waBusinessId', v)} placeholder="WhatsApp Business Account ID" />
          <div />
          <div className="col-span-2">
            <PField label="Permanent Access Token *" value={form.waAccessToken} onChange={v => set('waAccessToken', v)} placeholder="EAAVcyre…" password hint="Meta Business Manager → System Users → permanent token" />
          </div>
        </div>
        <InfoBox color="amber" title="Webhook URL to set in Meta">
          <code className="text-amber-800 font-mono">{API_BASE}/api/v1/webhooks/whatsapp</code>
        </InfoBox>
      </Card>

      {/* Facebook */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white"><FacebookIcon /></div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">Facebook Messenger</p>
            <p className="text-xs text-slate-400">Facebook Page messages → AI replies automatically</p>
          </div>
          {client.fbPageId && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">Connected ✓</span>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PField label="Facebook Page ID *" value={form.fbPageId} onChange={v => set('fbPageId', v)} placeholder="1161400803718669" hint="Facebook Page → About → Page ID" />
          <div />
          <div className="col-span-2">
            <PField label="Page Access Token *" value={form.fbPageAccessToken} onChange={v => set('fbPageAccessToken', v)} placeholder="EAAVcyre…" password hint="Graph API Explorer with pages_messaging permission" />
          </div>
        </div>
        <InfoBox color="blue" title="Webhook to configure">
          <span>Callback URL: <code className="font-mono">{API_BASE}/api/v1/webhooks/facebook</code></span><br />
          <span>Verify Token: <code className="font-mono">replycart-fb-verify</code> · Subscribe: <code className="font-mono">messages</code></span>
        </InfoBox>
      </Card>

      {/* Instagram */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white"><InstagramIcon /></div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">Instagram DMs</p>
            <p className="text-xs text-slate-400">Instagram Direct Messages → AI replies automatically</p>
          </div>
          {client.igAccountId && <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2.5 py-1 rounded-full font-medium">Connected ✓</span>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PField label="Instagram Account ID *" value={form.igAccountId} onChange={v => set('igAccountId', v)} placeholder="17841400000000000" hint="Meta Developer → Instagram → Basic Display" />
          <div />
          <div className="col-span-2">
            <PField label="Access Token *" value={form.igAccessToken} onChange={v => set('igAccessToken', v)} placeholder="EAAVcyre…" password hint="Same Page Access Token as Facebook" />
          </div>
        </div>
        <InfoBox color="pink" title="Webhook to configure">
          <span>Callback URL: <code className="font-mono">{API_BASE}/api/v1/webhooks/instagram</code></span><br />
          <span>Verify Token: <code className="font-mono">replycart-ig-verify</code> · Subscribe: <code className="font-mono">messages</code></span>
        </InfoBox>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
          <Save className="w-4 h-4 mr-1.5" /> Save All Channels
        </Button>
        {saved && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved!</p>}
      </div>
    </div>
  );
}

// ── Catalog Tab ───────────────────────────────────────────────────────────────
function CatalogTab({ client, onRefresh }: { client: ChatbotClientDetail; onRefresh: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [shopifyDomain, setShopifyDomain] = useState(client.shopifyDomain ?? '');
  const [shopifyApiKey, setShopifyApiKey] = useState(client.shopifyApiKey ?? '');
  const [shopifySaved, setShopifySaved] = useState(false);
  const [csvResult, setCsvResult] = useState('');

  const saveCreds = useMutation({
    mutationFn: () => apiClient.put(`/admin/chatbot-clients/${client.id}`, {
      name: client.name, businessDesc: client.businessDesc, currency: client.currency,
      language: client.language, webhookUrl: client.webhookUrl, contactEmail: client.contactEmail,
      contactPhone: client.contactPhone, logoUrl: client.logoUrl, welcomeMessage: client.welcomeMessage,
      waPhoneNumberId: client.waPhoneNumberId, waAccessToken: client.waAccessToken,
      waPhoneNumber: client.waPhoneNumber, waBusinessId: client.waBusinessId,
      fbPageId: client.fbPageId, fbPageAccessToken: client.fbPageAccessToken,
      igAccountId: client.igAccountId, igAccessToken: client.igAccessToken,
      shopifyDomain, shopifyApiKey,
    }),
    onSuccess: () => { setShopifySaved(true); setTimeout(() => setShopifySaved(false), 2500); onRefresh(); },
  });

  const syncShopify = useMutation({
    mutationFn: () => apiClient.post(`/admin/chatbot-clients/${client.id}/sync-shopify`),
    onSuccess: (res) => { onRefresh(); alert(`✅ Synced ${res.data.synced} products from Shopify!`); },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Sync failed';
      alert(`❌ ${msg}`);
    },
  });

  const uploadCsv = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData(); fd.append('file', file);
      return apiClient.post(`/admin/chatbot-clients/${client.id}/import-csv`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => { setCsvResult(`✅ Imported ${res.data.imported} products!`); onRefresh(); },
    onError: () => setCsvResult('❌ Import failed. Check CSV format.'),
  });

  function downloadSampleCsv() {
    const rows = [
      ['title', 'description', 'price', 'sale_price', 'category', 'variants', 'image_url'],
      ['Cotton Kurti', 'Comfortable everyday wear', '599', '499', 'Kurtis', 'S, M, L, XL', ''],
      ['Silk Saree', 'Traditional Banarasi silk', '2999', '', 'Sarees', 'Red, Blue, Green', ''],
      ['Denim Jeans', 'Slim fit stretchable denim', '1299', '999', 'Bottomwear', '28, 30, 32, 34', ''],
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sample-products.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Shopify */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">Shopify Sync</p>
            <p className="text-xs text-slate-400">Pull products automatically from their Shopify store</p>
          </div>
          {client.lastShopifySync && (
            <span className="text-xs text-slate-400">Last sync: {new Date(client.lastShopifySync).toLocaleDateString()}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <PField label="Store Domain" value={shopifyDomain} onChange={setShopifyDomain}
              placeholder="mystore.myshopify.com" hint="Do not include https://" />
          </div>
          <div className="col-span-2">
            <PField label="Admin API Access Token" value={shopifyApiKey} onChange={setShopifyApiKey}
              placeholder="shpat_xxxxxxxxxxxxx" password
              hint="Shopify Admin → Settings → Apps → Develop apps → Admin API access token" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <Button type="button" variant="outline" loading={saveCreds.isPending} onClick={() => saveCreds.mutate()}>
            <Save className="w-4 h-4 mr-1.5" /> Save Credentials
          </Button>
          <Button type="button" loading={syncShopify.isPending} disabled={!shopifyDomain || !shopifyApiKey}
            onClick={() => syncShopify.mutate()}>
            <RefreshCcw className="w-4 h-4 mr-1.5" /> Sync Now
          </Button>
          {shopifySaved && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved!</span>}
        </div>
      </Card>

      {/* CSV */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-slate-600 flex items-center justify-center text-white">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">CSV Import</p>
            <p className="text-xs text-slate-400">Upload a spreadsheet to bulk-import products</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <code className="text-xs text-slate-500">title, description, price, sale_price, category, variants, image_url</code>
          <button type="button" onClick={downloadSampleCsv} className="text-xs text-teal-600 hover:underline ml-3 shrink-0">
            Download sample
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".csv" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadCsv.mutate(f); }} />
        <Button type="button" variant="outline" loading={uploadCsv.isPending} onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1.5" /> Choose CSV File
        </Button>
        {csvResult && <p className="mt-3 text-sm">{csvResult}</p>}
      </Card>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ client, onRefresh }: { client: ChatbotClientDetail; onRefresh: () => void }) {
  const [form, setForm] = useState({
    name: client.name, businessDesc: client.businessDesc, currency: client.currency,
    language: client.language, contactEmail: client.contactEmail ?? '',
    contactPhone: client.contactPhone ?? '', webhookUrl: client.webhookUrl ?? '',
    logoUrl: client.logoUrl ?? '', welcomeMessage: client.welcomeMessage ?? '',
  });
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: () => apiClient.put(`/admin/chatbot-clients/${client.id}`, {
      ...form,
      waPhoneNumberId: client.waPhoneNumberId, waAccessToken: client.waAccessToken,
      waPhoneNumber: client.waPhoneNumber, waBusinessId: client.waBusinessId,
      fbPageId: client.fbPageId, fbPageAccessToken: client.fbPageAccessToken,
      igAccountId: client.igAccountId, igAccessToken: client.igAccessToken,
      shopifyDomain: client.shopifyDomain, shopifyApiKey: client.shopifyApiKey,
    }),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); onRefresh(); },
  });

  return (
    <Card>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <PField label="Business Name *" value={form.name} onChange={v => set('name', v)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Currency</label>
          <select value={form.currency} onChange={e => set('currency', e.target.value)} className={`mt-1 ${inp}`}>
            <option value="INR">INR ₹</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
            <option value="GBP">GBP £</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Language</label>
          <select value={form.language} onChange={e => set('language', e.target.value)} className={`mt-1 ${inp}`}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-slate-700">Business Description</label>
          <textarea value={form.businessDesc} onChange={e => set('businessDesc', e.target.value)} rows={2}
            placeholder="What does this business do? The AI uses this to answer customer queries."
            className={`mt-1 ${inp} resize-none`} />
        </div>
        <PField label="Contact Email" value={form.contactEmail} onChange={v => set('contactEmail', v)} />
        <PField label="Contact Phone" value={form.contactPhone} onChange={v => set('contactPhone', v)} />
        <div className="col-span-2">
          <PField label="Welcome Message" value={form.welcomeMessage} onChange={v => set('welcomeMessage', v)}
            placeholder="Hi! Welcome to our store. How can I help you?" />
        </div>
        <div className="col-span-2">
          <PField label="Order Webhook URL" value={form.webhookUrl} onChange={v => set('webhookUrl', v)}
            placeholder="https://theirstore.com/api/orders/new"
            hint="We POST confirmed order JSON here automatically" />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
        <Button type="button" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
          <Save className="w-4 h-4 mr-1.5" /> Save Settings
        </Button>
        {saved && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved!</p>}
      </div>
    </Card>
  );
}

// ── Reusable field ────────────────────────────────────────────────────────────
function PField({ label, value, onChange, placeholder, hint, password }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; password?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative mt-1">
        <input type={password && !show ? 'password' : 'text'} value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`${inp} ${password ? 'pr-14' : ''}`} />
        {password && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-medium">
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Info box ──────────────────────────────────────────────────────────────────
function InfoBox({ color, title, children }: { color: string; title: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-100 text-amber-800',
    blue:  'bg-blue-50 border-blue-100 text-blue-800',
    pink:  'bg-pink-50 border-pink-100 text-pink-800',
  };
  return (
    <div className={`mt-4 p-3 rounded-xl border text-xs leading-relaxed ${colors[color]}`}>
      <p className="font-semibold mb-1">{title}</p>
      {children}
    </div>
  );
}
