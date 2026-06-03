import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bot, Zap, MessageSquare, Megaphone, Info, Save,
  Camera, Globe, Send
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { businessApi, type AiSettingsDto } from '../../api/business.api';

const TONE_OPTIONS = ['Friendly', 'Professional', 'Fun', 'Formal'];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
        checked ? 'bg-teal-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function AiAutopilotPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ai-settings'],
    queryFn: () => businessApi.getAiSettings(),
  });

  const [form, setForm] = useState<AiSettingsDto>({
    autoReplyEnabled: false,
    autoReplyTone: 'Friendly',
    aiStoreContext: '',
    autoCampaignEnabled: false,
  });

  // Sync once data is loaded
  useState(() => {
    if (data) setForm(data);
  });

  const { data: loaded } = useQuery({
    queryKey: ['ai-settings'],
    queryFn: () => businessApi.getAiSettings(),
    select: (d) => d,
  });

  const [localForm, setLocalForm] = useState<AiSettingsDto | null>(null);
  const effectiveForm = localForm ?? loaded ?? form;

  const updateField = <K extends keyof AiSettingsDto>(key: K, value: AiSettingsDto[K]) => {
    setLocalForm(prev => ({ ...(prev ?? effectiveForm), [key]: value }));
  };

  const [saved, setSaved] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AiSettingsDto) => businessApi.updateAiSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const handleSave = () => {
    if (effectiveForm) mutate(effectiveForm);
  };

  if (isLoading || !effectiveForm) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-teal-600" />
            AI Autopilot
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Let AI handle customer conversations and auto-post when you publish products.
          </p>
        </div>
        <Button onClick={handleSave} loading={isPending} className="shrink-0">
          <Save className="h-4 w-4 mr-1.5" />
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      {/* Auto-Reply Card */}
      <Card>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-50 rounded-lg mt-0.5">
                <MessageSquare className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">AI Auto-Reply</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  AI replies to every customer message on WhatsApp, Instagram DM, and Facebook Messenger —
                  guides them through browsing, collects order details, and confirms orders automatically.
                </p>
              </div>
            </div>
            <Toggle
              checked={effectiveForm.autoReplyEnabled}
              onChange={(v) => updateField('autoReplyEnabled', v)}
            />
          </div>

          {effectiveForm.autoReplyEnabled && (
            <div className="border-t border-slate-100 pt-5 space-y-5">
              {/* Tone selector */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Reply Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => updateField('autoReplyTone', tone)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        effectiveForm.autoReplyTone === tone
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Store context / FAQ */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Store Policies & FAQ <span className="text-slate-400 font-normal">(injected into every AI reply)</span>
                </label>
                <textarea
                  rows={5}
                  placeholder={`e.g.\n- We deliver within 3-5 days across India\n- COD available for orders above ₹500\n- No returns after 7 days of delivery\n- WhatsApp us at +91-XXXXXXXXXX for urgent queries`}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
                  value={effectiveForm.aiStoreContext ?? ''}
                  onChange={(e) => updateField('aiStoreContext', e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  The AI uses this to answer policy questions accurately without making things up.
                </p>
              </div>

              {/* How it works */}
              <div className="bg-teal-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-teal-800">How auto-reply works</p>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { icon: '👋', label: 'Greet' },
                    { icon: '🔍', label: 'Browse Products' },
                    { icon: '💡', label: 'Suggest Items' },
                    { icon: '📋', label: 'Collect Order Details' },
                    { icon: '✅', label: 'Confirm Order' },
                    { icon: '🎉', label: 'Done!' },
                  ].map((step) => (
                    <span key={step.label} className="bg-white border border-teal-200 text-teal-700 rounded-full px-3 py-1">
                      {step.icon} {step.label}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-teal-700 mt-1">
                  The AI remembers the full conversation, knows your product catalogue, and escalates to you if the customer asks to speak to a human.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Auto-Campaign Card */}
      <Card>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg mt-0.5">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Auto-Campaign on Product Publish</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  When you publish a new product, AI automatically generates captions and posts
                  to Instagram, Facebook, and broadcasts via WhatsApp — zero effort marketing.
                </p>
              </div>
            </div>
            <Toggle
              checked={effectiveForm.autoCampaignEnabled}
              onChange={(v) => updateField('autoCampaignEnabled', v)}
            />
          </div>

          {effectiveForm.autoCampaignEnabled && (
            <div className="border-t border-slate-100 pt-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2.5 p-3 bg-pink-50 rounded-xl">
                  <Camera className="h-5 w-5 text-pink-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-pink-800">Instagram</p>
                    <p className="text-xs text-pink-600">Photo post + hashtags</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl">
                  <Globe className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-800">Facebook</p>
                    <p className="text-xs text-blue-600">Page post + image</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-green-50 rounded-xl">
                  <Send className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-green-800">WhatsApp</p>
                    <p className="text-xs text-green-600">Broadcast to customers</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Requires channel credentials configured in <span className="underline font-medium">Settings → Integrations</span>.
                Posts only to channels that are connected.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <Megaphone className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Connect your channels first</p>
          <p className="mt-0.5 text-amber-700">
            Auto-reply and auto-campaigns require WhatsApp, Instagram, and/or Facebook credentials
            configured under <strong>Settings → Integrations</strong>.
            AI uses your product catalogue automatically — no extra setup needed.
          </p>
        </div>
      </div>
    </div>
  );
}
