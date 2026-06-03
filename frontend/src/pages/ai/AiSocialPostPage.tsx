import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Sparkles, Copy, Check, RefreshCw, Camera, Globe,
  MessageCircle, Share2, ImageIcon, Download, AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { marketingApi } from '../../api/marketing.api';

const platforms = [
  { id: 'Instagram', label: 'Instagram', icon: Camera,        color: 'text-pink-600',  bg: 'bg-pink-50',  active: 'bg-pink-600 text-white'   },
  { id: 'Facebook',  label: 'Facebook',  icon: Globe,         color: 'text-blue-600',  bg: 'bg-blue-50',  active: 'bg-blue-600 text-white'   },
  { id: 'WhatsApp',  label: 'WhatsApp',  icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50', active: 'bg-green-600 text-white'  },
  { id: 'Twitter',   label: 'Twitter / X', icon: Share2,      color: 'text-slate-700', bg: 'bg-slate-50', active: 'bg-slate-800 text-white'  },
];

const tones = ['Fun', 'Professional', 'Festive', 'Urgent'];
const languages = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu'];

export function AiSocialPostPage() {
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [platform, setPlatform]       = useState('Instagram');
  const [tone, setTone]               = useState('Fun');
  const [language, setLanguage]       = useState('English');

  const [result, setResult]           = useState<{ caption: string; hashtags: string; callToAction: string } | null>(null);
  const [posterUrl, setPosterUrl]     = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [posterErrMsg, setPosterErrMsg] = useState<string | null>(null);

  // ── Text generation ──────────────────────────────────────────────────────
  const { mutate: generateText, isPending: textPending, isError: textError } = useMutation({
    mutationFn: () => marketingApi.generateSocialPost({
      productName, productDescription: productDesc || undefined, platform, tone, language,
    }),
    onSuccess: (data) => {
      setResult(data);
      setPosterUrl(null); // reset poster when text changes
    },
  });

  // ── Poster generation ────────────────────────────────────────────────────
  const {
    mutate: generatePoster,
    isPending: posterPending,
    isError: posterError,
    reset: resetPoster,
  } = useMutation({
    mutationFn: () => marketingApi.generatePoster({
      productName, productDescription: productDesc || undefined, platform, tone,
    }),
    onSuccess: (data) => {
      if (data.error || !data.imageUrl) {
        setPosterErrMsg(data.error ?? 'Image generation failed.');
        setPosterUrl(null);
      } else {
        setPosterUrl(data.imageUrl);
        setPosterErrMsg(null);
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.errors?.[0]
        ?? err?.response?.data?.message
        ?? err?.message
        ?? 'Poster generation failed. Please try again.';
      setPosterErrMsg(msg);
    },
  });

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = () => {
    if (!result) return;
    copy(`${result.caption}\n\n${result.hashtags}\n\n${result.callToAction}`, 'all');
  };

  const downloadPoster = () => {
    if (!posterUrl) return;
    const a = document.createElement('a');
    a.href = posterUrl;
    a.download = `${productName.replace(/\s+/g, '-')}-poster.png`;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.click();
  };

  const isLandscape = platform === 'Facebook' || platform === 'Twitter';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-600" />
          AI Social Post Generator
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate scroll-stopping captions, hashtags, CTAs — and a matching poster image — in seconds.
        </p>
      </div>

      {/* ── Input form ── */}
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

          {/* Language */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Language</label>
            <div className="flex gap-2 flex-wrap">
              {languages.map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${language === l ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => generateText()}
            loading={textPending}
            disabled={!productName.trim()}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-4 h-4" /> Generate Post
          </Button>

          {textError && <p className="text-sm text-red-500">Failed to generate text. Please try again.</p>}
        </div>
      </Card>

      {/* ── Generated text result ── */}
      {result && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" /> Generated Post
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => generateText()}>
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

      {/* ── Poster section — shown after text is generated ── */}
      {result && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-500" /> Marketing Poster
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-generated poster image based on your product and tone
                {isLandscape ? ' · Landscape (16:9)' : ' · Square (1:1)'}
              </p>
            </div>
            {posterUrl && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { resetPoster(); generatePoster(); }}>
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={downloadPoster}>
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
              </div>
            )}
          </div>

          {/* Poster area */}
          {!posterUrl && !posterPending && !posterError && (
            <div className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 ${isLandscape ? 'aspect-video' : 'aspect-square max-w-sm mx-auto'}`}>
              <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-violet-100 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-violet-400" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-semibold text-slate-600">Generate a Poster</p>
                <p className="text-xs text-slate-400 mt-1">
                  Create a stunning AI-generated marketing image for {platform} using DALL-E 3.
                </p>
              </div>
              <Button onClick={() => generatePoster()} size="sm" className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700">
                <Sparkles className="w-4 h-4" /> Generate Poster
              </Button>
            </div>
          )}

          {posterPending && (
            <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-violet-50 to-pink-50 ${isLandscape ? 'aspect-video' : 'aspect-square max-w-sm mx-auto'}`}>
              <div className="w-12 h-12 border-4 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Generating poster with DALL-E 3…</p>
              <p className="text-xs text-slate-400">This usually takes 10–20 seconds</p>
            </div>
          )}

          {posterError && (
            <div className={`flex flex-col items-center justify-center gap-4 rounded-2xl bg-red-50 border border-red-100 p-6 ${isLandscape ? 'aspect-video' : 'aspect-square max-w-sm mx-auto'}`}>
              <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
              <div className="text-center space-y-1">
                <p className="text-sm text-red-600 font-semibold">Poster generation failed</p>
                {posterErrMsg && (
                  <p className="text-xs text-red-500 font-mono bg-red-100 rounded-lg px-3 py-2 text-left break-words max-w-xs">
                    {posterErrMsg}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => { resetPoster(); setPosterErrMsg(null); generatePoster(); }}>
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </Button>
            </div>
          )}

          {posterUrl && !posterPending && (
            <div className="space-y-3">
              <div className={`overflow-hidden rounded-2xl border border-slate-100 shadow-sm ${isLandscape ? '' : 'max-w-sm mx-auto'}`}>
                <img
                  src={posterUrl}
                  alt={`${productName} marketing poster`}
                  className="w-full h-auto object-cover"
                />
              </div>
              <p className="text-xs text-slate-400 text-center">
                Right-click → Save image, or use the Download button above.
                Image URL expires in ~1 hour.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
