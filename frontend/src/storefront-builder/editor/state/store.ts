/**
 * Editor state (zustand). One editor at a time; `reset()` on mount.
 * The preview frame reads this same store, so edits show instantly.
 */
import { create } from 'zustand';
import type { BlockInstance, NavPage, PageLayout, SectionInstance, SiteDoc, StoreInfo } from '../../core/types';
import { clone, newId } from './ids';
import { isSystemPage, type SystemPageKey } from './systemPages';

/** A system page ('home' | 'collection' | 'product') or a custom page id. */
export type PageKey = string;
export type Target = { kind: 'header' } | { kind: 'footer' } | { kind: 'section'; id: string };
export interface Selection { target: Target; blockId?: string }
export type Device = 'desktop' | 'tablet' | 'mobile';
export type LeftTab = 'sections' | 'theme' | 'pages' | 'menus';
export type SaveState = 'saved' | 'dirty' | 'saving' | 'error';


interface EditorData {
  ready: boolean;
  slug: string;
  store: StoreInfo | null;
  site: SiteDoc | null;
  /** True once the theme row exists on the server (publish needs it). */
  themeOnServer: boolean;
  navPages: NavPage[];
  layouts: Record<PageKey, PageLayout>;
  /** Server ids of the system pages (created on first save). */
  systemIds: Partial<Record<SystemPageKey, string>>;
  currentPage: PageKey;
  selection: Selection | null;
  /** Hovering a layout in the picker previews it without saving. */
  tryOn: { target: Target; layout: string } | null;
  device: Device;
  leftTab: LeftTab;
  /** Mobile editor: which of the three panes is visible. */
  mobilePane: 'left' | 'preview' | 'right';
  /** Edit counters per document ('site' or a page key) vs. the last saved counter. */
  rev: Record<string, number>;
  savedRev: Record<string, number>;
  saveState: SaveState;
  saveError?: string;
  /** Bumped to ask the preview to scroll the selection into view. */
  scrollNonce: number;
  /** Section gallery: open with the insert position. */
  gallery: { index: number } | null;
  /** Shows the product popup over the preview (Store behaviour → "Preview popup"). */
  popupPreview: boolean;
  /** Template wizard (first run = the store has no saved design yet). */
  wizard: { firstRun: boolean } | null;
  /** Documents the preview shows while a template is being chosen (never saved, not editable). */
  templatePreview: { site: SiteDoc; layouts: Record<PageKey, PageLayout> } | null;
  /** Saves pending edits right away (registered by the autosave hook). */
  flush: () => Promise<boolean>;
}

interface EditorActions {
  reset: () => void;
  init: (data: Pick<EditorData, 'slug' | 'store' | 'site' | 'themeOnServer' | 'systemIds' | 'currentPage' | 'wizard'>) => void;
  setNavPages: (pages: NavPage[]) => void;
  loadLayout: (key: PageKey, layout: PageLayout) => void;
  setCurrentPage: (key: PageKey) => void;
  select: (selection: Selection | null, opts?: { scroll?: boolean }) => void;
  setTryOn: (tryOn: EditorData['tryOn']) => void;
  setDevice: (device: Device) => void;
  setLeftTab: (tab: LeftTab) => void;
  setMobilePane: (pane: EditorData['mobilePane']) => void;
  updateSite: (fn: (site: SiteDoc) => void) => void;
  /** Header, footer or a section of the current page. */
  updateInstance: (target: Target, fn: (instance: SectionInstance) => void) => void;
  addSection: (section: SectionInstance, index?: number) => void;
  moveSection: (id: string, toIndex: number) => void;
  duplicateSection: (id: string) => void;
  removeSection: (id: string) => void;
  addBlock: (target: Target, block: BlockInstance) => void;
  moveBlock: (target: Target, blockId: string, toIndex: number) => void;
  removeBlock: (target: Target, blockId: string) => void;
  duplicateBlock: (target: Target, blockId: string) => void;
  markSaving: () => void;
  /** Records which revisions reached the server (later edits stay dirty). */
  markSaved: (saved: Record<string, number>) => void;
  markError: (message: string) => void;
  setSystemId: (kind: SystemPageKey, id: string) => void;
  setPopupPreview: (on: boolean) => void;
  setThemeOnServer: () => void;
  openGallery: (index?: number) => void;
  closeGallery: () => void;
  openWizard: () => void;
  closeWizard: () => void;
  setTemplatePreview: (preview: EditorData['templatePreview']) => void;
  /**
   * Takes over documents a template wrote to the server (`apply-template`): they are the
   * saved state now, so nothing is marked dirty. `dropCustomLayouts` forgets cached custom
   * pages so they reload from their new drafts.
   */
  applyTemplateDocs: (data: { site: SiteDoc; layouts: Record<PageKey, PageLayout>; systemIds: Partial<Record<SystemPageKey, string>>; dropCustomLayouts: boolean }) => void;
}

const initial: EditorData = {
  ready: false,
  slug: '',
  store: null,
  site: null,
  themeOnServer: false,
  navPages: [],
  layouts: {},
  systemIds: {},
  currentPage: 'home',
  selection: null,
  tryOn: null,
  device: 'desktop',
  leftTab: 'sections',
  mobilePane: 'preview',
  rev: {},
  savedRev: {},
  saveState: 'saved',
  scrollNonce: 0,
  gallery: null,
  popupPreview: false,
  wizard: null,
  templatePreview: null,
  flush: async () => true,
};

const move = <T,>(list: T[], from: number, to: number) => {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
};

export const useEditor = create<EditorData & EditorActions>()((set, get) => {
  /** Mutates a copy of the current page layout and marks it dirty. */
  const editLayout = (fn: (layout: PageLayout) => void) => {
    const { currentPage, layouts, rev } = get();
    const current = layouts[currentPage];
    if (!current) return;
    const next = clone(current);
    fn(next);
    set({
      layouts: { ...layouts, [currentPage]: next },
      rev: { ...rev, [currentPage]: (rev[currentPage] ?? 0) + 1 },
      saveState: 'dirty',
    });
  };

  const editSite = (fn: (site: SiteDoc) => void) => {
    const site = get().site;
    if (!site) return;
    const next = clone(site);
    fn(next);
    const rev = get().rev;
    set({ site: next, rev: { ...rev, site: (rev.site ?? 0) + 1 }, saveState: 'dirty' });
  };

  const editInstance = (target: Target, fn: (instance: SectionInstance) => void) => {
    if (target.kind === 'header') editSite(s => fn(s.header));
    else if (target.kind === 'footer') editSite(s => fn(s.footer));
    else editLayout(l => { const sec = l.sections.find(x => x.id === target.id); if (sec) fn(sec); });
  };

  return {
    ...initial,
    reset: () => set({ ...initial }),
    init: data => set({ ...data, ready: true }),
    setNavPages: navPages => set({ navPages }),
    loadLayout: (key, layout) => set(s => ({ layouts: { ...s.layouts, [key]: layout } })),
    setCurrentPage: key => set({ currentPage: key, selection: null, tryOn: null, popupPreview: false }),
    select: (selection, opts) => set(s => ({
      selection,
      tryOn: null,
      scrollNonce: opts?.scroll ? s.scrollNonce + 1 : s.scrollNonce,
      mobilePane: selection && s.mobilePane === 'left' ? 'right' : s.mobilePane,
    })),
    setTryOn: tryOn => set({ tryOn }),
    setDevice: device => set({ device }),
    setLeftTab: leftTab => set({ leftTab }),
    setMobilePane: mobilePane => set({ mobilePane }),
    updateSite: editSite,
    updateInstance: editInstance,

    addSection: (section, index) => {
      editLayout(l => {
        const at = index ?? l.sections.length;
        l.sections.splice(at, 0, section);
      });
      set(s => ({ selection: { target: { kind: 'section', id: section.id } }, scrollNonce: s.scrollNonce + 1 }));
    },
    moveSection: (id, toIndex) => editLayout(l => {
      const from = l.sections.findIndex(x => x.id === id);
      if (from >= 0) l.sections = move(l.sections, from, toIndex);
    }),
    duplicateSection: id => {
      let copyId = '';
      editLayout(l => {
        const i = l.sections.findIndex(x => x.id === id);
        if (i < 0) return;
        const copy = clone(l.sections[i]);
        copy.id = newId(copy.type);
        copy.blocks = copy.blocks?.map(b => ({ ...b, id: newId(b.type) }));
        copyId = copy.id;
        l.sections.splice(i + 1, 0, copy);
      });
      if (copyId) set(s => ({ selection: { target: { kind: 'section', id: copyId } }, scrollNonce: s.scrollNonce + 1 }));
    },
    removeSection: id => {
      editLayout(l => { l.sections = l.sections.filter(x => x.id !== id); });
      const sel = get().selection;
      if (sel?.target.kind === 'section' && sel.target.id === id) set({ selection: null });
    },

    addBlock: (target, block) => {
      editInstance(target, inst => { inst.blocks = [...(inst.blocks ?? []), block]; });
      set({ selection: { target, blockId: block.id } });
    },
    moveBlock: (target, blockId, toIndex) => editInstance(target, inst => {
      const list = inst.blocks ?? [];
      const from = list.findIndex(b => b.id === blockId);
      if (from >= 0) inst.blocks = move(list, from, toIndex);
    }),
    removeBlock: (target, blockId) => {
      editInstance(target, inst => { inst.blocks = (inst.blocks ?? []).filter(b => b.id !== blockId); });
      const sel = get().selection;
      if (sel?.blockId === blockId) set({ selection: { target } });
    },
    duplicateBlock: (target, blockId) => editInstance(target, inst => {
      const list = inst.blocks ?? [];
      const i = list.findIndex(b => b.id === blockId);
      if (i < 0) return;
      const copy = { ...clone(list[i]), id: newId(list[i].type) };
      inst.blocks = [...list.slice(0, i + 1), copy, ...list.slice(i + 1)];
    }),

    markSaving: () => set({ saveState: 'saving', saveError: undefined }),
    markSaved: saved => set(s => {
      const savedRev = { ...s.savedRev, ...saved };
      const dirty = Object.keys(s.rev).some(k => (s.rev[k] ?? 0) > (savedRev[k] ?? 0));
      return { savedRev, saveState: dirty ? 'dirty' : 'saved', saveError: undefined };
    }),
    markError: message => set({ saveState: 'error', saveError: message }),
    setSystemId: (kind, id) => set(s => ({ systemIds: { ...s.systemIds, [kind]: id } })),
    setPopupPreview: on => set({ popupPreview: on }),
    setThemeOnServer: () => set({ themeOnServer: true }),
    openGallery: index => set(s => ({ gallery: { index: index ?? s.layouts[s.currentPage]?.sections.length ?? 0 } })),
    closeGallery: () => set({ gallery: null }),
    openWizard: () => set({ wizard: { firstRun: false }, selection: null, tryOn: null, popupPreview: false, gallery: null }),
    closeWizard: () => set({ wizard: null, templatePreview: null }),
    setTemplatePreview: templatePreview => set({ templatePreview }),
    applyTemplateDocs: ({ site, layouts, systemIds, dropCustomLayouts }) => set(s => {
      const keep = (k: string) => !dropCustomLayouts || k === 'site' || isSystemPage(k);
      const rev = Object.fromEntries(Object.entries(s.rev).filter(([k]) => keep(k)));
      const savedRev = Object.fromEntries(Object.entries(s.savedRev).filter(([k]) => keep(k)));
      for (const k of ['site', ...Object.keys(layouts)]) savedRev[k] = rev[k] ?? 0;
      const dirty = Object.keys(rev).some(k => (rev[k] ?? 0) > (savedRev[k] ?? 0));
      const kept = Object.fromEntries(Object.entries(s.layouts).filter(([k]) => keep(k)));
      return {
        site,
        layouts: { ...kept, ...layouts },
        systemIds: { ...s.systemIds, ...systemIds },
        themeOnServer: true,
        rev,
        savedRev,
        saveState: dirty ? 'dirty' : 'saved',
        saveError: undefined,
        currentPage: 'home',
        selection: null,
        tryOn: null,
        templatePreview: null,
        wizard: null,
      };
    }),
  };
});

/** The current page's layout (null while loading). */
export const useCurrentLayout = () => useEditor(s => s.layouts[s.currentPage] ?? null);

export function targetKey(t: Target): string {
  return t.kind === 'section' ? `section:${t.id}` : t.kind;
}

export function sameTarget(a: Target | undefined, b: Target | undefined): boolean {
  return !!a && !!b && targetKey(a) === targetKey(b);
}

/** Documents with edits that have not reached the server yet. */
export function dirtyKeys(s: Pick<EditorData, 'rev' | 'savedRev'>): string[] {
  return Object.keys(s.rev).filter(k => (s.rev[k] ?? 0) > (s.savedRev[k] ?? 0));
}
