import { Check, Pencil, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { canUse } from '../../core/canUse';
import { registry } from '../../core/registry';
import { editorPacks } from '../packs';
import type { EditorPack, SectionPreset } from '../../core/types';
import { apiErrorMessage, type SavedSection } from '../api';
import { useSavedSectionMutations, useSavedSections } from '../state/savedSections';
import { sectionFromPreset, sectionFromSaved } from '../state/sectionFactory';
import { isProductKey, useEditor } from '../state/store';
import { IconButton } from '../ui/controls';
import { Thumb } from '../ui/Thumb';
import { useToast } from '../ui/toastStore';

const GROUP_ORDER = ['Product page', 'Hero', 'Products', 'Content', 'Media', 'Trust', 'Conversion', 'Contact', 'Utility'];
/** Sections that need the product being viewed — offered on the Product page template only. */
const PRODUCT_ONLY = 'Product page';

interface Card { key: string; manifest: EditorPack; preset?: SectionPreset; saved?: SavedSection; name: string; description: string; group: string }

/** The merchant's own saved sections come first. */
const SAVED_GROUP = 'Saved';

/** Gallery group of a template's signature widgets, e.g. "Noor exclusives". */
const exclusivesGroup = (templateId: string) => `${registry.getTemplate(templateId)?.name ?? templateId} exclusives`;

/** "Add section": searchable, grouped gallery of every section pack and its ready-made presets. */
export function SectionGallery() {
  const gallery = useEditor(s => s.gallery);
  const close = useEditor(s => s.closeGallery);
  const addSection = useEditor(s => s.addSection);
  const onProductPage = useEditor(s => isProductKey(s.currentPage, s.productDesignIds));
  const templateId = useEditor(s => s.site?.templateId ?? null);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('All');
  const dialog = useRef<HTMLDivElement>(null);
  const savedQuery = useSavedSections(!!gallery);
  const savedList = savedQuery.data;

  // Signature widgets are grouped per template; the store's own template comes first (SB-R14).
  const ownGroup = templateId ? exclusivesGroup(templateId) : null;
  const cards = useMemo<Card[]>(() => {
    const rank = (g: string) => (g === SAVED_GROUP ? -2 : g === ownGroup ? -1 : GROUP_ORDER.indexOf(g) === -1 ? 99 : GROUP_ORDER.indexOf(g));
    const saved = (savedList ?? []).flatMap<Card>(s => {
      const m = editorPacks.get('section', s.sectionType);
      if (!m || (m.group === PRODUCT_ONLY && !onProductPage)) return [];
      return [{ key: `saved:${s.id}`, manifest: m, saved: s, name: s.name, description: m.name, group: SAVED_GROUP }];
    });
    const packs = editorPacks.list('section').flatMap<Card>(m => {
      const group = m.template ? exclusivesGroup(m.template) : m.group ?? 'Utility';
      if (group === PRODUCT_ONLY && !onProductPage) return [];
      const presets = m.presets?.length ? m.presets : [undefined];
      return presets.map(p => ({
        key: `${m.id}:${p?.id ?? 'default'}`,
        manifest: m,
        preset: p,
        name: p?.name ?? m.name,
        description: p?.description ?? m.description ?? '',
        group,
      }));
    });
    // Stable sort: saved sections keep their newest-first order.
    return [...saved, ...packs].sort((a, b) => rank(a.group) - rank(b.group) || a.group.localeCompare(b.group) || (a.saved ? 0 : a.manifest.name.localeCompare(b.manifest.name)));
  }, [onProductPage, ownGroup, savedList]);

  const groups = useMemo(() => ['All', ...[...new Set(cards.map(c => c.group))]], [cards]);
  const q = query.trim().toLowerCase();
  const shown = cards.filter(c => (group === 'All' || c.group === group) && (!q || `${c.name} ${c.description} ${c.manifest.name} ${(c.manifest.keywords ?? []).join(' ')}`.toLowerCase().includes(q)));

  useEffect(() => {
    if (!gallery) return;
    const prev = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLInputElement>('input')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [gallery, close]);

  if (!gallery) return null;

  const pick = (c: Card) => {
    addSection(c.saved ? sectionFromSaved(c.saved.section) : sectionFromPreset(c.manifest, c.preset), gallery.index);
    close();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="sb-gallery-title">
      <div className="absolute inset-0 bg-slate-900/40" onClick={close} aria-hidden />
      <div ref={dialog} className="relative flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:h-[85dvh] sm:rounded-2xl">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="sb-gallery-title" className="text-lg font-semibold text-slate-900">Add a section</h2>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search sections…" aria-label="Search sections" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)] sm:text-sm" />
          </div>
          <button type="button" onClick={close} aria-label="Close" className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav aria-label="Section groups" className="shrink-0 border-b border-slate-100 sm:w-48 sm:border-b-0 sm:border-r">
            <ul className="flex gap-1 overflow-x-auto p-2 sm:flex-col">
              {groups.map(g => (
                <li key={g} className="shrink-0">
                  <button type="button" aria-current={group === g} onClick={() => setGroup(g)} className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium ${group === g ? 'theme-nav-active' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {g}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {shown.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No sections match “{query}”.</p>}
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map(c => {
                const allowed = canUse(c.manifest);
                return (
                  <li key={c.key} className="relative">
                    {c.saved && <SavedActions saved={c.saved} />}
                    <button type="button" disabled={!allowed} onClick={() => pick(c)} className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition-shadow hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] disabled:cursor-not-allowed disabled:opacity-60">
                      <span className="block border-b border-slate-100 bg-slate-50 p-3"><Thumb rects={c.manifest.layouts[c.preset?.layout ?? c.manifest.defaultLayout]?.thumb} className="rounded-md" /></span>
                      <span className="flex flex-1 flex-col gap-1 p-3">
                        <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                        <span className="text-xs text-slate-500">{c.preset ? `${c.manifest.name} · ` : ''}{c.description}</span>
                        <span className="mt-auto pt-1 text-[11px] font-medium text-slate-400">{Object.keys(c.manifest.layouts).length} layout{Object.keys(c.manifest.layouts).length === 1 ? '' : 's'}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Rename / delete for a saved section card (sits over the card's top-right corner). */
function SavedActions({ saved }: { saved: SavedSection }) {
  const { rename, remove } = useSavedSectionMutations();
  const show = useToast(s => s.show);
  const [mode, setMode] = useState<'idle' | 'rename' | 'delete'>('idle');
  const [name, setName] = useState(saved.name);
  const onError = (err: unknown) => show('error', apiErrorMessage(err));

  if (mode === 'rename') {
    return (
      <form
        className="absolute inset-x-2 top-2 z-10 flex gap-1 rounded-lg bg-white p-1 shadow-md"
        onSubmit={e => {
          e.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          rename.mutate({ id: saved.id, name: trimmed }, { onSuccess: () => setMode('idle'), onError });
        }}
      >
        <input autoFocus maxLength={100} value={name} onChange={e => setName(e.target.value)} aria-label="Saved section name" className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1 text-base sm:text-sm" />
        <button type="submit" aria-label="Save name" title="Save name" disabled={rename.isPending} className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"><Check className="h-4 w-4" aria-hidden /></button>
        <IconButton label="Cancel" onClick={() => { setName(saved.name); setMode('idle'); }}><X className="h-4 w-4" aria-hidden /></IconButton>
      </form>
    );
  }
  if (mode === 'delete') {
    return (
      <div className="absolute inset-x-2 top-2 z-10 flex items-center gap-2 rounded-lg bg-white p-2 text-xs shadow-md" role="group" aria-label="Delete saved section">
        <span className="flex-1 text-slate-700">Delete “{saved.name}”? Pages using it keep their copy.</span>
        <button type="button" disabled={remove.isPending} onClick={() => remove.mutate(saved, { onError })} className="cursor-pointer rounded-md bg-red-600 px-2 py-1 font-semibold text-white hover:bg-red-700 disabled:opacity-60">Delete</button>
        <button type="button" onClick={() => setMode('idle')} className="cursor-pointer rounded-md px-2 py-1 font-medium text-slate-600 hover:bg-slate-100">Keep</button>
      </div>
    );
  }
  return (
    <div className="absolute right-2 top-2 z-10 flex gap-1 rounded-lg bg-white/90 shadow-sm">
      <IconButton label={`Rename ${saved.name}`} onClick={() => setMode('rename')}><Pencil className="h-4 w-4" aria-hidden /></IconButton>
      <IconButton label={`Delete ${saved.name}`} tone="danger" onClick={() => setMode('delete')}><Trash2 className="h-4 w-4" aria-hidden /></IconButton>
    </div>
  );
}
