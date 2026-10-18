import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, FileText, Home, LayoutGrid, Package, PackagePlus, Pencil, Plus, Settings2, Sparkles, Tags, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { PageLayout } from '../../core/types';
import { Modal } from '../../../components/ui/Modal';
import { apiErrorMessage, builderApi, type BuilderPageSummary } from '../api';
import { ImageField } from '../fields/ImageField';
import { ManualPicker } from '../fields/ProductsField';
import { useEditorCategories } from '../fields/useStoreData';
import { clone } from '../state/ids';
import { starterFor } from '../state/starter';
import { PAGE_TEMPLATES, layoutFromTemplate } from '../state/pageTemplates';
import { useEditor } from '../state/store';
import { SYSTEM_PAGES } from '../state/systemPages';
import { PAGES_KEY, usePagesQuery } from '../state/useEditorBoot';
import { FieldLabel, IconButton, INPUT, Toggle } from '../ui/controls';
import { useToast } from '../ui/toastStore';

/** Left panel "Pages": unlimited custom pages plus the Home, catalogue and product designs. */
export function PagesPanel() {
  const { data: pages = [], isLoading } = usePagesQuery();
  const current = useEditor(s => s.currentPage);
  const setCurrentPage = useEditor(s => s.setCurrentPage);
  const setLeftTab = useEditor(s => s.setLeftTab);
  const forgetPage = useEditor(s => s.forgetPage);
  const openAi = useEditor(s => s.openAi);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BuilderPageSummary | null>(null);
  const [deleting, setDeleting] = useState<BuilderPageSummary | null>(null);
  const qc = useQueryClient();
  const show = useToast(s => s.show);
  const custom = pages.filter(p => p.pageType === 'Custom');
  const designs = pages.filter(p => p.pageType === 'AltProductTemplate');
  const [newDesign, setNewDesign] = useState(false);
  const [assigning, setAssigning] = useState<BuilderPageSummary | null>(null);

  const open = (key: string) => { setCurrentPage(key); setLeftTab('sections'); };

  const duplicate = useMutation({
    mutationFn: (id: string) => builderApi.duplicatePage(id),
    onSuccess: page => {
      void qc.invalidateQueries({ queryKey: PAGES_KEY });
      show('success', page.pageType === 'AltProductTemplate' ? `Created "${page.title}" — choose what uses it.` : `Created "${page.title}" (hidden until you make it visible).`);
    },
    onError: err => show('error', apiErrorMessage(err)),
  });

  const row = (key: string, title: string, subtitle: string, icon: ReactNode, actions?: ReactNode) => (
    <li className={`flex items-center gap-2 rounded-xl border py-1.5 pl-3 pr-1 ${current === key ? 'theme-border theme-bg border-2' : 'border-slate-200 bg-white'}`}>
      <span className="text-slate-400">{icon}</span>
      <button type="button" onClick={() => open(key)} className="min-w-0 flex-1 cursor-pointer text-left">
        <span className="block truncate text-sm font-medium text-slate-900">{title}</span>
        <span className="block truncate text-xs text-slate-500">{subtitle}</span>
      </button>
      <IconButton label={`Edit ${title}`} onClick={() => open(key)}><Pencil className="h-4 w-4" aria-hidden /></IconButton>
      {actions}
    </li>
  );

  return (
    <div className="space-y-5 p-4">
      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Store pages</p>
        <ul className="space-y-1.5">
          {row('home', SYSTEM_PAGES.home.title, SYSTEM_PAGES.home.subtitle, <Home className="h-4 w-4" aria-hidden />)}
          {row('collection', SYSTEM_PAGES.collection.title, SYSTEM_PAGES.collection.subtitle, <LayoutGrid className="h-4 w-4" aria-hidden />)}
          {row('product', SYSTEM_PAGES.product.title, SYSTEM_PAGES.product.subtitle, <Package className="h-4 w-4" aria-hidden />)}
        </ul>
      </div>

      <div>
        <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Other product designs · {designs.length}</p>
        <p className="mb-2 px-1 text-xs text-slate-500">Give some categories or products their own product page. Everything else uses the Product page above.</p>
        {designs.length > 0 && (
          <ul className="space-y-1.5">
            {designs.map(p => row(
              p.id,
              p.title,
              `${assignmentSummary(p)}${p.hasUnpublishedChanges ? ' · Unpublished changes' : ''}`,
              <Package className="h-4 w-4" aria-hidden />,
              <>
                <IconButton label={`Choose what uses ${p.title}`} onClick={() => setAssigning(p)}><Tags className="h-4 w-4" aria-hidden /></IconButton>
                <IconButton label={`Duplicate ${p.title}`} onClick={() => duplicate.mutate(p.id)}><Copy className="h-4 w-4" aria-hidden /></IconButton>
                <IconButton label={`Delete ${p.title}`} tone="danger" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4" aria-hidden /></IconButton>
              </>,
            ))}
          </ul>
        )}
        <button type="button" onClick={() => setNewDesign(true)} className="mt-2 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <PackagePlus className="h-4 w-4" aria-hidden /> New product design
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your pages · {custom.length}</p>
        </div>
        {isLoading ? (
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        ) : custom.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">No pages yet — add About, FAQ, Contact or anything you like.</p>
        ) : (
          <ul className="space-y-1.5">
            {custom.map(p => row(
              p.id,
              p.title,
              `/p/${p.slug} · ${p.isPublished ? 'Visible' : 'Hidden'}${p.showInNav ? ' · In menu' : ''}${p.hasUnpublishedChanges ? ' · Unpublished changes' : ''}`,
              <FileText className="h-4 w-4" aria-hidden />,
              <>
                <IconButton label={`${p.title} settings`} onClick={() => setEditing(p)}><Settings2 className="h-4 w-4" aria-hidden /></IconButton>
                <IconButton label={`Duplicate ${p.title}`} onClick={() => duplicate.mutate(p.id)}><Copy className="h-4 w-4" aria-hidden /></IconButton>
                <IconButton label={`Delete ${p.title}`} tone="danger" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4" aria-hidden /></IconButton>
              </>,
            ))}
          </ul>
        )}
        <button type="button" onClick={() => setCreating(true)} className="theme-btn mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold">
          <Plus className="h-4 w-4" aria-hidden /> New page
        </button>
        <button type="button" onClick={() => openAi('page')} className="mt-2 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Sparkles className="h-4 w-4" aria-hidden /> New page with AI
        </button>
      </div>

      {creating && <NewPageModal onClose={() => setCreating(false)} onCreated={id => { setCreating(false); open(id); }} />}
      {editing && <PageSettingsModal page={editing} onClose={() => setEditing(null)} />}
      {newDesign && <NewProductDesignModal onClose={() => setNewDesign(false)} onCreated={id => { setNewDesign(false); open(id); }} />}
      {assigning && <ProductDesignModal page={assigning} onClose={() => setAssigning(null)} />}
      {deleting && <DeletePageModal page={deleting} onClose={() => setDeleting(null)} onDeleted={() => { if (current === deleting.id) setCurrentPage('home'); forgetPage(deleting.id); setDeleting(null); }} />}
    </div>
  );
}

function NewPageModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('blank');
  const [showInNav, setShowInNav] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: () => builderApi.createPage({ title: title.trim(), pageType: 'Custom', layout: layoutFromTemplate(template), isPublished: true, showInNav, showInFooter: true }),
    onSuccess: page => { void qc.invalidateQueries({ queryKey: PAGES_KEY }); onCreated(page.id); },
    onError: err => setError(apiErrorMessage(err)),
  });
  return (
    <Modal open onClose={onClose} title="New page" size="lg">
      <form className="space-y-5" onSubmit={e => { e.preventDefault(); if (!title.trim()) { setError('Give the page a name.'); return; } create.mutate(); }}>
        <div>
          <FieldLabel htmlFor="sb-new-page-title">Page name *</FieldLabel>
          <input id="sb-new-page-title" autoFocus value={title} onChange={e => { setTitle(e.target.value); setError(null); }} placeholder="e.g. Our story" className={INPUT} aria-invalid={!!error} aria-describedby={error ? 'sb-new-page-error' : undefined} />
          {error && <p id="sb-new-page-error" className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Start from</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAGE_TEMPLATES.map(t => (
              <label key={t.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${template === t.id ? 'theme-border theme-bg border-2' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="sb-page-template" value={t.id} checked={template === t.id} onChange={() => setTemplate(t.id)} className="mt-1 accent-[var(--rc-primary)]" />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{t.name}</span>
                  <span className="block text-xs text-slate-500">{t.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Toggle label="Show in the main menu" checked={showInNav} onChange={setShowInNav} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={create.isPending} className="theme-btn min-h-10 cursor-pointer rounded-xl px-5 text-sm font-semibold disabled:opacity-60">{create.isPending ? 'Creating…' : 'Create page'}</button>
        </div>
      </form>
    </Modal>
  );
}

function PageSettingsModal({ page, onClose }: { page: BuilderPageSummary; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: page.title, slug: page.slug, isPublished: page.isPublished, showInNav: page.showInNav, showInFooter: page.showInFooter, seoTitle: '', seoDescription: '', ogImageUrl: '' });
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm(f => ({ ...f, [k]: v }));

  // SEO fields live on the page detail; fill them once it arrives (unless already typed).
  const detail = useQuery({ queryKey: ['sb-builder-page-seo', page.id], queryFn: () => builderApi.getPage(page.id), staleTime: 0 });
  const [seoFilled, setSeoFilled] = useState(false);
  if (detail.data && !seoFilled) {
    setSeoFilled(true);
    setForm(f => ({ ...f, seoTitle: f.seoTitle || detail.data.seoTitle || '', seoDescription: f.seoDescription || detail.data.seoDescription || '', ogImageUrl: f.ogImageUrl || detail.data.ogImageUrl || '' }));
  }

  const save = useMutation({
    mutationFn: () => builderApi.updatePage(page.id, { ...form, title: form.title.trim(), slug: form.slug.trim() }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: PAGES_KEY }); onClose(); },
    onError: err => setError(apiErrorMessage(err)),
  });

  return (
    <Modal open onClose={onClose} title="Page settings" size="lg">
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!form.title.trim()) { setError('Give the page a name.'); return; } save.mutate(); }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="sb-page-title">Page name *</FieldLabel>
            <input id="sb-page-title" value={form.title} onChange={e => set('title', e.target.value)} className={INPUT} />
          </div>
          <div>
            <FieldLabel htmlFor="sb-page-slug" helper="Letters, numbers and dashes.">Web address</FieldLabel>
            <div className="flex items-center gap-1 text-sm text-slate-500">/p/<input id="sb-page-slug" value={form.slug} onChange={e => set('slug', e.target.value)} className={INPUT} /></div>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-200 p-3">
          <Toggle label="Visible on the store" helper="Hidden pages can be edited but shoppers can't open them." checked={form.isPublished} onChange={v => set('isPublished', v)} />
          <Toggle label="Show in the main menu" checked={form.showInNav} onChange={v => set('showInNav', v)} />
          <Toggle label="Show in the footer" checked={form.showInFooter} onChange={v => set('showInFooter', v)} />
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-900">Search & social</legend>
          <div>
            <FieldLabel htmlFor="sb-page-seo-title" helper="Shown in Google results. Leave empty to use the page name.">SEO title</FieldLabel>
            <input id="sb-page-seo-title" maxLength={200} value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} className={INPUT} />
          </div>
          <div>
            <FieldLabel htmlFor="sb-page-seo-desc">SEO description</FieldLabel>
            <textarea id="sb-page-seo-desc" rows={3} maxLength={500} value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} className={INPUT} />
          </div>
          <ImageField label="Social share image" value={{ $image: form.ogImageUrl }} onChange={v => set('ogImageUrl', v.$image)} />
        </fieldset>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={save.isPending} className="theme-btn min-h-10 cursor-pointer rounded-xl px-5 text-sm font-semibold disabled:opacity-60">{save.isPending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

function DeletePageModal({ page, onClose, onDeleted }: { page: BuilderPageSummary; onClose: () => void; onDeleted: () => void }) {
  const qc = useQueryClient();
  const show = useToast(s => s.show);
  const del = useMutation({
    mutationFn: () => builderApi.deletePage(page.id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: PAGES_KEY }); show('success', `Deleted "${page.title}".`); onDeleted(); },
    onError: err => show('error', apiErrorMessage(err)),
  });
  return (
    <Modal open onClose={onClose} title="Delete page?" size="sm">
      <p className="text-sm text-slate-600">“{page.title}” will be removed from your store and its menus. This can’t be undone.</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Keep page</button>
        <button type="button" onClick={() => del.mutate()} disabled={del.isPending} className="min-h-10 cursor-pointer rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{del.isPending ? 'Deleting…' : 'Delete page'}</button>
      </div>
    </Modal>
  );
}

function assignmentSummary(p: BuilderPageSummary): string {
  const c = p.assignment?.categoryIds.length ?? 0;
  const n = p.assignment?.productIds.length ?? 0;
  if (!c && !n) return 'Not used yet';
  return [c && `${c} categor${c === 1 ? 'y' : 'ies'}`, n && `${n} product${n === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
}

/** New extra product design: starts as a copy of the current Product page design. */
function NewProductDesignModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: () => {
      const s = useEditor.getState();
      const base: PageLayout = s.layouts.product ?? (s.store ? starterFor(s.store).product : { schemaVersion: 1, sections: [] });
      return builderApi.createPage({ pageType: 'AltProductTemplate', title: title.trim(), layout: clone(base) });
    },
    onSuccess: page => { void qc.invalidateQueries({ queryKey: PAGES_KEY }); onCreated(page.id); },
    onError: err => setError(apiErrorMessage(err)),
  });
  return (
    <Modal open onClose={onClose} title="New product design" size="sm">
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!title.trim()) { setError('Give the design a name.'); return; } create.mutate(); }}>
        <div>
          <FieldLabel htmlFor="sb-design-title" helper="Only you see this name. It starts as a copy of your Product page.">Name *</FieldLabel>
          <input id="sb-design-title" autoFocus maxLength={200} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sarees, Gift hampers" className={INPUT} />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={create.isPending} className="theme-btn min-h-10 cursor-pointer rounded-xl px-5 text-sm font-semibold disabled:opacity-60">{create.isPending ? 'Creating…' : 'Create design'}</button>
        </div>
      </form>
    </Modal>
  );
}

/** Name of an extra product design and which categories / products use it (SB-R21). */
function ProductDesignModal({ page, onClose }: { page: BuilderPageSummary; onClose: () => void }) {
  const qc = useQueryClient();
  const show = useToast(s => s.show);
  const { data: categories = [] } = useEditorCategories();
  const [title, setTitle] = useState(page.title);
  const [categoryIds, setCategoryIds] = useState<string[]>(page.assignment?.categoryIds ?? []);
  const [productIds, setProductIds] = useState<string[]>(page.assignment?.productIds ?? []);
  const [error, setError] = useState<string | null>(null);
  const toggle = (id: string) => setCategoryIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]));

  const save = useMutation({
    mutationFn: async () => {
      if (title.trim() !== page.title) await builderApi.updatePage(page.id, { title: title.trim() });
      return builderApi.setAssignment(page.id, { categoryIds, productIds });
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: PAGES_KEY }); show('success', `Saved “${title.trim()}”. Shoppers see it once the design is published.`); onClose(); },
    onError: err => setError(apiErrorMessage(err)),
  });

  const check = (id: string, name: string, nested = false) => (
    <label key={id} className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm hover:bg-slate-50 ${nested ? 'pl-7' : ''}`}>
      <input type="checkbox" checked={categoryIds.includes(id)} onChange={() => toggle(id)} className="h-4 w-4 rounded accent-[var(--rc-primary)]" />
      <span className="truncate text-slate-800">{name}</span>
    </label>
  );

  return (
    <Modal open onClose={onClose} title="Product design settings" size="lg">
      <form className="space-y-5" onSubmit={e => { e.preventDefault(); if (!title.trim()) { setError('Give the design a name.'); return; } save.mutate(); }}>
        <div>
          <FieldLabel htmlFor="sb-design-name">Name *</FieldLabel>
          <input id="sb-design-name" maxLength={200} value={title} onChange={e => setTitle(e.target.value)} className={INPUT} />
        </div>
        <fieldset className="space-y-1">
          <legend className="mb-1 text-sm font-semibold text-slate-900">Categories</legend>
          <p className="mb-2 text-xs text-slate-500">Products in these categories (and their sub-categories) use this design. A category picked here moves off any other design.</p>
          {categories.length === 0 ? <p className="text-sm text-slate-500">No categories yet.</p> : (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-1">
              {categories.map(c => (
                <div key={c.id}>
                  {check(c.id, c.name)}
                  {c.subCategories?.map(sc => check(sc.id, sc.name, true))}
                </div>
              ))}
            </div>
          )}
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold text-slate-900">Products</legend>
          <p className="mb-2 text-xs text-slate-500">A product picked here uses this design whatever its category.</p>
          <ManualPicker ids={productIds} max={200} onChange={setProductIds} />
        </fieldset>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={save.isPending} className="theme-btn min-h-10 cursor-pointer rounded-xl px-5 text-sm font-semibold disabled:opacity-60">{save.isPending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
