import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, RotateCcw, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { SectionInstance } from '../../core/types';
import { apiErrorMessage, builderApi } from '../api';
import { editorPacks } from '../packs';
import { isProductKey, useEditor } from '../state/store';
import { PAGES_KEY } from '../state/useEditorBoot';
import { FieldLabel, INPUT, Segmented } from '../ui/controls';
import { useToast } from '../ui/toastStore';
import { buildCatalogue } from './catalogue';
import { normaliseAiSections } from './normalise';

type Mode = 'page' | 'sections';

const EXAMPLES: Record<Mode, string[]> = {
  page: ['An About us page that tells our story', 'A festive offers page for Diwali', 'FAQ and contact page', 'A page for wholesale and bulk buyers'],
  sections: ['A welcome banner and our best sellers', 'Answer common questions about orders', 'Show our categories with a short intro'],
};

/**
 * AI page generation (SB-R23), in the left pane: describe a page (or what to add to the open one) →
 * the result shows in the preview, read-only → *Create page* / *Add to page* writes it to the draft
 * (adding sections is one undo step). Every generation counts towards the monthly AI use.
 */
export function AiPanel() {
  const qc = useQueryClient();
  const show = useToast(s => s.show);
  const mode = useEditor(s => s.aiPanel?.mode ?? 'sections');
  const openAi = useEditor(s => s.openAi);
  const setTemplatePreview = useEditor(s => s.setTemplatePreview);
  const currentPage = useEditor(s => s.currentPage);
  const layout = useEditor(s => s.layouts[s.currentPage] ?? null);
  const site = useEditor(s => s.site);
  const templateId = useEditor(s => s.site?.templateId ?? null);
  const productPage = useEditor(s => isProductKey(s.currentPage, s.productDesignIds));
  const pageTitle = useEditor(s => s.navPages.find(p => p.id === s.currentPage)?.title ?? (s.currentPage === 'home' ? 'Home' : s.currentPage === 'collection' ? 'Catalogue' : s.currentPage === 'product' ? 'Product page' : 'this page'));

  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mode: Mode; title: string; sections: SectionInstance[]; used: number } | null>(null);
  const [applying, setApplying] = useState(false);

  // The result shows in the preview (read-only) until it is applied or discarded.
  useEffect(() => {
    if (!result || !site) { setTemplatePreview(null); return; }
    const sections = result.mode === 'page' ? result.sections : [...(layout?.sections ?? []), ...result.sections];
    setTemplatePreview({ site, layouts: { [currentPage]: { schemaVersion: 1, sections } } });
  }, [result, site, layout, currentPage, setTemplatePreview]);
  useEffect(() => () => setTemplatePreview(null), [setTemplatePreview]);

  const catalogue = useMemo(() => buildCatalogue({ templateId, productPage: mode === 'sections' && productPage }), [templateId, productPage, mode]);

  const generate = async () => {
    const text = prompt.trim();
    if (!text) { setError('Describe what you want first.'); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await builderApi.aiGenerate({
        prompt: text,
        mode,
        catalogue,
        pageTitle: mode === 'sections' ? pageTitle : undefined,
        existingSections: mode === 'sections' ? (layout?.sections ?? []).map(s => s.type) : undefined,
      });
      const sections = normaliseAiSections(res.sections);
      if (!sections.length) throw new Error('The AI didn’t suggest any sections we can use. Try rephrasing.');
      setResult({ mode, title: res.title || 'New page', sections, used: res.usedThisMonth });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    if (!result) return;
    setApplying(true);
    try {
      if (result.mode === 'page') {
        const title = result.title.trim() || 'New page';
        const page = await builderApi.createPage({ title, layout: { schemaVersion: 1, sections: result.sections } });
        await qc.invalidateQueries({ queryKey: PAGES_KEY });
        openAi(null);
        const s = useEditor.getState();
        s.setCurrentPage(page.id);
        s.setLeftTab('sections');
        show('success', `Created “${page.title}” in your draft — check the text, add photos, then publish.`);
      } else {
        const { addSection } = useEditor.getState();
        // Added together, these merge into one undo step.
        for (const sec of result.sections) addSection(sec);
        openAi(null);
        show('success', `Added ${result.sections.length} section${result.sections.length === 1 ? '' : 's'}. Undo removes them.`);
      }
    } catch (err) {
      show('error', apiErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  const discard = () => { setResult(null); setError(null); };
  const switchMode = (next: Mode) => { if (next !== mode) { discard(); openAi(next); } };

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-14 shrink-0 items-center gap-2 border-b border-slate-200 px-4">
        <Sparkles className="h-5 w-5 text-slate-500" aria-hidden />
        <h2 className="flex-1 text-sm font-semibold text-slate-900">Generate with AI</h2>
        <button type="button" onClick={() => openAi(null)} aria-label="Close AI panel" className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" aria-hidden /></button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <Segmented<Mode>
          label="What to create"
          value={mode}
          onChange={switchMode}
          options={[{ value: 'page', label: 'New page' }, { value: 'sections', label: 'Add to this page' }]}
        />

        {!result ? (
          <>
            <div>
              <FieldLabel htmlFor="sb-ai-prompt" helper={mode === 'page' ? 'The AI picks sections and writes the text from your store’s categories and products.' : `Sections are added to the end of “${pageTitle}”.`}>
                {mode === 'page' ? 'Describe the page' : 'What should it add?'}
              </FieldLabel>
              <textarea id="sb-ai-prompt" rows={5} maxLength={1000} value={prompt} onChange={e => setPrompt(e.target.value)} disabled={busy} placeholder={EXAMPLES[mode][0]} className={INPUT} />
            </div>
            <div className="flex flex-wrap gap-1.5" aria-label="Examples">
              {EXAMPLES[mode].map(ex => (
                <button key={ex} type="button" disabled={busy} onClick={() => setPrompt(ex)} className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50">{ex}</button>
              ))}
            </div>
            {error && <p className="flex gap-2 text-sm text-red-600" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{error}</p>}
            <button type="button" disabled={busy || (mode === 'sections' && !layout)} onClick={() => { void generate(); }} className="theme-btn inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-60">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> Designing… up to 30 seconds</> : <><Sparkles className="h-4 w-4" aria-hidden /> Generate</>}
            </button>
          </>
        ) : (
          <>
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600" role="status">
              The preview shows the result. Nothing is saved until you {result.mode === 'page' ? 'create the page' : 'add the sections'}.
            </p>
            {result.mode === 'page' && (
              <div>
                <FieldLabel htmlFor="sb-ai-title">Page name</FieldLabel>
                <input id="sb-ai-title" maxLength={200} value={result.title} onChange={e => setResult({ ...result, title: e.target.value })} className={INPUT} />
              </div>
            )}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{result.sections.length} section{result.sections.length === 1 ? '' : 's'}</p>
              <ol className="space-y-1 text-sm text-slate-700">
                {result.sections.map((s, i) => (
                  <li key={s.id} className="rounded-lg border border-slate-200 px-3 py-1.5">{i + 1}. {editorPacks.get('section', s.type)?.name ?? s.type}</li>
                ))}
              </ol>
            </div>
            <p className="text-xs text-slate-500">Check the text before publishing — replace anything in [brackets] and add your photos.</p>
            <div className="flex flex-col gap-2">
              <button type="button" disabled={applying} onClick={() => { void apply(); }} className="theme-btn inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-60">
                {applying && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
                {result.mode === 'page' ? 'Create page' : `Add ${result.sections.length} section${result.sections.length === 1 ? '' : 's'}`}
              </button>
              <div className="flex gap-2">
                <button type="button" disabled={busy || applying} onClick={() => { void generate(); }} className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <RotateCcw className="h-4 w-4" aria-hidden />} Try again
                </button>
                <button type="button" disabled={applying} onClick={discard} className="min-h-10 flex-1 cursor-pointer rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">Change request</button>
              </div>
            </div>
            {error && <p className="flex gap-2 text-sm text-red-600" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{error}</p>}
          </>
        )}
      </div>

      <p className="shrink-0 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500">
        Each generation counts towards your plan’s monthly AI use{result ? ` · ${result.used} this month` : ''}.
      </p>
    </div>
  );
}
