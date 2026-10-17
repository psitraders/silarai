import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { canUse } from '../../core/canUse';
import { registry } from '../../core/registry';
import { editorPacks } from '../packs';
import type { EditorPack, SectionPreset } from '../../core/types';
import { sectionFromPreset } from '../state/sectionFactory';
import { useEditor } from '../state/store';
import { Thumb } from '../ui/Thumb';

const GROUP_ORDER = ['Product page', 'Hero', 'Products', 'Content', 'Media', 'Trust', 'Conversion', 'Contact', 'Utility'];
/** Sections that need the product being viewed — offered on the Product page template only. */
const PRODUCT_ONLY = 'Product page';

interface Card { key: string; manifest: EditorPack; preset?: SectionPreset; name: string; description: string; group: string }

/** Gallery group of a template's signature widgets, e.g. "Noor exclusives". */
const exclusivesGroup = (templateId: string) => `${registry.getTemplate(templateId)?.name ?? templateId} exclusives`;

/** "Add section": searchable, grouped gallery of every section pack and its ready-made presets. */
export function SectionGallery() {
  const gallery = useEditor(s => s.gallery);
  const close = useEditor(s => s.closeGallery);
  const addSection = useEditor(s => s.addSection);
  const onProductPage = useEditor(s => s.currentPage === 'product');
  const templateId = useEditor(s => s.site?.templateId ?? null);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('All');
  const dialog = useRef<HTMLDivElement>(null);

  // Signature widgets are grouped per template; the store's own template comes first (SB-R14).
  const ownGroup = templateId ? exclusivesGroup(templateId) : null;
  const cards = useMemo<Card[]>(() => {
    const rank = (g: string) => (g === ownGroup ? -1 : GROUP_ORDER.indexOf(g) === -1 ? 99 : GROUP_ORDER.indexOf(g));
    return editorPacks.list('section').flatMap(m => {
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
    }).sort((a, b) => rank(a.group) - rank(b.group) || a.group.localeCompare(b.group) || a.manifest.name.localeCompare(b.manifest.name));
  }, [onProductPage, ownGroup]);

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
    addSection(sectionFromPreset(c.manifest, c.preset), gallery.index);
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
                  <li key={c.key}>
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
