import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileText, Copy, Check, RefreshCw, MessageCircle, Camera } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { marketingApi } from '../../api/marketing.api';

const tones = ['Fun', 'Professional', 'Festive', 'Urgent'];
const languages = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu'];

export function AiProductDescriptionPage() {
  const [productName, setProductName] = useState('');
  const [category,    setCategory]    = useState('');
  const [features,    setFeatures]    = useState('');
  const [tone,        setTone]        = useState('Professional');
  const [language,    setLanguage]    = useState('English');
  const [result,      setResult]      = useState<{ whatsAppDesc: string; instagramDesc: string; tags: string } | null>(null);
  const [copied,      setCopied]      = useState<string | null>(null);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => marketingApi.generateProductDescription({
      productName, category: category || undefined,
      features: features || undefined, tone, language,
    }),
    onSuccess: data => setResult(data),
  });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-teal-600" />
          AI Product Description
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate ready-to-use WhatsApp and Instagram descriptions for any product — in your language.
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              placeholder="e.g. Handloom Cotton Saree"
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
            <Input
              label="Category (optional)"
              placeholder="e.g. Women's Ethnic Wear"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Key Features / Details (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Pure cotton, hand-woven, available in 12 colours, machine washable"
              value={features}
              onChange={e => setFeatures(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tone */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Tone</label>
              <div className="flex flex-wrap gap-2">
                {tones.map(t => (
                  <button key={t} onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tone === t ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Language */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Language</label>
              <div className="flex flex-wrap gap-2">
                {languages.map(l => (
                  <button key={l} onClick={() => setLanguage(l)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${language === l ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={() => mutate()} loading={isPending} disabled={!productName.trim()} className="w-full" size="lg">
            <FileText className="w-4 h-4" /> Generate Descriptions
          </Button>
          {isError && <p className="text-sm text-red-500 text-center">Failed to generate. Please try again.</p>}
        </div>
      </Card>

      {result && (
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">Generated Descriptions</h3>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </Button>
          </div>

          <div className="space-y-5">
            {/* WhatsApp */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">WhatsApp Description</span>
                </div>
                <button onClick={() => copy(result.whatsAppDesc, 'wa')} className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1">
                  {copied === 'wa' ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.whatsAppDesc}</div>
            </div>

            {/* Instagram */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5 text-pink-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Instagram Description</span>
                </div>
                <button onClick={() => copy(result.instagramDesc, 'ig')} className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1">
                  {copied === 'ig' ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="bg-pink-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">{result.instagramDesc}</div>
            </div>

            {/* Hashtags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hashtags / Tags</span>
                <button onClick={() => copy(result.tags, 'tags')} className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1">
                  {copied === 'tags' ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 text-sm text-violet-700 leading-relaxed">{result.tags}</div>
            </div>

            {/* Copy All */}
            <button
              onClick={() => copy(`WhatsApp:\n${result.whatsAppDesc}\n\nInstagram:\n${result.instagramDesc}\n\nTags:\n${result.tags}`, 'all')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              {copied === 'all' ? <><Check className="w-4 h-4 text-green-500" /> All Copied!</> : <><Copy className="w-4 h-4" /> Copy All</>}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
