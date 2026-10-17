/**
 * Template wizard (plan §4.1): "What do you sell?" → template gallery with a live preview built
 * from the merchant's own logo and products → colours and fonts → apply to the draft.
 * Opens on first run (nothing saved yet) and from Style → "Change template".
 * Dashboard tokens only (design.md §13, editor rules).
 */
import { AlertCircle, ArrowLeft, Check, Loader2, Monitor, Smartphone, Sparkles, Tablet, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { canUse } from '../../core/canUse';
import { registry } from '../../core/registry';
import { loadTemplateBuild } from '../../core/templates';
import { isHex } from '../../core/theme/color';
import type { PaletteChoice, PaletteDef, ShopType, TemplateDocs, TemplateManifest } from '../../core/types';
import { PreviewFrame } from '../preview/PreviewFrame';
import { EMPTY_LAYOUT } from '../state/starter';
import { useEditor, type Device } from '../state/store';
import { INPUT, Segmented } from '../ui/controls';
import { BRAND_PALETTE, SHOP_TYPES, hasBrandColours, orderTemplates, paletteChoice, withChoices } from './templateDocs';
import { useApplyTemplate } from './useApplyTemplate';

type PreviewPage = 'home' | 'collection' | 'product';
type Mode = 'keep' | 'replace';

export function TemplateWizard() {
  const wizard = useEditor(s => s.wizard);
  const store = useEditor(s => s.store);
  if (!wizard || !store) return null;
  return <Wizard firstRun={wizard.firstRun} />;
}

function Wizard({ firstRun }: { firstRun: boolean }) {
  const store = useEditor(s => s.store)!;
  const currentTemplateId = useEditor(s => s.site?.templateId ?? null);
  const setTemplatePreview = useEditor(s => s.setTemplatePreview);
  const setCurrentPage = useEditor(s => s.setCurrentPage);
  const closeWizard = useEditor(s => s.closeWizard);
  const { apply, applying } = useApplyTemplate();

  const templates = useMemo(() => registry.listTemplates().filter(t => canUse(t)), []);
  const [step, setStep] = useState<'shop' | 'pick'>(firstRun ? 'shop' : 'pick');
  const [shopType, setShopType] = useState<ShopType | null>(null);
  const ordered = useMemo(() => orderTemplates(templates, shopType), [templates, shopType]);
  const [templateId, setTemplateId] = useState(() =>
    currentTemplateId && registry.getTemplate(currentTemplateId) ? currentTemplateId : ordered[0]?.template.id ?? 'starter');
  const template = registry.getTemplate(templateId) ?? templates[0];

  // Colour and font picks (null = the template's own choice), reset when the template changes.
  const [picks, setPicks] = useState<{ id: string; palette: string | null; font: string | null }>({ id: templateId, palette: null, font: null });
  const palettePick = picks.id === template.id ? picks.palette : null;
  const fontPick = picks.id === template.id ? picks.font : null;
  const setPalette = (palette: string) => setPicks({ id: template.id, palette, font: fontPick });
  const setFont = (font: string) => setPicks({ id: template.id, palette: palettePick, font });

  const [mode, setMode] = useState<Mode>(firstRun ? 'replace' : 'keep');
  const [pane, setPane] = useState<'choose' | 'preview'>('choose');
  const [previewPage, setPreviewPage] = useState<PreviewPage>('home');

  // Template documents, built from this store's data (loaded on demand).
  const [built, setBuilt] = useState<{ id: string; docs: TemplateDocs } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    loadTemplateBuild(template)
      .then(build => { if (alive) setBuilt({ id: template.id, docs: build(store) }); })
      .catch(() => { if (alive) setFailed(template.id); });
    return () => { alive = false; };
  }, [template, store, attempt]);
  const ready = built?.id === template.id ? built.docs : null;
  const loadFailed = failed === template.id && !ready;

  const docs = useMemo<TemplateDocs | null>(() => {
    if (!ready) return null;
    const palette: PaletteChoice = palettePick ? paletteChoice(palettePick, template, store) : ready.site.theme.palette;
    return withChoices(ready, palette, fontPick ?? ready.site.theme.fontPair);
  }, [ready, palettePick, fontPick, template, store]);

  // The editor preview shows the template while the wizard is open (read-only).
  useEffect(() => {
    setTemplatePreview(docs && {
      site: docs.site,
      layouts: { home: docs.home, collection: docs.collection ?? EMPTY_LAYOUT, product: docs.product ?? EMPTY_LAYOUT },
    });
  }, [docs, setTemplatePreview]);
  useEffect(() => () => setTemplatePreview(null), [setTemplatePreview]);

  // Preview Home / Catalogue / Product page; the editor's page comes back on cancel.
  const startPage = useRef(useEditor.getState().currentPage);
  useEffect(() => { setCurrentPage(previewPage); }, [previewPage, setCurrentPage]);
  const cancel = () => {
    if (applying) return;
    setCurrentPage(startPage.current);
    closeWizard();
  };

  // Esc closes; focus starts on the heading and returns where it was.
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    return () => prev?.focus?.();
  }, []);
  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || applying) return;
      setCurrentPage(startPage.current);
      closeWizard();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [applying, setCurrentPage, closeWizard]);

  const chooseShop = (type: ShopType) => {
    setShopType(type);
    const best = orderTemplates(templates, type)[0]?.template;
    if (best) setTemplateId(best.id);
  };

  const onApply = async () => {
    if (!docs) return;
    await apply(docs, mode, template.name);
  };

  const titleId = useId();

  if (step === 'shop') {
    return (
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-y-auto bg-slate-50 p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <span className="theme-bg theme-text inline-flex h-11 w-11 items-center justify-center rounded-xl"><Sparkles className="h-6 w-6" aria-hidden /></span>
          <h1 id={titleId} ref={heading} tabIndex={-1} className="mt-4 text-2xl font-bold text-slate-900 outline-none">Let’s design your store</h1>
          <p className="mt-1 text-slate-600">What do you sell? We’ll suggest templates made for it. You can change colours, fonts and every section afterwards.</p>
          <div role="radiogroup" aria-label="What do you sell?" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SHOP_TYPES.map(t => {
              const active = shopType === t.id;
              return (
                <button key={t.id} type="button" role="radio" aria-checked={active} onClick={() => chooseShop(t.id)}
                  className={`flex min-h-12 cursor-pointer items-center justify-between gap-2 rounded-xl border px-4 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] ${active ? 'theme-border theme-text border-2 bg-white' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                  {t.label} {active && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={cancel} className="min-h-11 cursor-pointer rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Skip for now</button>
            <button type="button" onClick={() => setStep('pick')} className="theme-btn min-h-11 cursor-pointer rounded-xl px-6 text-sm font-semibold shadow-sm">
              {shopType ? 'Show templates' : 'See all templates'}
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-600">Nothing changes for shoppers until you publish.</p>
        </div>
      </div>
    );
  }

  const palettes = registry.listPalettes();
  const suggested = template.palettes.map(id => registry.getPalette(id)).filter((p): p is PaletteDef => !!p);
  const others = palettes.filter(p => !template.palettes.includes(p.id));
  const activePalette = palettePick ?? (ready?.site.theme.palette.presetId ?? (ready?.site.theme.palette.custom ? BRAND_PALETTE : null));

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-50 flex h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-2 sm:px-3">
        {firstRun ? (
          <button type="button" onClick={() => setStep('shop')} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Back</span>
          </button>
        ) : null}
        <h1 id={titleId} ref={heading} tabIndex={-1} className="min-w-0 truncate px-2 text-base font-semibold outline-none">Choose a template</h1>
        <div className="mx-auto hidden w-56 md:block"><DevicePicker /></div>
        <button type="button" onClick={cancel} disabled={applying} aria-label={firstRun ? 'Skip for now' : 'Close without changing'} className="ml-auto inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50 md:ml-0">
          <X className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Choices */}
        <aside aria-label="Templates and options" className={`${pane === 'choose' ? 'flex' : 'hidden'} w-full shrink-0 flex-col border-r border-slate-200 bg-white lg:flex lg:w-[380px]`}>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
            {shopType && (
              <p className="text-xs text-slate-600">Showing templates for <strong className="font-semibold text-slate-900">{SHOP_TYPES.find(s => s.id === shopType)?.label}</strong> first.</p>
            )}
            <div role="radiogroup" aria-label="Template" className="space-y-2">
              {ordered.map(({ template: t, recommended }) => (
                <TemplateCard key={t.id} t={t} active={t.id === template.id} recommended={recommended} current={t.id === currentTemplateId} onPick={() => setTemplateId(t.id)} />
              ))}
            </div>

            <section aria-labelledby={`${titleId}-colours`}>
              <h2 id={`${titleId}-colours`} className="mb-2 text-sm font-semibold">Colours</h2>
              <div role="radiogroup" aria-label="Palette" className="grid grid-cols-2 gap-2">
                {suggested.map(p => <PaletteOption key={p.id} name={p.name} colors={Object.values(p.colors)} active={activePalette === p.id} onPick={() => setPalette(p.id)} tag="Suggested" />)}
                {hasBrandColours(store) && (
                  <PaletteOption name="My brand colours" colors={[store.themeColor!, store.secondaryColor ?? store.themeColor!, store.accentColor ?? store.themeColor!]} active={activePalette === BRAND_PALETTE} onPick={() => setPalette(BRAND_PALETTE)} />
                )}
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer rounded-lg py-1 text-sm font-medium text-slate-600 hover:text-slate-900">More colours</summary>
                <div role="radiogroup" aria-label="More palettes" className="mt-2 grid grid-cols-2 gap-2">
                  {others.map(p => <PaletteOption key={p.id} name={p.name} colors={Object.values(p.colors)} active={activePalette === p.id} onPick={() => setPalette(p.id)} tag={p.dark ? 'Dark' : undefined} />)}
                </div>
              </details>
            </section>

            <section>
              <label htmlFor={`${titleId}-font`} className="mb-2 block text-sm font-semibold">Fonts</label>
              <select id={`${titleId}-font`} className={`${INPUT} cursor-pointer`} value={fontPick ?? ready?.site.theme.fontPair ?? template.fontPair} onChange={e => setFont(e.target.value)}>
                {registry.listFontPairs().map(f => <option key={f.id} value={f.id}>{f.name}{f.id === template.fontPair ? ' (template’s choice)' : ''}</option>)}
              </select>
            </section>

            {!firstRun && (
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Your pages</legend>
                <div className="space-y-2">
                  <ModeOption checked={mode === 'keep'} onPick={() => setMode('keep')} title="Keep my pages" text="Change only the look: style, colours, fonts, header, footer and product display. Your page sections and menus stay." />
                  <ModeOption checked={mode === 'replace'} onPick={() => setMode('replace')} title="Use the template’s pages" text={`Replace the drafts of Home, the catalogue and the product page${ready?.pages?.length ? `, and add ${ready.pages.map(p => p.title).join(', ')}` : ''}. Your live store stays as it is until you publish.`} />
                </div>
              </fieldset>
            )}
          </div>

          <div className="shrink-0 space-y-2 border-t border-slate-200 p-4">
            {loadFailed && (
              <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden /> This template didn’t load.
                <button type="button" className="cursor-pointer underline" onClick={() => setAttempt(a => a + 1)}>Retry</button>
              </p>
            )}
            <button type="button" onClick={() => { void onApply(); }} disabled={!docs || applying} className="theme-btn inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
              {applying && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />}
              {firstRun ? `Use ${template.name}` : `Apply ${template.name}`}
            </button>
            <p className="text-center text-xs text-slate-600">Saved as a draft — shoppers see it after you publish.</p>
          </div>
        </aside>

        {/* Live preview */}
        <main aria-label="Template preview" className={`${pane === 'preview' ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col lg:flex`}>
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 py-2">
            <div className="w-full max-w-sm">
              <Segmented<PreviewPage>
                label="Preview page"
                size="sm"
                value={previewPage}
                onChange={setPreviewPage}
                options={[{ value: 'home', label: 'Home' }, { value: 'collection', label: 'Catalogue' }, { value: 'product', label: 'Product page' }]}
              />
            </div>
            {!ready && !loadFailed && <Loader2 className="h-4 w-4 animate-spin text-slate-400 motion-reduce:animate-none" aria-label="Loading template" />}
          </div>
          <div className="min-h-0 flex-1"><PreviewFrame /></div>
        </main>
      </div>

      {/* Phones / small tablets: choose ↔ preview. */}
      <nav aria-label="Wizard panes" className="grid shrink-0 grid-cols-2 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {([['choose', 'Templates'], ['preview', 'Preview']] as const).map(([id, label]) => (
          <button key={id} type="button" aria-current={pane === id} onClick={() => setPane(id)} className={`min-h-12 cursor-pointer text-sm font-medium ${pane === id ? 'theme-text' : 'text-slate-500'}`}>{label}</button>
        ))}
      </nav>
    </div>
  );
}

function DevicePicker() {
  const device = useEditor(s => s.device);
  const setDevice = useEditor(s => s.setDevice);
  return (
    <Segmented<Device>
      label="Preview size"
      size="sm"
      value={device}
      onChange={setDevice}
      options={[
        { value: 'desktop', label: <Monitor className="h-4 w-4" aria-hidden />, title: 'Desktop' },
        { value: 'tablet', label: <Tablet className="h-4 w-4" aria-hidden />, title: 'Tablet' },
        { value: 'mobile', label: <Smartphone className="h-4 w-4" aria-hidden />, title: 'Phone' },
      ]}
    />
  );
}

function TemplateCard({ t, active, recommended, current, onPick }: { t: TemplateManifest; active: boolean; recommended: boolean; current: boolean; onPick: () => void }) {
  const store = useEditor(s => s.store);
  // Its default palette, or (Starter) the store's own brand colours.
  const preset = registry.getPalette(t.palettes[0] ?? '');
  const swatch = preset ? Object.values(preset.colors) : [store?.themeColor, store?.secondaryColor, store?.accentColor].filter((c): c is string => isHex(c));
  const font = registry.getFontPair(t.fontPair);
  return (
    <button type="button" role="radio" aria-checked={active} onClick={onPick}
      className={`w-full cursor-pointer rounded-2xl border bg-white p-3 text-left transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] ${active ? 'theme-border border-2 shadow-sm' : 'border-slate-200 hover:shadow-sm'}`}>
      <span className="flex h-8 overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-900/5" aria-hidden>
        {swatch.map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}
      </span>
      <span className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={`text-sm font-semibold ${active ? 'theme-text' : 'text-slate-900'}`}>{t.name}</span>
        {recommended && <span className="theme-badge rounded-full px-2 py-0.5 text-[11px] font-semibold">Made for your shop</span>}
        {current && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">Current</span>}
      </span>
      <span className="mt-0.5 block text-xs leading-snug text-slate-600">{t.mood ?? t.description}</span>
      {font && <span className="mt-1 block text-[11px] text-slate-500">Fonts: {font.name}</span>}
    </button>
  );
}

function PaletteOption({ name, colors, active, onPick, tag }: { name: string; colors: string[]; active: boolean; onPick: () => void; tag?: string }) {
  return (
    <button type="button" role="radio" aria-checked={active} onClick={onPick}
      className={`cursor-pointer rounded-xl border bg-white p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] ${active ? 'theme-border border-2' : 'border-slate-200 hover:border-slate-300'}`}>
      <span className="flex h-6 overflow-hidden rounded-md ring-1 ring-slate-900/5" aria-hidden>
        {colors.map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}
      </span>
      <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-slate-800">
        <span className="truncate">{name}</span>
        {tag && <span className="shrink-0 rounded bg-slate-100 px-1 text-[10px] font-semibold text-slate-600">{tag}</span>}
      </span>
    </button>
  );
}

function ModeOption({ checked, onPick, title, text }: { checked: boolean; onPick: () => void; title: string; text: string }) {
  return (
    <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${checked ? 'theme-border border-2' : 'border-slate-200'}`}>
      <input type="radio" name="template-mode" checked={checked} onChange={onPick} className="mt-0.5 h-4 w-4 cursor-pointer" style={{ accentColor: 'var(--rc-primary)' }} />
      <span>
        <span className="block text-sm font-medium text-slate-900">{title}</span>
        <span className="block text-xs leading-snug text-slate-600">{text}</span>
      </span>
    </label>
  );
}
