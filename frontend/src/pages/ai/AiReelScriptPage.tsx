import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Video, Copy, Check, RefreshCw, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { marketingApi } from '../../api/marketing.api';

const durations = [
  { value: 15, label: '15s', desc: 'Quick hook' },
  { value: 30, label: '30s', desc: 'Sweet spot' },
  { value: 60, label: '60s', desc: 'Full story' },
];

const tones = ['Fun', 'Professional', 'Festive', 'Urgent'];

export function AiReelScriptPage() {
  const [productName,  setProductName]  = useState('');
  const [productDesc,  setProductDesc]  = useState('');
  const [duration,     setDuration]     = useState(30);
  const [tone,         setTone]         = useState('Fun');
  const [script,       setScript]       = useState<string | null>(null);
  const [copied,       setCopied]       = useState(false);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => marketingApi.generateReelScript({
      productName, productDescription: productDesc || undefined,
      durationSeconds: duration, tone,
    }),
    onSuccess: data => setScript(data.script),
  });

  const copy = () => {
    if (!script) return;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Video className="w-6 h-6 text-rose-500" />
          AI Reel / Short Video Script
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate a ready-to-film Instagram Reel or YouTube Shorts script for your product in seconds.
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              placeholder="e.g. Handmade Leather Bag"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
            <Input
              label="Short Description (optional)"
              placeholder="e.g. Genuine leather, 3 colours"
              value={productDesc}
              onChange={e => setProductDesc(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Video Duration</label>
            <div className="grid grid-cols-3 gap-3">
              {durations.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                    duration === d.value
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`flex items-center gap-1.5 font-bold text-lg ${duration === d.value ? 'text-rose-600' : 'text-slate-700'}`}>
                    <Clock className="w-4 h-4" />{d.label}
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Tone</label>
            <div className="flex gap-2 flex-wrap">
              {tones.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tone === t ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {t === 'Fun' ? '😄 Fun' : t === 'Professional' ? '💼 Professional' : t === 'Festive' ? '🎊 Festive' : '⚡ Urgent'}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={() => mutate()} loading={isPending} disabled={!productName.trim()} className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700" size="lg">
            <Video className="w-4 h-4" /> Generate Script
          </Button>
          {isError && <p className="text-sm text-red-500 text-center">Failed to generate. Please try again.</p>}
        </div>
      </Card>

      {script && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-rose-500" /> Your {duration}s Script
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => mutate()}>
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Script</>}
              </Button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-mono">
            {script}
          </div>

          <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-xl">💡</span>
            <div className="text-xs text-amber-700">
              <strong>Filming tip:</strong> Use good natural light. Film in portrait mode (9:16) for Reels.
              Add background music from Instagram's royalty-free library. Keep text overlays short and readable.
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
