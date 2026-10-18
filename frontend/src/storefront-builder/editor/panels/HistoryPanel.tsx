import { AlertCircle, History, Loader2, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import type { PageLayout } from '../../core/types';
import type { StoreVersion } from '../api';
import { starterFor } from '../state/starter';
import { useEditor, type PageKey } from '../state/store';
import { SYSTEM_PAGE_KEYS, SYSTEM_PAGES, isSystemPage } from '../state/systemPages';
import { pageKeyFor, useRestoreVersion, useVersionDetail, useVersions } from '../state/useVersionHistory';

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const label = (v: StoreVersion) => `Version ${v.version}`;

/**
 * Version history (replaces the left panel while open): the last 10 publishes. Picking one shows
 * it in the preview, read-only; "Restore" copies it into the draft (nothing goes live until Publish).
 */
export function HistoryPanel() {
  const close = useEditor(s => s.setHistoryOpen);
  const store = useEditor(s => s.store);
  const setTemplatePreview = useEditor(s => s.setTemplatePreview);
  const setCurrentPage = useEditor(s => s.setCurrentPage);
  const versions = useVersions(true);
  const [selected, setSelected] = useState<StoreVersion | null>(null);
  const detail = useVersionDetail(selected?.id ?? null);
  const [confirming, setConfirming] = useState(false);
  const { restore, restoring } = useRestoreVersion();

  // The editor's page comes back when history closes without restoring.
  const startPage = useRef(useEditor.getState().currentPage);
  const restored = useRef(false);
  useEffect(() => () => {
    setTemplatePreview(null);
    if (!restored.current) setCurrentPage(startPage.current);
  }, [setTemplatePreview, setCurrentPage]);

  // The selected version's pages, keyed like the editor's (system key or custom page id).
  const pages = useMemo(() => {
    if (!detail.data || !store) return null;
    const starter = starterFor(store);
    const layouts: Record<PageKey, PageLayout> = { home: starter.home, collection: starter.collection, product: starter.product };
    const custom: { key: string; title: string }[] = [];
    for (const p of detail.data.pages) {
      if (!p.layout) continue;
      const key = pageKeyFor(p.pageType, p.pageId);
      if (key === p.pageId && p.pageType !== 'Custom' && p.pageType !== 'AltProductTemplate') continue; // other system pages aren't previewed
      layouts[key] = p.layout;
      if (!isSystemPage(key)) custom.push({ key, title: p.title || 'Page' });
    }
    return { layouts, custom };
  }, [detail.data, store]);

  useEffect(() => {
    if (!selected || !detail.data || !pages) { setTemplatePreview(null); return; }
    setTemplatePreview({ site: detail.data.site, layouts: pages.layouts });
    const current = useEditor.getState().currentPage;
    if (!pages.layouts[current]) setCurrentPage('home');
  }, [selected, detail.data, pages, setTemplatePreview, setCurrentPage]);

  const previewPage = useEditor(s => s.currentPage);

  const doRestore = async () => {
    if (!selected) return;
    restored.current = true;
    const ok = await restore(selected.id, label(selected));
    if (ok) { setConfirming(false); close(false); } else restored.current = false;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-14 shrink-0 items-center gap-2 border-b border-slate-200 px-4">
        <History className="h-5 w-5 text-slate-500" aria-hidden />
        <h2 className="flex-1 text-sm font-semibold text-slate-900">Version history</h2>
        <button type="button" onClick={() => close(false)} aria-label="Close version history" className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" aria-hidden /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="px-1 pb-3 text-xs text-slate-500">Your last 10 publishes. Pick one to preview it, then restore it to your draft if you want it back.</p>
        <ul className="space-y-1">
          <li>
            <button type="button" aria-current={!selected} onClick={() => setSelected(null)} className={`w-full cursor-pointer rounded-xl px-3 py-2.5 text-left ${!selected ? 'theme-nav-active' : 'hover:bg-slate-50'}`}>
              <span className="block text-sm font-semibold text-slate-900">Current draft</span>
              <span className="block text-xs text-slate-500">What you’re editing now</span>
            </button>
          </li>
          {versions.isLoading && <li className="flex justify-center py-6" role="status"><Loader2 className="h-5 w-5 animate-spin text-slate-400 motion-reduce:animate-none" aria-hidden /><span className="sr-only">Loading versions…</span></li>}
          {versions.isError && (
            <li className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> Couldn’t load versions.
              <button type="button" onClick={() => { void versions.refetch(); }} className="ml-auto cursor-pointer underline">Retry</button>
            </li>
          )}
          {versions.data?.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-500">Nothing published yet. Each publish is kept here.</li>}
          {versions.data?.map((v, i) => (
            <li key={v.id}>
              <button type="button" aria-current={selected?.id === v.id} onClick={() => setSelected(v)} className={`w-full cursor-pointer rounded-xl px-3 py-2.5 text-left ${selected?.id === v.id ? 'theme-nav-active' : 'hover:bg-slate-50'}`}>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  {label(v)}
                  {i === 0 && <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">Live</span>}
                </span>
                <span className="block text-xs text-slate-500">{when(v.publishedAt)}{v.publishedBy ? ` · ${v.publishedBy}` : ''} · {v.pageCount} page{v.pageCount === 1 ? '' : 's'}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selected && (
        <div className="shrink-0 space-y-3 border-t border-slate-200 p-4">
          {detail.isLoading && <p className="flex items-center gap-2 text-xs text-slate-500" role="status"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> Loading preview…</p>}
          {detail.isError && <p className="text-xs text-red-600" role="alert">Couldn’t load this version.</p>}
          {pages && (
            <label className="block text-xs font-medium text-slate-600">
              Preview page
              <select value={pages.layouts[previewPage] ? previewPage : 'home'} onChange={e => setCurrentPage(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 sm:text-sm">
                {SYSTEM_PAGE_KEYS.map(k => <option key={k} value={k}>{SYSTEM_PAGES[k].title}</option>)}
                {pages.custom.map(p => <option key={p.key} value={p.key}>{p.title}</option>)}
              </select>
            </label>
          )}
          <button type="button" disabled={!detail.data || restoring} onClick={() => setConfirming(true)} className="theme-btn inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-60">
            <RotateCcw className="h-4 w-4" aria-hidden /> Restore {label(selected)}
          </button>
        </div>
      )}
      {confirming && selected && (
        <Modal open onClose={() => { if (!restoring) setConfirming(false); }} title={`Restore ${label(selected)}?`} size="sm">
          <p className="text-sm text-slate-600">
            Your draft’s look, header, footer and the pages in this version are replaced with how they were on {when(selected.publishedAt)}.
            Pages added since are kept. Your live store doesn’t change until you publish. Undo can’t reverse a restore.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirming(false)} disabled={restoring} className="min-h-10 cursor-pointer rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={() => { void doRestore(); }} disabled={restoring} className="theme-btn inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-60">
              {restoring && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />} Restore to draft
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
