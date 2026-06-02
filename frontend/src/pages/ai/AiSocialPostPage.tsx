import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Copy, Check, RefreshCw, Camera, Globe, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { marketingApi } from '../../api/marketing.api';

const platforms = [
  { id: 'Instagram', label: 'Instagram', icon: Camera, color: 'text-pink-600', bg: 'bg-pink-50', active: 'bg-pink-600 text-white' },
  { id: 'Facebook', label: 'Facebook', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50', active: 'bg-blue-600 text-white' },
  { id: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50', active: 'bg-green-600 text-white' },
  { id: 'Twitter', label: 'Twitter / X', icon: Share2, color: 'text-slate-700', bg: 'bg-slate-50', active: 'bg-slate-800 text-white' },
];

const tones = ['Fun', 'Professional', 'Festive', 'Urgent'];

export function AiSocialPostPage() {
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Fun');
  const [result, setResult] = useState<{ caption: string; hashtags: string; callToAction: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => marketingApi.generateSocialPost({ productName, productDescription: productDesc || undefined, platform, tone }),
    onSuccess: (data) => setResult(data),
  });

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = () => {
    if (!result) return;
    const full = `${result.caption}\n\n${result.hashtags}\n\n${result.callToAction}`;
    copy(full, 'all');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-600" />
          AI Social Post Generator
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate scroll-stopping captions, hashtags, and CTAs for your social media posts in seconds.
        </p>
      </div>

      <Card>
        <div className="space-y-5">
          {/* Product Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              placeholder="e.g. Banarasi Silk Saree"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
            <Input
              label="Short Description (optional)"
              placeholder="e.g. Handwoven, royal blue"
              value={productDesc}
              onChange={e => setProductDesc(e.target.value)}
            />
          </div>

          {/* Platform */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Platform</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    platform === p.id
                      ? `${p.active} border-transparent shadow-sm`
                      : `border-slate-200 ${p.color} hover:border-slate-300`
                  }`}
                >
                  <p.icon className="w-4 h-4" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Tone</label>
            <div className="flex gap-2 flex-wrap">
              {tones.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    tone === t ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'Fun' ? '😄 Fun' : t === 'Professional' ? '💼 Professional' : t === 'Festive' ? '🎊 Festive' : '⚡ Urgent'}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => mutate()}
            loading={isPending}
            disabled={!productName.trim()}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-4 h-4" /> Generate Post
          </Button>

          {isError && <p className="text-sm text-red-500">Failed to generate. Please try again.</p>}
        </div>
      </Card>

      {result && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" /> Generated Post
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => mutate()}>
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copyAll}>
                {copiedField === 'all' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'all' ? 'Copied!' : 'Copy All'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Caption */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Caption</label>
                <button onClick={() => copy(result.caption, 'caption')} className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1">
                  {copiedField === 'caption' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">{result.caption}</div>
            </div>

            {/* Hashtags */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hashtags</label>
                <button onClick={() => copy(result.hashtags, 'hashtags')} className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1">
                  {copiedField === 'hashtags' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 text-sm text-violet-700 leading-relaxed">{result.hashtags}</div>
            </div>

            {/* CTA */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Call to Action</label>
                <button onClick={() => copy(result.callToAction, 'cta')} className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1">
                  {copiedField === 'cta' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700 font-medium">{result.callToAction}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
