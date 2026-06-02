import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MessageCircle, Save, CheckCircle2, XCircle, Copy, Send,
  ChevronDown, ChevronUp, Palette, Eye, EyeOff, Zap, CreditCard, Trash2,
} from 'lucide-react';

// Instagram and Facebook removed from newer lucide-react — inline SVGs
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { businessApi, type IntegrationSettingsDto } from '../../api/business.api';
import { THEMES, useThemeStore } from '../../store/theme.store';
import apiClient from '../../api/client';

type FormValues = IntegrationSettingsDto & {
  testWaPhone?: string;
  testIgId?: string;
  testFbId?: string;
};

// ── Razorpay Settings Card ────────────────────────────────────────────────────

function RazorpaySettingsCard() {
  const qc = useQueryClient();
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['razorpay-settings'],
    queryFn: () => apiClient.get('/integrations/razorpay').then(r => r.data) as Promise<{
      isConfigured: boolean; keyId: string | null; maskedSecret: string | null;
    }>,
  });

  const saveMutation = useMutation({
    mutationFn: () => apiClient.put('/integrations/razorpay', { keyId: keyId.trim(), keySecret: keySecret.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['razorpay-settings'] });
      setKeyId(''); setKeySecret(''); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => apiClient.delete('/integrations/razorpay'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['razorpay-settings'] }),
  });

  return (
    <Card>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Razorpay Payments</h2>
          <p className="text-xs text-slate-500">Accept online payments on your storefront</p>
        </div>
        <div className="ml-auto">
          <StatusBadge configured={data?.isConfigured ?? false} />
        </div>
      </div>

      {isLoading ? (
        <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
      ) : data?.isConfigured ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Razorpay is connected</p>
              <p className="text-xs text-green-700 mt-0.5">Key ID: <code className="font-mono">{data.keyId}</code></p>
              <p className="text-xs text-green-700">Secret: <code className="font-mono">{data.maskedSecret}</code></p>
            </div>
          </div>
          <p className="text-xs text-slate-500">To update credentials, enter new ones below and save.</p>
          <div className="flex gap-2">
            <Input label="New Key ID" placeholder="rzp_live_..." value={keyId} onChange={e => setKeyId(e.target.value)} />
          </div>
          <div className="relative">
            <Input label="New Key Secret" type={showSecret ? 'text' : 'password'} placeholder="Enter new secret" value={keySecret} onChange={e => setKeySecret(e.target.value)} />
            <button type="button" onClick={() => setShowSecret(s => !s)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <Button type="button" disabled={!keyId || !keySecret} loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              <Save className="w-4 h-4 mr-2" /> Update Keys
            </Button>
            <Button type="button" variant="outline" loading={removeMutation.isPending} onClick={() => removeMutation.mutate()}>
              <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Remove
            </Button>
          </div>
          {saved && <p className="text-xs text-green-600">✅ Razorpay credentials updated!</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">How to get your Razorpay keys:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Go to <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noreferrer" className="underline">dashboard.razorpay.com/app/keys</a></li>
              <li>Generate test keys (or live keys for production)</li>
              <li>Copy the Key ID and Key Secret below</li>
            </ol>
          </div>
          <Input label="Key ID" placeholder="rzp_test_..." value={keyId} onChange={e => setKeyId(e.target.value)} />
          <div className="relative">
            <Input label="Key Secret" type={showSecret ? 'text' : 'password'} placeholder="Your Razorpay Key Secret" value={keySecret} onChange={e => setKeySecret(e.target.value)} />
            <button type="button" onClick={() => setShowSecret(s => !s)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="button" disabled={!keyId || !keySecret} loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            <Save className="w-4 h-4 mr-2" /> Connect Razorpay
          </Button>
          {saved && <p className="text-xs text-green-600">✅ Razorpay connected! Customers can now pay on your storefront.</p>}
          {saveMutation.isError && <p className="text-xs text-red-500">Failed to save. Check your credentials.</p>}
        </div>
      )}
    </Card>
  );
}

function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
      <CheckCircle2 className="w-3.5 h-3.5" /> Connected
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
      <XCircle className="w-3.5 h-3.5" /> Not configured
    </span>
  );
}

function WebhookAccordion({
  open,
  onToggle,
  info,
}: {
  open: boolean;
  onToggle: () => void;
  info: { webhookUrl: string; verifyToken: string; instructions: string[] } | undefined;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mt-5 border border-slate-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <span>Webhook configuration (for Meta Developer App)</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && info && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-4">
          {info.instructions.map((step, i) => (
            <p key={i} className="text-xs text-slate-600">{step}</p>
          ))}
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Callback URL</label>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 break-all">
                {info.webhookUrl}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(info.webhookUrl, 'url')}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                {copied === 'url' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Verify Token</label>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1">
                {info.verifyToken}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(info.verifyToken, 'token')}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                {copied === 'token' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function IntegrationsPage() {
  const qc = useQueryClient();
  const { themeId, setTheme } = useThemeStore();

  // Token visibility
  const [showWaToken, setShowWaToken] = useState(false);
  const [showIgToken, setShowIgToken] = useState(false);
  const [showFbToken, setShowFbToken] = useState(false);

  // Webhook accordions
  const [waWebhookOpen, setWaWebhookOpen] = useState(false);
  const [igWebhookOpen, setIgWebhookOpen] = useState(false);
  const [fbWebhookOpen, setFbWebhookOpen] = useState(false);

  // Test inputs
  const [testWaPhone, setTestWaPhone] = useState('');
  const [testIgId, setTestIgId] = useState('');
  const [testFbId, setTestFbId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['integration-settings'],
    queryFn: businessApi.getIntegrationSettings,
  });

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiClient.get('/subscription').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const isPaidPlan = sub?.planSlug !== 'basic' && sub?.hasSubscription;

  const { data: waWebhookInfo } = useQuery({
    queryKey: ['webhook-info', 'whatsapp'],
    queryFn: businessApi.getWhatsAppWebhookInfo,
    enabled: waWebhookOpen,
  });

  const { data: igWebhookInfo } = useQuery({
    queryKey: ['webhook-info', 'instagram'],
    queryFn: businessApi.getInstagramWebhookInfo,
    enabled: igWebhookOpen,
  });

  const { data: fbWebhookInfo } = useQuery({
    queryKey: ['webhook-info', 'facebook'],
    queryFn: businessApi.getFacebookWebhookInfo,
    enabled: fbWebhookOpen,
  });

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>();

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => businessApi.saveIntegrationSettings(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integration-settings'] }),
  });

  const testWaMutation = useMutation({
    mutationFn: () => businessApi.testWhatsApp(testWaPhone),
  });

  const testIgMutation = useMutation({
    mutationFn: () => businessApi.testInstagram(testIgId),
  });

  const testFbMutation = useMutation({
    mutationFn: () => businessApi.testFacebook(testFbId),
  });

  const handleThemeChange = (id: typeof themeId) => {
    setTheme(id);
    const theme = THEMES.find(t => t.id === id)!;
    setValue('themeColor', theme.primary);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Connect WhatsApp, Instagram, and Facebook to receive messages as leads. All credentials are stored securely per tenant.
        </p>
      </div>

      <form onSubmit={handleSubmit(v => saveMutation.mutate(v))} className="space-y-6">

        {/* ── WhatsApp Business API ───────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">WhatsApp Business API</h2>
              <p className="text-xs text-slate-500">Receive messages & send replies via Meta Cloud API</p>
            </div>
            <div className="ml-auto">
              <StatusBadge configured={data?.whatsAppConfigured ?? false} />
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="WhatsApp Phone Number (display)"
              placeholder="+91 98765 43210"
              {...register('whatsAppNumber')}
            />
            <Input
              label="Phone Number ID"
              placeholder="From Meta Developer App → WhatsApp → API Setup"
              {...register('whatsAppPhoneNumberId')}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Permanent Access Token
              </label>
              <div className="relative">
                <input
                  type={showWaToken ? 'text' : 'password'}
                  placeholder={data?.whatsAppAccessToken ? 'Token saved — enter new value to change' : 'EAAxxxxxxxx...'}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  {...register('whatsAppAccessToken')}
                />
                <button
                  type="button"
                  onClick={() => setShowWaToken(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showWaToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generate a Permanent Token in Meta Business Suite (never expires).
              </p>
            </div>
          </div>

          <WebhookAccordion
            open={waWebhookOpen}
            onToggle={() => setWaWebhookOpen(o => !o)}
            info={waWebhookInfo}
          />

          {data?.whatsAppConfigured && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-2">Send test message</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="919876543210 (with country code, no +)"
                  value={testWaPhone}
                  onChange={e => setTestWaPhone(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  loading={testWaMutation.isPending}
                  onClick={() => testWaMutation.mutate()}
                  disabled={!testWaPhone}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
              {testWaMutation.isSuccess && (
                <p className="text-xs text-green-600 mt-1">✅ Message sent! Check your WhatsApp.</p>
              )}
              {testWaMutation.isError && (
                <p className="text-xs text-red-500 mt-1">Failed to send. Check your credentials.</p>
              )}
            </div>
          )}
        </Card>

        {/* ── Instagram ───────────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
              <InstagramIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Instagram Messaging</h2>
              <p className="text-xs text-slate-500">Receive Instagram DMs as leads via Meta Graph API</p>
            </div>
            <div className="ml-auto">
              <StatusBadge configured={data?.instagramConfigured ?? false} />
            </div>
          </div>

          {!isPaidPlan ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Zap className="w-8 h-8 text-amber-400 mb-3" />
              <p className="font-semibold text-slate-900 mb-1">Pro Feature</p>
              <p className="text-sm text-slate-500 mb-4">Instagram and Facebook integrations are available on Pro and Professional plans.</p>
              <a href="/subscription" className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Zap className="w-3.5 h-3.5" /> Upgrade Now
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <Input
                  label="Instagram Account ID"
                  placeholder="From Meta Developer App → Instagram → Basic Display"
                  {...register('instagramAccountId')}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Page Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showIgToken ? 'text' : 'password'}
                      placeholder={data?.instagramAccessToken ? 'Token saved — enter new value to change' : 'EAAxxxxxxxx...'}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      {...register('instagramAccessToken')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowIgToken(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showIgToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Use your Facebook Page Access Token — Instagram messaging goes through the connected Facebook Page.
                  </p>
                </div>
              </div>

              <WebhookAccordion
                open={igWebhookOpen}
                onToggle={() => setIgWebhookOpen(o => !o)}
                info={igWebhookInfo}
              />

              {data?.instagramConfigured && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-2">Send test DM</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Instagram-scoped user ID (IGSID)"
                      value={testIgId}
                      onChange={e => setTestIgId(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      loading={testIgMutation.isPending}
                      onClick={() => testIgMutation.mutate()}
                      disabled={!testIgId}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                  </div>
                  {testIgMutation.isSuccess && (
                    <p className="text-xs text-green-600 mt-1">✅ DM sent! Check your Instagram.</p>
                  )}
                  {testIgMutation.isError && (
                    <p className="text-xs text-red-500 mt-1">Failed to send. Check your credentials.</p>
                  )}
                </div>
              )}
            </>
          )}
        </Card>

        {/* ── Facebook Messenger ──────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <FacebookIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Facebook Messenger</h2>
              <p className="text-xs text-slate-500">Receive Messenger messages as leads via Facebook Page</p>
            </div>
            <div className="ml-auto">
              <StatusBadge configured={data?.facebookConfigured ?? false} />
            </div>
          </div>

          {!isPaidPlan ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Zap className="w-8 h-8 text-amber-400 mb-3" />
              <p className="font-semibold text-slate-900 mb-1">Pro Feature</p>
              <p className="text-sm text-slate-500 mb-4">Instagram and Facebook integrations are available on Pro and Professional plans.</p>
              <a href="/subscription" className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Zap className="w-3.5 h-3.5" /> Upgrade Now
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <Input
                  label="Facebook Page ID"
                  placeholder="From your Facebook Page → About → Page Info"
                  {...register('facebookPageId')}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Page Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showFbToken ? 'text' : 'password'}
                      placeholder={data?.facebookPageAccessToken ? 'Token saved — enter new value to change' : 'EAAxxxxxxxx...'}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      {...register('facebookPageAccessToken')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowFbToken(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showFbToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Generate a never-expiring Page Access Token in Meta Business Suite.
                  </p>
                </div>
              </div>

              <WebhookAccordion
                open={fbWebhookOpen}
                onToggle={() => setFbWebhookOpen(o => !o)}
                info={fbWebhookInfo}
              />

              {data?.facebookConfigured && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-2">Send test message</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Page-scoped user ID (PSID)"
                      value={testFbId}
                      onChange={e => setTestFbId(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      loading={testFbMutation.isPending}
                      onClick={() => testFbMutation.mutate()}
                      disabled={!testFbId}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                  </div>
                  {testFbMutation.isSuccess && (
                    <p className="text-xs text-green-600 mt-1">✅ Message sent! Check your Facebook Messenger.</p>
                  )}
                  {testFbMutation.isError && (
                    <p className="text-xs text-red-500 mt-1">Failed to send. Check your credentials.</p>
                  )}
                </div>
              )}
            </>
          )}
        </Card>

        {/* ── Razorpay Payments ────────────────────────────────────────────── */}
        <RazorpaySettingsCard />

        {/* ── Theme ──────────────────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center theme-icon-bg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">App Theme</h2>
              <p className="text-xs text-slate-500">Saved to your storefront settings in the database</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeChange(theme.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                style={{
                  borderColor: themeId === theme.id ? theme.primary : 'transparent',
                  backgroundColor: themeId === theme.id ? theme.primaryBg : '#f8fafc',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                />
                <span className="text-xs font-medium text-slate-600">{theme.name}</span>
                {themeId === theme.id && (
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                )}
              </button>
            ))}
          </div>

          <input type="hidden" {...register('themeColor')} />
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save All Settings
          </Button>
          {saveMutation.isSuccess && (
            <p className="text-sm text-green-600 font-medium">✅ Saved to database!</p>
          )}
          {saveMutation.isError && (
            <p className="text-sm text-red-500 font-medium">Failed to save. Please try again.</p>
          )}
        </div>
      </form>
    </div>
  );
}
