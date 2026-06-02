import { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Plus, Trash2, MessageCircle, Mail, Users,
  Sparkles, Copy, CheckCheck, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { marketingApi } from '../../api/marketing.api';
import apiClient from '../../api/client';

type Recipient = { name: string; phone: string; email: string };

type SegmentKey = 'all' | 'new' | 'repeat' | 'high_value' | 'inactive';

const SEGMENTS: { key: SegmentKey; label: string; desc: string }[] = [
  { key: 'all',        label: 'All Customers',  desc: 'Everyone in your list'       },
  { key: 'new',        label: 'New Customers',   desc: '1 order placed'              },
  { key: 'repeat',     label: 'Repeat Buyers',   desc: '2+ orders placed'            },
  { key: 'high_value', label: 'High Value',      desc: 'Spent ₹2,000+'               },
  { key: 'inactive',   label: 'Inactive',        desc: 'No orders yet / 0 orders'    },
];

const TEMPLATES: { icon: string; label: string; goal: string; tone: string; text: string }[] = [
  {
    icon: '🎉',
    label: 'Sale / Offer',
    goal: 'Announce a sale or discount offer',
    tone: 'Exciting',
    text: "Hey {name}! 🎉 Big sale happening NOW at our store — grab your favourites before they're gone! Shop here: {storeLink}",
  },
  {
    icon: '✨',
    label: 'New Arrival',
    goal: 'Announce new product arrivals',
    tone: 'Enthusiastic',
    text: "Hi {name}! ✨ We just got something new you'll love. Check out our latest arrivals — fresh stock, first come first served! 🛍️",
  },
  {
    icon: '💚',
    label: 'Follow-up',
    goal: 'Check in with customers after a purchase',
    tone: 'Warm and friendly',
    text: "Hey {name}! 😊 Just checking in — hope you're loving your recent order from us! Any questions or feedback? We're here to help.",
  },
  {
    icon: '🙏',
    label: 'Thank You',
    goal: 'Thank customers for their loyalty',
    tone: 'Grateful and warm',
    text: "Thank you so much, {name}! 🙏 Your support means the world to us. We truly appreciate your trust in us — see you again soon! ❤️",
  },
  {
    icon: '🛒',
    label: 'Abandoned Cart',
    goal: 'Re-engage customers who browsed but did not buy',
    tone: 'Friendly nudge',
    text: "Hey {name}, you left something behind! 👀 Come back and complete your order — your picks are still waiting for you. 🛒",
  },
  {
    icon: '🔄',
    label: 'Reorder Reminder',
    goal: 'Remind customers to reorder their favourites',
    tone: 'Helpful and casual',
    text: "Hi {name}! 🔄 Running low? Time to restock your favourites from us. Order now and we'll get it to you quickly!",
  },
  {
    icon: '🎊',
    label: 'Festival / Occasion',
    goal: 'Send festival greetings with a special offer',
    tone: 'Celebratory',
    text: "Wishing you a wonderful celebration, {name}! 🎊 We have special festival offers just for you — check them out today!",
  },
  {
    icon: '👋',
    label: 'Welcome Back',
    goal: 'Re-engage customers who have not shopped in a while',
    tone: 'Warm and inviting',
    text: "We miss you, {name}! 👋 It's been a while — come back and see what's new. We'd love to serve you again. 😊",
  },
];

// WhatsApp-style chat bubble preview
function WhatsAppPreview({ message }: { message: string }) {
  const preview = message
    .replace(/\{name\}/g, 'Rahul')
    .replace(/\{storeName\}/g, 'Your Store')
    .replace(/\{storeLink\}/g, 'wa.me/…');

  const lines = preview.split('\n');

  return (
    <div className="bg-[#e5ddd5] rounded-2xl p-4 min-h-[100px]">
      <p className="text-[10px] text-slate-500 mb-2 font-medium uppercase tracking-wide">Preview</p>
      <div className="flex justify-end">
        <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] shadow-sm">
          {lines.map((line, i) => (
            <p key={i} className="text-sm text-slate-800 leading-relaxed">
              {line || <br />}
            </p>
          ))}
          <p className="text-[10px] text-slate-400 text-right mt-1">Now ✓✓</p>
        </div>
      </div>
    </div>
  );
}

export function CampaignFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const defaultType = params.get('type') === 'email' ? 'Email' : 'WhatsApp';

  const [type, setType] = useState<'WhatsApp' | 'Email'>(defaultType as any);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [importMode, setImportMode] = useState<'manual' | 'customers'>('customers');
  const [segment, setSegment] = useState<SegmentKey>('all');
  const [showTemplates, setShowTemplates] = useState(true);
  const [aiGoal, setAiGoal] = useState('');
  const [aiTone, setAiTone] = useState('Friendly');
  const [aiExtra, setAiExtra] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load customers for segment filtering
  const { data: customersData } = useQuery({
    queryKey: ['customers-for-campaign'],
    queryFn: () => apiClient.get('/customers', { params: { pageSize: 500 } }).then(r => r.data),
  });
  const allCustomers: any[] = customersData?.items ?? [];

  const filteredCustomers = allCustomers.filter(c => {
    switch (segment) {
      case 'new':        return c.totalOrders === 1;
      case 'repeat':     return c.totalOrders >= 2;
      case 'high_value': return c.totalSpend >= 2000;
      case 'inactive':   return c.totalOrders === 0;
      default:           return true;
    }
  });

  const isSelected = (c: any) =>
    recipients.some(r => r.name === c.name && r.phone === (c.phoneNumber ?? ''));

  const toggleCustomer = (c: any) => {
    if (isSelected(c)) {
      setRecipients(prev => prev.filter(r => !(r.name === c.name && r.phone === (c.phoneNumber ?? ''))));
    } else {
      setRecipients(prev => [...prev, { name: c.name, phone: c.phoneNumber ?? '', email: c.email ?? '' }]);
    }
  };

  const selectSegment = () => {
    const toAdd = filteredCustomers.filter(c => !isSelected(c));
    setRecipients(prev => [
      ...prev,
      ...toAdd.map((c: any) => ({ name: c.name, phone: c.phoneNumber ?? '', email: c.email ?? '' })),
    ]);
  };

  const addManual = () => setRecipients(prev => [...prev, { name: '', phone: '', email: '' }]);
  const removeRecipient = (i: number) => setRecipients(prev => prev.filter((_, idx) => idx !== i));
  const updateRecipient = (i: number, field: keyof Recipient, value: string) => {
    setRecipients(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  // Insert variable at cursor position
  const insertVariable = (variable: string) => {
    const el = textareaRef.current;
    if (!el) { setMessage(m => m + variable); return; }
    const start = el.selectionStart ?? message.length;
    const end   = el.selectionEnd   ?? message.length;
    const newMsg = message.slice(0, start) + variable + message.slice(end);
    setMessage(newMsg);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setMessage(t.text);
    if (!title) setTitle(t.label + ' Campaign');
    setAiGoal(t.goal);
    setAiTone(t.tone);
    setShowTemplates(false);
  };

  // AI generate mutation
  const generateMutation = useMutation({
    mutationFn: () => marketingApi.generateMarketingMessage({ goal: aiGoal, tone: aiTone, extraContext: aiExtra || undefined }),
    onSuccess: (data) => { setMessage(data.message); setShowAiPanel(false); },
  });

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: () => marketingApi.createCampaign({
      title,
      type: type === 'WhatsApp' ? 1 : 2,
      message: message || undefined,
      subject: subject || undefined,
      recipients: recipients.filter(r => r.name),
    }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      navigate(`/marketing/campaigns/${data.id}`);
    },
  });

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message]);

  const isValid = title.trim() && message.trim() && recipients.filter(r => r.name).length > 0;
  const charCount = message.length;
  const charColor = charCount > 320 ? 'text-red-500' : charCount > 160 ? 'text-amber-500' : 'text-slate-400';

  return (
    <div className="max-w-2xl space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Campaign</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create a {type} campaign for your customers</p>
        </div>
      </div>

      {/* Type selector */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-3">Campaign Type</h2>
        <div className="grid grid-cols-2 gap-3">
          {(['WhatsApp', 'Email'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                type === t ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {t === 'WhatsApp'
                ? <MessageCircle className={`w-5 h-5 ${type === t ? 'text-teal-700' : 'text-slate-400'}`} />
                : <Mail        className={`w-5 h-5 ${type === t ? 'text-teal-700' : 'text-slate-400'}`} />}
              <span className={`font-medium text-sm ${type === t ? 'text-teal-900' : 'text-slate-600'}`}>{t}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Message builder */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-4">
          {type === 'WhatsApp' ? 'WhatsApp Message' : 'Email Content'}
        </h2>

        <Input
          label="Campaign Name *"
          placeholder="e.g. Eid Sale 2025"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="mb-4"
        />

        {type === 'Email' && (
          <Input
            label="Email Subject *"
            placeholder="e.g. Exclusive Eid offers just for you!"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="mb-4"
          />
        )}

        {/* Quick-start templates */}
        <button
          onClick={() => setShowTemplates(v => !v)}
          className="flex items-center justify-between w-full mb-3 text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          <span>📋 Quick-start templates</span>
          {showTemplates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTemplates && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {TEMPLATES.map(t => (
              <button
                key={t.label}
                onClick={() => applyTemplate(t)}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-left transition-all group"
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-xs font-medium text-slate-700 group-hover:text-teal-800">{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* AI generate panel */}
        <div className="mb-4">
          <button
            onClick={() => setShowAiPanel(v => !v)}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 hover:border-violet-400 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Generate with AI</span>
            {showAiPanel ? <ChevronUp className="w-4 h-4 ml-auto text-violet-400" /> : <ChevronDown className="w-4 h-4 ml-auto text-violet-400" />}
          </button>

          {showAiPanel && (
            <div className="mt-3 p-4 rounded-xl bg-violet-50 border border-violet-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Goal *</label>
                <input
                  value={aiGoal}
                  onChange={e => setAiGoal(e.target.value)}
                  placeholder="e.g. Announce a 20% off sale on all kurtas"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tone</label>
                  <select
                    value={aiTone}
                    onChange={e => setAiTone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  >
                    {['Friendly', 'Exciting', 'Formal', 'Casual', 'Urgent', 'Grateful', 'Playful'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Extra details (optional)</label>
                  <input
                    value={aiExtra}
                    onChange={e => setAiExtra(e.target.value)}
                    placeholder="e.g. ends Sunday"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => generateMutation.mutate()}
                loading={generateMutation.isPending}
                disabled={!aiGoal.trim()}
                className="bg-violet-600 hover:bg-violet-700 text-white border-0"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generate Message
              </Button>
              {generateMutation.isError && (
                <p className="text-xs text-red-500">AI generation failed. Please try again.</p>
              )}
            </div>
          )}
        </div>

        {/* Message textarea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700">
              {type === 'WhatsApp' ? 'Message *' : 'Email Body *'}
            </label>
            <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
              {copied ? <><CheckCheck className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
          <textarea
            ref={textareaRef}
            rows={5}
            placeholder={type === 'WhatsApp'
              ? "Hi {name}! 🎉 We have an exclusive offer just for you..."
              : "Dear {name},\n\nWe're excited to share our latest collection with you..."}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Insert:</span>
              {['{name}', '{storeName}', '{storeLink}'].map(v => (
                <button
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-800 font-mono transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
            <span className={`text-xs font-medium ${charColor}`}>{charCount} chars</span>
          </div>
        </div>

        {/* Live preview */}
        {message && type === 'WhatsApp' && (
          <div className="mt-4">
            <WhatsAppPreview message={message} />
          </div>
        )}
      </Card>

      {/* Recipients */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recipients <span className="text-teal-700 font-bold">({recipients.length})</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setImportMode('customers')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium ${importMode === 'customers' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              From Customers
            </button>
            <button
              onClick={() => setImportMode('manual')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium ${importMode === 'manual' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Add Manually
            </button>
          </div>
        </div>

        {importMode === 'customers' ? (
          <div>
            {/* Segment filter pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SEGMENTS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSegment(s.key)}
                  title={s.desc}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    segment === s.key
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                  {allCustomers.length > 0 && (
                    <span className={`ml-1.5 ${segment === s.key ? 'text-teal-200' : 'text-slate-400'}`}>
                      ({filteredCustomers.length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  {allCustomers.length === 0
                    ? 'No customers yet. Add customers or switch to manual mode.'
                    : 'No customers match this segment.'}
                </p>
              ) : (
                <>
                  <div className="flex gap-2 mb-2 sticky top-0 bg-white py-1">
                    <button
                      onClick={selectSegment}
                      className="text-xs text-teal-700 hover:underline font-medium"
                    >
                      Select all ({filteredCustomers.filter(c => !isSelected(c)).length} unselected)
                    </button>
                    <span className="text-slate-300">·</span>
                    <button onClick={() => setRecipients([])} className="text-xs text-slate-500 hover:underline">Clear all</button>
                  </div>
                  {filteredCustomers.map((c: any) => {
                    const selected = isSelected(c);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleCustomer(c)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                          selected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'border-teal-600 bg-teal-600' : 'border-slate-300'}`}>
                          {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.phoneNumber || c.email || '—'}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-slate-500">{c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''}</p>
                          {c.totalSpend > 0 && <p className="text-xs text-slate-400">₹{c.totalSpend.toLocaleString()}</p>}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recipients.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  placeholder="Name *"
                  value={r.name}
                  onChange={e => updateRecipient(i, 'name', e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  placeholder={type === 'WhatsApp' ? 'Phone *' : 'Email *'}
                  value={type === 'WhatsApp' ? r.phone : r.email}
                  onChange={e => updateRecipient(i, type === 'WhatsApp' ? 'phone' : 'email', e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button onClick={() => removeRecipient(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addManual}>
              <Plus className="w-4 h-4" /> Add Recipient
            </Button>
          </div>
        )}
      </Card>

      {createMutation.isError && (
        <p className="text-sm text-red-500">Failed to create campaign. Please try again.</p>
      )}

      <div className="flex gap-3">
        <Button disabled={!isValid} loading={createMutation.isPending} onClick={() => createMutation.mutate()}>
          Create Campaign
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
      </div>
    </div>
  );
}
