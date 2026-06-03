import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, MessageCircle, Send, Trash2, Edit2, Eye, X, CheckCircle,
  Loader2, Users, Sparkles, AlertCircle, ToggleLeft, ToggleRight, RefreshCw,
  Search, UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { businessApi, type WaTemplateDto, type CreateWaTemplateRequest } from '../../api/business.api';
import { customersApi, type CustomerDto } from '../../api/customers.api';

// ── Inline toast ──────────────────────────────────────────────────────────────
type ToastEntry = { id: number; msg: string; type: 'success' | 'error' };
let _toastId = 0;
function useToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = ++_toastId;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, toast: show };
}

// ── Category badge colours ────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  MARKETING:      'bg-purple-100 text-purple-700',
  UTILITY:        'bg-blue-100 text-blue-700',
  AUTHENTICATION: 'bg-amber-100 text-amber-700',
  TRANSACTIONAL:  'bg-teal-100 text-teal-700',
};

// ── Helper: preview body with mock values ─────────────────────────────────────
function previewBody(body: string, params: string[]): string {
  let result = body;
  params.forEach((p, i) => {
    result = result.replace(`{{${i + 1}}}`, `*${p || `Param${i + 1}`}*`);
  });
  return result;
}

// ── Count variables in body ───────────────────────────────────────────────────
function countVariables(body: string): number {
  const matches = body.match(/\{\{\d+\}\}/g);
  if (!matches) return 0;
  const indices = new Set(matches.map(m => parseInt(m.replace(/\D/g, ''))));
  return indices.size;
}

// ── Blank form state ──────────────────────────────────────────────────────────
const BLANK_FORM: CreateWaTemplateRequest & { isActive: boolean } = {
  name: '',
  displayName: '',
  category: 'MARKETING',
  language: 'en_US',
  body: '',
  headerText: '',
  footerText: '',
  isActive: true,
};

// ── Seed template library ─────────────────────────────────────────────────────
interface SeedTemplate {
  name: string;
  displayName: string;
  category: string;
  language: string;
  body: string;
  headerText?: string;
  footerText?: string;
  hint: string;
}

const SEED_TEMPLATES: SeedTemplate[] = [
  // ── TRANSACTIONAL ──────────────────────────────────────────────────────────
  {
    name: 'order_confirmed',
    displayName: 'Order Confirmed',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Hi {{1}}! 🎉 Your order #{{2}} has been confirmed. We\'ll update you when it ships. Thank you for shopping with us!',
    footerText: 'Reply HELP for support',
    hint: 'Sent when an order is placed',
  },
  {
    name: 'order_shipped',
    displayName: 'Order Shipped',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Great news {{1}}! 🚚 Your order #{{2}} is on its way. Track it here: {{3}}',
    hint: 'Sent when order is dispatched',
  },
  {
    name: 'order_delivered',
    displayName: 'Order Delivered',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Hey {{1}}! ✅ Your order #{{2}} has been delivered. We hope you love it! Drop us a review 💬',
    hint: 'Sent on delivery',
  },
  {
    name: 'order_cancelled',
    displayName: 'Order Cancelled',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Hi {{1}}, your order #{{2}} has been cancelled as requested. Any refund will be processed in 3–5 business days. Need help? Just reply here.',
    hint: 'Cancellation confirmation with refund info',
  },
  {
    name: 'payment_received',
    displayName: 'Payment Received',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Hi {{1}}! ✅ We\'ve received your payment of ₹{{2}} for order #{{3}}. Your order is now being processed. 🙏',
    hint: 'Payment confirmation after online payment',
  },
  {
    name: 'cod_confirmation',
    displayName: 'COD Order Confirmation',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Hi {{1}}! Your Cash on Delivery order #{{2}} worth ₹{{3}} is confirmed. Please keep the exact amount ready at delivery. 💵',
    hint: 'COD order confirmation',
  },
  {
    name: 'return_initiated',
    displayName: 'Return Initiated',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Hi {{1}}! 📦 Your return request for order #{{2}} has been initiated. Our team will arrange a pickup within 48 hours. Thank you for your patience!',
    hint: 'Return/refund initiation',
  },
  {
    name: 'shipping_delay',
    displayName: 'Shipping Delay Alert',
    category: 'TRANSACTIONAL',
    language: 'en_US',
    body: 'Hi {{1}}, we\'re sorry for the delay! 🙏 Your order #{{2}} is running a little late. New expected delivery: {{3}}. We appreciate your patience.',
    hint: 'Proactive delay notification',
  },
  {
    name: 'payment_link',
    displayName: 'Payment Link',
    category: 'UTILITY',
    language: 'en_US',
    body: 'Hi {{1}}, here\'s your payment link for ₹{{2}} 👇\n{{3}}\n\nPlease complete payment within 24 hours to confirm your order.',
    hint: 'Send a payment link to customer',
  },
  // ── MARKETING ──────────────────────────────────────────────────────────────
  {
    name: 'cart_reminder',
    displayName: 'Cart Reminder',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Hey {{1}} 👋 You left something behind! Complete your purchase and get it delivered fast. Tap to go back to your cart 🛒',
    hint: 'Abandoned cart recovery',
  },
  {
    name: 'birthday_wish',
    displayName: 'Birthday Wish',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Happy Birthday {{1}}! 🎂🎉 As a special gift, use code BDAY20 for 20% off your next order. Valid today only!',
    hint: 'Birthday greetings with discount',
  },
  {
    name: 'anniversary_wish',
    displayName: 'Anniversary Offer',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Happy Anniversary {{1}}! 💍 Celebrate your special day with {{2}}% off on our entire collection. Use code: {{3}}. Valid for 48 hours!',
    hint: 'Wedding/purchase anniversary offer',
  },
  {
    name: 'flash_sale',
    displayName: 'Flash Sale',
    category: 'MARKETING',
    language: 'en_US',
    body: '🔥 FLASH SALE, {{1}}! Get {{2}}% OFF on everything. Use code {{3}} at checkout. Hurry — offer ends in 24 hours! 👉 Shop now',
    hint: 'Limited-time flash sale broadcast',
  },
  {
    name: 'new_product_launch',
    displayName: 'New Product Launch',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Hey {{1}}! 🎉 We just launched something amazing — *{{2}}*! Be among the first to grab it. Limited stock available.',
    hint: 'New product announcement',
  },
  {
    name: 'festive_offer',
    displayName: 'Festive Season Offer',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Happy {{1}}! 🎊 Celebrate the season with {{2}}% off sitewide. Use code *{{3}}* at checkout. Offer valid till {{4}}. Don\'t miss out!',
    footerText: 'Reply STOP to unsubscribe',
    hint: 'Diwali / Eid / Christmas / New Year offer',
  },
  {
    name: 'restock_alert',
    displayName: 'Back in Stock Alert',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Hey {{1}}! 📦 Great news — *{{2}}* is back in stock! This was flying off the shelves last time. Grab it before it sells out again 👇',
    hint: 'Notify customers when product restocks',
  },
  {
    name: 'loyalty_points',
    displayName: 'Loyalty Points Reminder',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Hi {{1}}! 💎 You have *{{2}} loyalty points* worth ₹{{3}} sitting unused. Redeem them on your next order and save big!',
    hint: 'Remind customers of unused loyalty points',
  },
  {
    name: 'referral_offer',
    displayName: 'Referral Program',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Hi {{1}}! 🎁 Love shopping with us? Share your referral code *{{2}}* with friends. They get 10% off their first order, and you earn ₹{{3}} store credit!',
    hint: 'Referral program invite',
  },
  {
    name: 'win_back',
    displayName: 'Win-Back Campaign',
    category: 'MARKETING',
    language: 'en_US',
    body: 'We miss you, {{1}}! 💛 It\'s been a while since your last order. Here\'s a special 15% OFF just for you — use code *{{2}}*. Come back and shop! 🛍️',
    footerText: 'Reply STOP to unsubscribe',
    hint: 'Re-engage inactive customers',
  },
  {
    name: 'vip_welcome',
    displayName: 'VIP Member Welcome',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Welcome to our VIP club, {{1}}! 🌟 As a VIP member, you get exclusive early access to launches, special discounts, and priority support. Thank you for being amazing! 🙏',
    hint: 'Welcome message for top customers',
  },
  {
    name: 'review_request',
    displayName: 'Review Request',
    category: 'MARKETING',
    language: 'en_US',
    body: 'Hi {{1}}! 🌟 Loved your order? We\'d love to hear from you! A quick review takes just 30 seconds and means the world to us. Tap here 👉 {{2}}',
    hint: 'Ask for a product review after delivery',
  },
  // ── UTILITY ────────────────────────────────────────────────────────────────
  {
    name: 'appointment_reminder',
    displayName: 'Appointment Reminder',
    category: 'UTILITY',
    language: 'en_US',
    body: 'Hi {{1}}! 📅 Reminder: Your appointment is scheduled for *{{2}}* at *{{3}}*. Reply YES to confirm or call us to reschedule.',
    hint: 'Appointment or booking reminder',
  },
  {
    name: 'support_ticket_received',
    displayName: 'Support Ticket Received',
    category: 'UTILITY',
    language: 'en_US',
    body: 'Hi {{1}}! 🙏 Your support request #{{2}} has been received. Our team will get back to you within 24 hours. You can reply here anytime.',
    hint: 'Auto-reply on support ticket creation',
  },
  {
    name: 'custom_message',
    displayName: 'Custom Announcement',
    category: 'UTILITY',
    language: 'en_US',
    body: 'Hi {{1}}, {{2}}',
    hint: 'Generic custom message / announcement',
  },
];

const SEED_CATEGORIES = ['ALL', 'MARKETING', 'TRANSACTIONAL', 'UTILITY'] as const;

// ── Recipient mode type ───────────────────────────────────────────────────────
type RecipientMode = 'all' | 'pick' | 'manual';

// ─────────────────────────────────────────────────────────────────────────────
export function WaTemplatesPage() {
  const qc = useQueryClient();
  const { toasts, toast } = useToast();

  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [previewTemplate, setPreview]   = useState<WaTemplateDto | null>(null);
  const [sendModal, setSendModal]       = useState<WaTemplateDto | null>(null);
  const [form, setForm]                 = useState({ ...BLANK_FORM });
  const [showLibrary, setShowLibrary]   = useState(false);
  const [libCategory, setLibCategory]   = useState<typeof SEED_CATEGORIES[number]>('ALL');

  // Send modal state
  const [recipientMode, setRecipientMode]     = useState<RecipientMode>('all');
  const [sendPhones, setSendPhones]           = useState('');
  const [sendParams, setSendParams]           = useState<string[]>([]);
  const [customerSearch, setCustomerSearch]   = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set()); // phone numbers

  // ── Queries / mutations ──────────────────────────────────────────────────────
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['wa-templates'],
    queryFn: businessApi.getWaTemplates,
  });

  // Customers — only fetched when modal is open in pick mode
  const { data: customerPage, isLoading: customersLoading } = useQuery({
    queryKey: ['customers-wa', customerSearch],
    queryFn: () => customersApi.getAll({ search: customerSearch, pageSize: 100, page: 1 }),
    enabled: sendModal !== null && recipientMode === 'pick',
    staleTime: 30_000,
  });
  const customers: CustomerDto[] = customerPage?.items ?? [];

  const createMutation = useMutation({
    mutationFn: businessApi.createWaTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wa-templates'] });
      toast('Template created and submitted to Meta for approval!');
      closeForm();
    },
    onError: () => toast('Failed to create template', 'error'),
  });

  const syncMutation = useMutation({
    mutationFn: businessApi.syncWaTemplates,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['wa-templates'] });
      toast(res.message);
    },
    onError: () => toast('Failed to sync templates from Meta', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWaTemplateRequest> & { isActive?: boolean } }) =>
      businessApi.updateWaTemplate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wa-templates'] });
      toast('Template updated!');
      closeForm();
    },
    onError: () => toast('Failed to update template', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: businessApi.deleteWaTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wa-templates'] });
      toast('Template deleted');
    },
    onError: () => toast('Failed to delete template', 'error'),
  });

  const sendMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof businessApi.sendWaCampaign>[1] }) =>
      businessApi.sendWaCampaign(id, data),
    onSuccess: (res) => {
      toast(res.message);
      setSendModal(null);
    },
    onError: () => toast('Failed to send campaign', 'error'),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function openCreate() {
    setEditingId(null);
    setForm({ ...BLANK_FORM });
    setShowForm(true);
    setShowLibrary(false);
  }

  function openEdit(t: WaTemplateDto) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      displayName: t.displayName,
      category: t.category,
      language: t.language,
      body: t.body,
      headerText: t.headerText ?? '',
      footerText: t.footerText ?? '',
      isActive: t.isActive,
    });
    setShowForm(true);
    setShowLibrary(false);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...BLANK_FORM });
  }

  function handleSubmit() {
    if (!form.name.trim()) { toast('Template name is required', 'error'); return; }
    if (!form.body.trim()) { toast('Message body is required', 'error'); return; }

    const payload = {
      name: form.name.trim(),
      displayName: form.displayName?.trim() || form.name.trim(),
      category: form.category,
      language: form.language,
      body: form.body.trim(),
      headerText: form.headerText?.trim() || undefined,
      footerText: form.footerText?.trim() || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { ...payload, isActive: form.isActive } });
    } else {
      createMutation.mutate(payload);
    }
  }

  function loadSeed(seed: SeedTemplate) {
    setForm(f => ({
      ...f,
      name:        seed.name,
      displayName: seed.displayName,
      category:    seed.category,
      language:    seed.language,
      body:        seed.body,
      headerText:  seed.headerText ?? '',
      footerText:  seed.footerText ?? '',
      isActive:    true,
    }));
    setShowLibrary(false);
    setShowForm(true);
  }

  function openSend(t: WaTemplateDto) {
    setSendModal(t);
    setRecipientMode('all');
    setSendPhones('');
    setSendParams(Array(countVariables(t.body)).fill(''));
    setSelectedCustomers(new Set());
    setCustomerSearch('');
  }

  function toggleCustomer(phone: string) {
    setSelectedCustomers(prev => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  }

  function handleSend() {
    if (!sendModal) return;

    let phoneNumbers: string[] | undefined;

    if (recipientMode === 'all') {
      phoneNumbers = undefined; // backend sends to all customers
    } else if (recipientMode === 'pick') {
      if (selectedCustomers.size === 0) {
        toast('Please select at least one customer', 'error');
        return;
      }
      phoneNumbers = Array.from(selectedCustomers);
    } else {
      const phones = sendPhones.split(',').map(p => p.trim()).filter(Boolean);
      if (phones.length === 0) {
        toast('Please enter at least one phone number', 'error');
        return;
      }
      phoneNumbers = phones;
    }

    sendMutation.mutate({
      id: sendModal.id,
      data: {
        phoneNumbers,
        templateParams: sendParams.filter(Boolean).length > 0 ? sendParams : undefined,
      },
    });
  }

  const isSaving  = createMutation.isPending || updateMutation.isPending;
  const varCount  = countVariables(form.body);
  const filteredSeeds = libCategory === 'ALL'
    ? SEED_TEMPLATES
    : SEED_TEMPLATES.filter(s => s.category === libCategory);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Inline toasts ──────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto ${
            t.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {t.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">WhatsApp Templates</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Create templates and submit to Meta for approval · {templates.length} template{templates.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" loading={syncMutation.isPending} onClick={() => syncMutation.mutate()}>
            <RefreshCw className="w-4 h-4" /> Sync from Meta
          </Button>
          <Button variant="outline" onClick={() => { setShowLibrary(l => !l); setShowForm(false); }}>
            <Sparkles className="w-4 h-4" /> Library
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </div>
      </div>

      {/* ── Template Library Panel ─────────────────────────────────────────────── */}
      {showLibrary && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900">Template Library</h2>
              <p className="text-xs text-slate-500">{SEED_TEMPLATES.length} ready-made templates — click to pre-fill the form</p>
            </div>
            <button onClick={() => setShowLibrary(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {SEED_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setLibCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  libCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-500 border border-purple-100 hover:border-purple-300'
                }`}
              >
                {cat === 'ALL' ? `All (${SEED_TEMPLATES.length})` : `${cat} (${SEED_TEMPLATES.filter(s => s.category === cat).length})`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredSeeds.map(seed => (
              <button
                key={seed.name}
                onClick={() => loadSeed(seed)}
                className="text-left bg-white border border-purple-100 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[seed.category] ?? 'bg-slate-100 text-slate-600'}`}>
                    {seed.category}
                  </span>
                </div>
                <p className="font-semibold text-sm text-slate-900 mb-1 group-hover:text-purple-700 transition-colors">{seed.displayName}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2">{seed.hint}</p>
                <p className="text-[10px] text-purple-500 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to use →
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Create / Edit Form ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">{editingId ? 'Edit Template' : 'New Template'}</h2>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Template Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. order_confirmed"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">Lowercase + underscores only. Auto-submitted to Meta.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Display Name</label>
              <input
                value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="e.g. Order Confirmed"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                {['MARKETING', 'UTILITY', 'AUTHENTICATION', 'TRANSACTIONAL'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Language</label>
              <select
                value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                {[
                  { code: 'en_US', label: 'English (US)' },
                  { code: 'en_GB', label: 'English (UK)' },
                  { code: 'hi',    label: 'Hindi' },
                  { code: 'ar',    label: 'Arabic' },
                  { code: 'es',    label: 'Spanish' },
                  { code: 'pt_BR', label: 'Portuguese (BR)' },
                  { code: 'fr',    label: 'French' },
                  { code: 'id',    label: 'Indonesian' },
                ].map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Header (optional)</label>
            <input
              value={form.headerText}
              onChange={e => setForm(f => ({ ...f, headerText: e.target.value }))}
              placeholder="Short heading above the message"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Message Body *&nbsp;
              <span className="normal-case text-slate-400 font-normal">
                — use &#123;&#123;1&#125;&#125; &#123;&#123;2&#125;&#125; … for variables ({varCount} detected)
              </span>
            </label>
            <textarea
              rows={4}
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Hi {{1}}! Your order #{{2}} is confirmed. 🎉"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Footer (optional)</label>
            <input
              value={form.footerText}
              onChange={e => setForm(f => ({ ...f, footerText: e.target.value }))}
              placeholder="e.g. Reply STOP to unsubscribe"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {form.body && (
            <div className="bg-[#e5ddd5] rounded-2xl p-4">
              <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">Preview</p>
              <div className="bg-white rounded-xl rounded-tl-sm p-3 max-w-xs shadow-sm text-sm text-slate-800 whitespace-pre-wrap">
                {form.headerText && <p className="font-bold mb-1">{form.headerText}</p>}
                <p>{previewBody(form.body, Array.from({ length: varCount }, (_, i) => `Sample${i + 1}`))}</p>
                {form.footerText && <p className="text-[11px] text-slate-400 mt-2">{form.footerText}</p>}
              </div>
            </div>
          )}

          {editingId && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`flex items-center gap-2 text-sm font-medium ${form.isActive ? 'text-teal-600' : 'text-slate-400'}`}
              >
                {form.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {form.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} loading={isSaving}>
              {editingId ? 'Save Changes' : 'Create Template'}
            </Button>
            <Button variant="outline" onClick={closeForm}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── Template List ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : templates.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-green-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No templates yet</h3>
          <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto">
            Create your first WhatsApp template or pick one from the library to get started.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Template</Button>
            <Button variant="outline" onClick={() => setShowLibrary(true)}><Sparkles className="w-4 h-4" /> Library</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            const varC = countVariables(t.body);
            return (
              <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-slate-900">{t.displayName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[t.category] ?? 'bg-slate-100 text-slate-600'}`}>
                        {t.category}
                      </span>
                      {!t.isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">INACTIVE</span>
                      )}
                      {t.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">DEFAULT</span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.metaStatus === 'APPROVED'  ? 'bg-green-100 text-green-700' :
                        t.metaStatus === 'PENDING'   ? 'bg-yellow-100 text-yellow-700' :
                        t.metaStatus === 'REJECTED'  ? 'bg-red-100 text-red-600' :
                        t.metaStatus === 'PAUSED'    ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {t.metaStatus === 'LOCAL' ? 'NOT SUBMITTED' : t.metaStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1">{t.name}</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{t.body}</p>
                    {varC > 0 && (
                      <p className="text-[11px] text-slate-400 mt-1">{varC} variable{varC > 1 ? 's' : ''} · {t.language.toUpperCase()}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setPreview(t)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition" title="Preview">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${t.displayName}"?`)) deleteMutation.mutate(t.id); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openSend(t)}
                      disabled={!t.isActive || t.metaStatus !== 'APPROVED'}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition ml-1"
                      title={t.metaStatus !== 'APPROVED' ? `Template is ${t.metaStatus} — must be APPROVED by Meta` : 'Send Campaign'}
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Preview Modal ──────────────────────────────────────────────────────── */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{previewTemplate.displayName}</h3>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-[#e5ddd5] rounded-2xl p-4">
              <div className="bg-white rounded-xl rounded-tl-sm p-3 max-w-xs shadow-sm text-sm text-slate-800 whitespace-pre-wrap">
                {previewTemplate.headerText && <p className="font-bold mb-1">{previewTemplate.headerText}</p>}
                <p>{previewBody(
                  previewTemplate.body,
                  Array.from({ length: countVariables(previewTemplate.body) }, (_, i) => `Sample${i + 1}`)
                )}</p>
                {previewTemplate.footerText && <p className="text-[11px] text-slate-400 mt-2">{previewTemplate.footerText}</p>}
              </div>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p><span className="font-semibold">Template:</span> {previewTemplate.name}</p>
              <p><span className="font-semibold">Category:</span> {previewTemplate.category}</p>
              <p><span className="font-semibold">Language:</span> {previewTemplate.language.toUpperCase()}</p>
            </div>
            <Button onClick={() => { setPreview(null); openSend(previewTemplate); }} className="w-full">
              <Send className="w-4 h-4" /> Send Campaign
            </Button>
          </div>
        </div>
      )}

      {/* ── Send Campaign Modal ────────────────────────────────────────────────── */}
      {sendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Send Campaign</h3>
                <p className="text-xs text-slate-400">{sendModal.displayName}</p>
              </div>
              <button onClick={() => setSendModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            {/* ── Recipient Mode Selector ─────────────────────────────────────── */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Recipients
              </label>

              <div className="grid grid-cols-3 gap-2">
                {([
                  { mode: 'all'    as RecipientMode, label: 'All Customers', icon: Users,       desc: 'Broadcast to every customer with a phone number' },
                  { mode: 'pick'   as RecipientMode, label: 'Pick Customers', icon: UserCheck,  desc: 'Search and select specific customers' },
                  { mode: 'manual' as RecipientMode, label: 'Custom Numbers', icon: MessageCircle, desc: 'Enter phone numbers manually' },
                ]).map(({ mode, label, icon: Icon, desc }) => (
                  <button
                    key={mode}
                    onClick={() => setRecipientMode(mode)}
                    title={desc}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      recipientMode === mode
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* All Customers */}
              {recipientMode === 'all' && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-sm text-teal-700 flex items-center gap-2">
                  <Users className="w-4 h-4 shrink-0" />
                  Campaign will be sent to <strong>all customers</strong> who have a phone number.
                </div>
              )}

              {/* Pick Customers */}
              {recipientMode === 'pick' && (
                <div className="space-y-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      placeholder="Search by name or phone…"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Select All / count */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-slate-500">
                      {customersLoading ? 'Loading…' : `${customers.length} customers found`}
                    </span>
                    {customers.length > 0 && (
                      <button
                        onClick={() => {
                          const allPhones = customers.filter(c => c.phoneNumber).map(c => c.phoneNumber);
                          const allSelected = allPhones.every(p => selectedCustomers.has(p));
                          if (allSelected) {
                            setSelectedCustomers(new Set());
                          } else {
                            setSelectedCustomers(new Set(allPhones));
                          }
                        }}
                        className="text-xs text-teal-600 font-semibold hover:underline"
                      >
                        {customers.filter(c => c.phoneNumber).every(c => selectedCustomers.has(c.phoneNumber))
                          ? 'Deselect all'
                          : 'Select all'}
                      </button>
                    )}
                  </div>

                  {/* Customer list */}
                  <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                    {customersLoading ? (
                      <div className="p-4 text-center text-sm text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                        Loading customers…
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-400">No customers found</div>
                    ) : (
                      customers.map(c => {
                        const phone = c.phoneNumber;
                        const checked = phone ? selectedCustomers.has(phone) : false;
                        return (
                          <label key={c.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${!phone ? 'opacity-40 pointer-events-none' : ''}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => phone && toggleCustomer(phone)}
                              className="rounded accent-teal-600"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                              <p className="text-xs text-slate-400">{phone || 'No phone'}</p>
                            </div>
                            {c.totalOrders > 0 && (
                              <span className="text-[10px] text-slate-400 shrink-0">{c.totalOrders} orders</span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>

                  {selectedCustomers.size > 0 && (
                    <p className="text-xs text-teal-600 font-semibold">
                      ✓ {selectedCustomers.size} customer{selectedCustomers.size !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

              {/* Manual Numbers */}
              {recipientMode === 'manual' && (
                <div className="space-y-1">
                  <textarea
                    rows={2}
                    value={sendPhones}
                    onChange={e => setSendPhones(e.target.value)}
                    placeholder="91XXXXXXXXXX, 91YYYYYYYYYY"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                  />
                  <p className="text-[11px] text-slate-400">Comma-separated. Include country code (e.g. 91 for India).</p>
                </div>
              )}
            </div>

            {/* Template variable fills */}
            {countVariables(sendModal.body) > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Template Variables</label>
                {Array.from({ length: countVariables(sendModal.body) }, (_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 w-8">{`{{${i + 1}}}`}</span>
                    <input
                      value={sendParams[i] ?? ''}
                      onChange={e => {
                        const arr = [...sendParams];
                        arr[i] = e.target.value;
                        setSendParams(arr);
                      }}
                      placeholder={`Value for variable ${i + 1}`}
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Live preview */}
            <div className="bg-[#e5ddd5] rounded-xl p-3">
              <p className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Preview</p>
              <div className="bg-white rounded-xl rounded-tl-sm p-2.5 text-sm text-slate-800 whitespace-pre-wrap">
                {sendModal.headerText && <p className="font-bold mb-1">{sendModal.headerText}</p>}
                <p>{previewBody(sendModal.body, sendParams)}</p>
                {sendModal.footerText && <p className="text-[11px] text-slate-400 mt-1">{sendModal.footerText}</p>}
              </div>
            </div>

            {/* Meta approval badge */}
            <div className="flex gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-700">
                Template <strong>{sendModal.name}</strong> is <strong>APPROVED</strong> by Meta and ready to send via WhatsApp Cloud API.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSend} loading={sendMutation.isPending} className="flex-1">
                {sendMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send Campaign</>}
              </Button>
              <Button variant="outline" onClick={() => setSendModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom info card ──────────────────────────────────────────────────── */}
      {templates.length > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-lg shadow-green-100">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-white flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Templates sent via Meta WhatsApp Cloud API</p>
              <p className="text-xs text-green-100">
                New templates are submitted to Meta automatically. Click "Sync from Meta" to refresh approval statuses.
              </p>
            </div>
          </div>
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-green-700 rounded-xl text-sm font-bold hover:bg-green-50 transition whitespace-nowrap shadow disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Status
          </button>
        </div>
      )}
    </div>
  );
}
