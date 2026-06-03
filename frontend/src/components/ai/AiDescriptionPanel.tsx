import { useEffect, useState } from 'react';
import {
  Sparkles, RefreshCw, Copy, Check, ChevronDown, ChevronUp, X, Zap,
} from 'lucide-react';
import { marketingApi } from '../../api/marketing.api';

// ── Tone config ───────────────────────────────────────────────────────────────
const TONES = [
  { id: 'Professional',  emoji: '💼', label: 'Professional',  badge: 'bg-slate-100 text-slate-700',  ring: 'ring-slate-300' },
  { id: 'Luxury',        emoji: '👑', label: 'Luxury',         badge: 'bg-amber-50 text-amber-700',   ring: 'ring-amber-300' },
  { id: 'Friendly',      emoji: '😊', label: 'Friendly',       badge: 'bg-green-50 text-green-700',   ring: 'ring-green-300' },
  { id: 'Emotional',     emoji: '💝', label: 'Emotional',      badge: 'bg-pink-50 text-pink-700',     ring: 'ring-pink-300'  },
  { id: 'SEO-Optimized', emoji: '🔍', label: 'SEO-Optimized',  badge: 'bg-blue-50 text-blue-700',     ring: 'ring-blue-300'  },
  { id: 'Minimal',       emoji: '✨', label: 'Minimal',        badge: 'bg-gray-100 text-gray-600',    ring: 'ring-gray-300'  },
  { id: 'Sales-Driven',  emoji: '🔥', label: 'Sales-Driven',   badge: 'bg-orange-50 text-orange-700', ring: 'ring-orange-300'},
] as const;

type ToneId = typeof TONES[number]['id'];

interface Suggestion {
  toneId: ToneId;
  text: string;
  status: 'loading' | 'done' | 'error';
}

interface Props {
  productTitle: string;
  onSelect: (text: string) => void;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AiDescriptionPanel({ productTitle, onSelect, onClose }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(
    TONES.map(t => ({ toneId: t.id, text: '', status: 'loading' }))
  );
  const [copied,    setCopied]    = useState<ToneId | null>(null);
  const [expanded,  setExpanded]  = useState<ToneId | null>('Professional');
  const [selected,  setSelected]  = useState<ToneId | null>(null);
  const [isRegen,   setIsRegen]   = useState(false);

  // ── Generate all tones in parallel ───────────────────────────────────────
  async function generate() {
    setIsRegen(true);
    setSuggestions(TONES.map(t => ({ toneId: t.id, text: '', status: 'loading' })));
    setSelected(null);

    const results = await Promise.allSettled(
      TONES.map(t =>
        marketingApi.generateProductDescription({
          productName: productTitle,
          tone: t.id,
          language: 'English',
        })
      )
    );

    setSuggestions(
      TONES.map((t, i) => {
        const r = results[i];
        if (r.status === 'fulfilled') {
          return { toneId: t.id, text: r.value.whatsAppDesc, status: 'done' };
        }
        return { toneId: t.id, text: '', status: 'error' };
      })
    );
    setIsRegen(false);
  }

  useEffect(() => { generate(); }, []); // auto-generate on open

  // ── Helpers ───────────────────────────────────────────────────────────────
  function copy(toneId: ToneId, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(toneId);
    setTimeout(() => setCopied(null), 2000);
  }

  function use(toneId: ToneId, text: string) {
    setSelected(toneId);
    onSelect(text);
  }

  const doneCount = suggestions.filter(s => s.status === 'done').length;
  const isLoading = suggestions.some(s => s.status === 'loading');

  return (
    <div className="mt-3 border border-teal-200 rounded-2xl overflow-hidden shadow-sm bg-white">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-50 to-violet-50 border-b border-teal-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-semibold text-slate-800">AI Description Suggestions</span>
          {!isLoading && (
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
              {doneCount}/{TONES.length} ready
            </span>
          )}
          {isLoading && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin inline-block" />
              Generating…
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generate}
            disabled={isLoading || isRegen}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 disabled:opacity-40 transition-colors font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegen ? 'animate-spin' : ''}`} />
            Regenerate all
          </button>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/60 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Suggestion list ── */}
      <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
        {TONES.map(tone => {
          const s    = suggestions.find(x => x.toneId === tone.id)!;
          const open = expanded === tone.id;

          return (
            <div
              key={tone.id}
              className={`transition-all ${selected === tone.id ? 'bg-teal-50/60' : 'bg-white hover:bg-slate-50/50'}`}
            >
              {/* Row header */}
              <button
                type="button"
                onClick={() => setExpanded(open ? null : tone.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span className="text-lg leading-none">{tone.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tone.badge}`}>
                      {tone.label}
                    </span>
                    {selected === tone.id && (
                      <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                  {/* Preview when collapsed */}
                  {!open && s.status === 'done' && s.text && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate pr-4">{s.text}</p>
                  )}
                </div>

                {/* Loading spinner per card */}
                {s.status === 'loading' && (
                  <span className="w-4 h-4 border-2 border-slate-300 border-t-teal-500 rounded-full animate-spin shrink-0" />
                )}
                {s.status !== 'loading' && (
                  open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                       : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Expanded body */}
              {open && (
                <div className="px-4 pb-4">
                  {s.status === 'loading' && (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-3 bg-slate-100 rounded-full animate-pulse`} style={{ width: `${90 - i * 10}%` }} />
                      ))}
                    </div>
                  )}

                  {s.status === 'error' && (
                    <p className="text-sm text-red-500 py-2">Failed to generate. <button type="button" onClick={generate} className="underline">Retry all</button></p>
                  )}

                  {s.status === 'done' && s.text && (
                    <>
                      <div className={`rounded-xl p-3.5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap ring-1 ${tone.ring} bg-white`}>
                        {s.text}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {/* Use this */}
                        <button
                          type="button"
                          onClick={() => use(tone.id, s.text)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            selected === tone.id
                              ? 'bg-teal-600 text-white'
                              : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {selected === tone.id ? 'Applied ✓' : 'Use this'}
                        </button>

                        {/* Copy */}
                        <button
                          type="button"
                          onClick={() => copy(tone.id, s.text)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                          {copied === tone.id
                            ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</>
                            : <><Copy className="w-3.5 h-3.5" /> Copy</>
                          }
                        </button>

                        <span className="ml-auto text-xs text-slate-300">
                          {s.text.length} chars
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer hint ── */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
        <p className="text-xs text-slate-400">Click <strong className="text-slate-500">Use this</strong> on any suggestion to fill the description field instantly.</p>
      </div>
    </div>
  );
}
