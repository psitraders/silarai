import { AlertTriangle, Check, LayoutTemplate, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { registry } from '../../core/registry';
import { FALLBACK_STYLE, fontStack, googleFontsHref, resolveTheme } from '../../core/theme/buildTheme';
import { contrast, isHex } from '../../core/theme/color';
import { buildSchemes } from '../../core/theme/schemes';
import { styleTokens } from '../../core/theme/styleTokens';
import { SCHEME_IDS, type PaletteColors, type StyleOptions } from '../../core/types';
import { useEditor } from '../state/store';
import { Group, INPUT, Segmented, Toggle } from '../ui/controls';
import { useToast } from '../ui/toastStore';
import { Behaviour } from './BehaviourPanel';
import { SCHEME_NAMES } from './schemeNames';
import { STYLE_GROUPS, type StyleField } from './styleFields';

/** Left panel "Style": style kit, colours (palettes, custom, contrast), fonts, fine-tune and store behaviour. */
export function ThemePanel() {
  const site = useEditor(s => s.site);
  if (!site) return null;
  return (
    <div>
      <CurrentTemplate />
      <Group title="Style kit"><StyleKits /></Group>
      <Group title="Colours"><Colours /></Group>
      <Group title="Fonts"><Fonts /></Group>
      <FineTune />
      <Group title="Store behaviour" defaultOpen={false}><Behaviour /></Group>
    </div>
  );
}

/** Which template the design started from, with "Change template" (opens the wizard). */
function CurrentTemplate() {
  const templateId = useEditor(s => s.site?.templateId ?? null);
  const openWizard = useEditor(s => s.openWizard);
  const show = useToast(s => s.show);
  const [opening, setOpening] = useState(false);
  const template = templateId ? registry.getTemplate(templateId) : undefined;
  const open = async () => {
    setOpening(true);
    // Save pending edits first: the wizard may replace these documents.
    const saved = await useEditor.getState().flush();
    setOpening(false);
    if (saved) openWizard();
    else show('error', 'Your latest changes couldn’t be saved yet. Fix the error, then change the template.');
  };
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 p-4">
      <span className="theme-bg theme-text inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"><LayoutTemplate className="h-5 w-5" aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">Template</p>
        <p className="truncate text-sm font-semibold text-slate-900">{template?.name ?? 'Custom design'}</p>
      </div>
      <button type="button" onClick={() => { void open(); }} disabled={opening} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
        {opening && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />} Change
      </button>
    </div>
  );
}

function StyleKits() {
  const theme = useEditor(s => s.site!.theme);
  const updateSite = useEditor(s => s.updateSite);
  const show = useToast(s => s.show);
  const palette = resolveTheme(theme).palette;
  const apply = (id: string) => {
    const hadOverrides = Object.keys(theme.overrides ?? {}).length > 0;
    updateSite(s => { s.theme.styleKit = id; s.theme.overrides = {}; });
    if (hadOverrides) show('success', 'Style kit applied — your fine-tune changes were reset.');
  };
  return (
    <div role="radiogroup" aria-label="Style kit" className="grid grid-cols-2 gap-2">
      {registry.listStyleKits().map(kit => {
        const t = styleTokens({ ...FALLBACK_STYLE, ...kit.options });
        const active = theme.styleKit === kit.id;
        return (
          <button key={kit.id} type="button" role="radio" aria-checked={active} onClick={() => apply(kit.id)} title={kit.description}
            className={`cursor-pointer overflow-hidden rounded-xl border bg-white text-left transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] ${active ? 'theme-border border-2 shadow-sm' : 'border-slate-200 hover:shadow-sm'}`}>
            <span className="flex h-16 items-center justify-center gap-2 px-2" style={{ background: palette.background }}>
              <span className="h-10 w-9" style={{ background: '#fff', borderRadius: t['--sf-card-radius'], boxShadow: t['--sf-card-shadow'] === 'none' ? undefined : t['--sf-card-shadow'].replace(/var\(--sf-text\)/g, palette.text), border: t['--sf-card-border-width'] !== '0px' ? `1px solid ${palette.text}33` : undefined }} />
              <span className="inline-flex h-6 items-center px-2.5 text-[9px] font-bold" style={{ borderRadius: t['--sf-btn-radius'], textTransform: t['--sf-btn-case'] as 'none', background: kit.options.buttonStyle === 'outline' ? 'transparent' : palette.primary, color: kit.options.buttonStyle === 'outline' ? palette.primary : '#fff', border: `1.5px solid ${palette.primary}`, boxShadow: kit.options.buttonStyle === 'hard-shadow' ? `2px 2px 0 ${palette.text}` : undefined }}>Shop</span>
            </span>
            <span className="block border-t border-slate-100 px-2.5 py-2">
              <span className={`block text-sm font-semibold ${active ? 'theme-text' : 'text-slate-900'}`}>{kit.name}</span>
              <span className="line-clamp-2 block text-[11px] leading-snug text-slate-500">{kit.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const COLOR_ROLES: { key: keyof PaletteColors; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
];

function Colours() {
  const theme = useEditor(s => s.site!.theme);
  const updateSite = useEditor(s => s.updateSite);
  const resolved = resolveTheme(theme);
  const isCustom = !!theme.palette.custom;

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Palette" className="grid grid-cols-2 gap-2">
        {registry.listPalettes().map(p => {
          const active = !isCustom && theme.palette.presetId === p.id;
          return (
            <button key={p.id} type="button" role="radio" aria-checked={active} title={p.fits} onClick={() => updateSite(s => { s.theme.palette = { presetId: p.id }; })}
              className={`cursor-pointer rounded-xl border bg-white p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] ${active ? 'theme-border border-2' : 'border-slate-200 hover:border-slate-300'}`}>
              <span className="flex h-6 overflow-hidden rounded-md ring-1 ring-slate-900/5">
                {COLOR_ROLES.map(r => <span key={r.key} className="flex-1" style={{ background: p.colors[r.key] }} />)}
              </span>
              <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-slate-800">
                <span className="truncate">{p.name}</span>
                {p.dark && <span className="rounded bg-slate-800 px-1 text-[9px] font-semibold text-white">DARK</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 p-3">
        <Toggle
          label="Use my own colours"
          helper="Pick 5 colours — schemes and readable text are generated for you."
          checked={isCustom}
          onChange={on => updateSite(s => { s.theme.palette = on ? { custom: { ...resolved.palette } } : { presetId: 'teal-classic' }; })}
        />
        {isCustom && (
          <div className="mt-3 space-y-2">
            {COLOR_ROLES.map(r => <ColorInput key={r.key} label={r.label} value={theme.palette.custom![r.key]} onChange={v => updateSite(s => { s.theme.palette.custom![r.key] = v; })} />)}
          </div>
        )}
      </div>

      <ContrastReport palette={resolved.palette} />
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  // While typing, show the text as typed; otherwise always the stored colour.
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input type="color" value={isHex(value) ? value : '#000000'} onChange={e => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5" aria-label={`${label} colour`} />
      <span className="w-24 shrink-0">{label}</span>
      <input value={editing ?? value} onFocus={() => setEditing(value)} onBlur={() => setEditing(null)} onChange={e => { setEditing(e.target.value); if (isHex(e.target.value)) onChange(e.target.value); }} className={`${INPUT} font-mono`} aria-label={`${label} hex value`} maxLength={7} />
    </label>
  );
}

/** SB-R8: checks every scheme of the palette against WCAG AA. */
function ContrastReport({ palette }: { palette: PaletteColors }) {
  const rows = useMemo(() => {
    const schemes = buildSchemes(palette);
    return SCHEME_IDS.map(id => {
      const s = schemes[id];
      const checks = [
        { label: 'Text', ratio: contrast(s.text, s.bg), min: 4.5 },
        { label: 'Muted text', ratio: contrast(s.muted, s.bg), min: 4.5 },
        { label: 'Button text', ratio: contrast(s.onButton, s.button), min: 4.5 },
        { label: 'Button edge', ratio: contrast(s.button, s.bg), min: 3 },
      ];
      return { id, s, failing: checks.filter(c => c.ratio < c.min) };
    });
  }, [palette]);
  const problems = rows.filter(r => r.failing.length);
  return (
    <div className="rounded-xl border border-slate-200">
      <p className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
        {problems.length ? <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden /> : <Check className="h-4 w-4 text-green-600" aria-hidden />}
        {problems.length ? `Readability: ${problems.length} scheme${problems.length > 1 ? 's' : ''} need attention` : 'Readability: all 5 schemes pass WCAG AA'}
      </p>
      <ul className="divide-y divide-slate-100">
        {rows.map(({ id, s, failing }) => (
          <li key={id} className="flex items-center gap-2 px-3 py-2 text-xs">
            <span className="flex h-7 w-12 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ring-1 ring-slate-900/5" style={{ background: s.bg, color: s.text }}>Aa</span>
            <span className="w-16 shrink-0 font-medium text-slate-700">{SCHEME_NAMES[id]}</span>
            {failing.length ? (
              <span className="text-amber-700">{failing.map(f => `${f.label} ${f.ratio.toFixed(1)}:1`).join(' · ')}</span>
            ) : (
              <span className="text-green-700">Passes</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Fonts() {
  const theme = useEditor(s => s.site!.theme);
  const updateSite = useEditor(s => s.updateSite);
  const pairs = registry.listFontPairs();

  // Load every pair once so merchants see real samples (editor only; the store loads one pair).
  useEffect(() => {
    for (const p of pairs) {
      const href = googleFontsHref(p);
      const id = `sb-font-sample-${p.id}`;
      if (!href || document.getElementById(id)) continue;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }, [pairs]);

  return (
    <div role="radiogroup" aria-label="Font pair" className="space-y-2">
      {pairs.map(p => {
        const active = theme.fontPair === p.id;
        return (
          <button key={p.id} type="button" role="radio" aria-checked={active} onClick={() => updateSite(s => { s.theme.fontPair = p.id; })}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] ${active ? 'theme-border border-2' : 'border-slate-200 hover:border-slate-300'}`}>
            <span className="w-10 shrink-0 text-2xl text-slate-900" style={{ fontFamily: fontStack(p.heading) }}>Aa</span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-slate-900" style={{ fontFamily: fontStack(p.heading), fontWeight: 700 }}>{p.name}</span>
              <span className="block truncate text-xs text-slate-500" style={{ fontFamily: fontStack(p.body) }}>{p.heading.family} / {p.body.family}{p.mood ? ` · ${p.mood}` : ''}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FineTune() {
  const theme = useEditor(s => s.site!.theme);
  const updateSite = useEditor(s => s.updateSite);
  const style = resolveTheme(theme).style;
  const overrides = theme.overrides ?? {};
  const count = Object.keys(overrides).length;
  const set = (key: keyof StyleOptions, value: unknown) => updateSite(s => {
    const kit = registry.getStyleKit(s.theme.styleKit)?.options ?? {};
    const base = { ...FALLBACK_STYLE, ...kit }[key];
    const next = { ...(s.theme.overrides ?? {}) } as Record<string, unknown>;
    if (base === value) delete next[key]; else next[key] = value;
    s.theme.overrides = next as Partial<StyleOptions>;
  });

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fine-tune {count > 0 && <span className="theme-badge ml-1 rounded-full px-1.5 py-0.5 normal-case tracking-normal">{count} changed</span>}</p>
        {count > 0 && (
          <button type="button" onClick={() => updateSite(s => { s.theme.overrides = {}; })} className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset to kit
          </button>
        )}
      </div>
      {STYLE_GROUPS.map(g => (
        <Group key={g.title} title={g.title} defaultOpen={false}>
          {g.fields.map(f => <StyleControl key={f.key} field={f} value={style[f.key]} changed={f.key in overrides} onChange={v => set(f.key, v)} />)}
        </Group>
      ))}
    </>
  );
}

function StyleControl({ field, value, changed, onChange }: { field: StyleField; value: unknown; changed: boolean; onChange: (v: unknown) => void }) {
  const label = <>{field.label}{changed && <span className="theme-text ml-1" title="Changed from the style kit">•</span>}</>;
  if (!field.options) return <Toggle label={field.label + (changed ? ' •' : '')} helper={field.helper} checked={!!value} onChange={onChange} />;
  const opts = field.options as { value: string | number; label: string }[];
  const compact = opts.length <= 4 && opts.every(o => o.label.length <= 10);
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      {field.helper && <p className="-mt-1 mb-1.5 text-xs text-slate-500">{field.helper}</p>}
      {compact ? (
        <Segmented label={field.label} size="sm" value={value as string | number} options={opts} onChange={onChange} />
      ) : (
        <select aria-label={field.label} value={String(value)} onChange={e => { const o = opts.find(x => String(x.value) === e.target.value); if (o) onChange(o.value); }} className={INPUT}>
          {opts.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
        </select>
      )}
    </div>
  );
}
