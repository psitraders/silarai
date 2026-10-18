/**
 * Runs inside the preview frame (separate React root). Renders the current draft
 * with the real store shell in "editor" mode and adds selection outlines and the
 * section toolbar. Reads and writes the same editor store as the panels.
 */
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, BookmarkPlus, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../../context/CartContext';
import { StorefrontAuthProvider } from '../../../context/StorefrontAuthContext';
import { CurrentProductContext } from '../../core/commerce/currentProduct';
import { resolvePack } from '../../core/renderer/lazyLayout';
import { SectionFrame } from '../../core/renderer/SectionFrame';
import { PREVIEW_SHELL, ShellContext } from '../../core/shell-context';
import { StorefrontContext, buildLinks, type StorefrontContextValue } from '../../core/storefront-context';
import { resolveTheme } from '../../core/theme/buildTheme';
import type { PageLayout, QuickviewProps, RenderContext, SectionInstance, SiteDoc } from '../../core/types';
import { popupContent } from '../../shell/productTemplate';
import { ShellFrame } from '../../shell/ShellFrame';
import { EMPTY_LAYOUT, starterFor } from '../state/starter';
import { isProductKey, sameTarget, targetKey, useEditor, type Target } from '../state/store';
import { isSystemPage, SYSTEM_PAGES } from '../state/systemPages';
import { useUndoShortcuts } from '../state/useUndoShortcuts';
import { useSampleProduct } from './sampleProduct';

const PREVIEW_SCOPE = 'sb-editor-preview';

function withTryOn(instance: SectionInstance, target: Target, tryOn: { target: Target; layout: string } | null): SectionInstance {
  return tryOn && sameTarget(tryOn.target, target) ? { ...instance, layout: tryOn.layout } : instance;
}

export function PreviewApp({ queryClient, frameDoc }: { queryClient: QueryClient; frameDoc: Document }) {
  const slug = useEditor(s => s.slug);
  const currentPage = useEditor(s => s.currentPage);
  const navPages = useEditor(s => s.navPages);
  const isDesign = useEditor(s => s.productDesignIds.includes(s.currentPage));
  const pageSlug = navPages.find(p => p.id === currentPage)?.slug;
  const path = isSystemPage(currentPage) ? SYSTEM_PAGES[currentPage].path(slug)
    : isDesign ? SYSTEM_PAGES.product.path(slug)
    : `/${slug}/p/${pageSlug ?? 'page'}`;
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter key={path} initialEntries={[path]}>
        {/* Product blocks read the cart and the shopper account; the preview gets empty, isolated ones. */}
        <StorefrontAuthProvider slug={PREVIEW_SCOPE}>
          <CartProvider storageKey={PREVIEW_SCOPE}>
            <PreviewStore frameDoc={frameDoc} />
          </CartProvider>
        </StorefrontAuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function PreviewStore({ frameDoc }: { frameDoc: Document }) {
  const store = useEditor(s => s.store);
  const slug = useEditor(s => s.slug);
  const navPages = useEditor(s => s.navPages);
  const currentPage = useEditor(s => s.currentPage);
  // While a template is being chosen the preview shows its documents, read-only.
  const templatePreview = useEditor(s => s.templatePreview);
  const editing = !templatePreview;
  const site = useEditor(s => s.templatePreview?.site ?? s.site);
  const tryOn = useEditor(s => (s.templatePreview ? null : s.tryOn));
  const layout = useEditor(s => (s.templatePreview ? s.templatePreview.layouts[s.currentPage] ?? EMPTY_LAYOUT : s.layouts[s.currentPage] ?? null));
  const popupPreview = useEditor(s => s.popupPreview && !s.templatePreview);
  const productLayout = useEditor(s => (s.templatePreview ? s.templatePreview.layouts.product ?? null : s.layouts.product ?? null));
  const isProductPage = useEditor(s => isProductKey(s.currentPage, s.productDesignIds));
  const sample = useSampleProduct(slug, isProductPage || popupPreview);

  const effectiveSite = useMemo<SiteDoc | null>(() => site && {
    ...site,
    header: withTryOn(site.header, { kind: 'header' }, tryOn),
    footer: withTryOn(site.footer, { kind: 'footer' }, tryOn),
  }, [site, tryOn]);

  const ctx = useMemo<StorefrontContextValue | null>(() => store && effectiveSite && {
    slug,
    isCustomDomain: false,
    store,
    site: effectiveSite,
    brandColor: resolveTheme(effectiveSite.theme).palette.primary,
    version: 0,
    isPublished: false,
    navPages,
    links: buildLinks(slug, false),
  }, [store, effectiveSite, slug, navPages]);

  usePreviewGuards(frameDoc);
  useUndoShortcuts(frameDoc);
  useScrollToSelection(frameDoc);
  // A different page starts at the top.
  useEffect(() => { frameDoc.defaultView?.scrollTo({ top: 0 }); }, [currentPage, frameDoc]);

  if (!ctx || !effectiveSite) return null;
  const page: RenderContext['page'] = isSystemPage(currentPage) ? SYSTEM_PAGES[currentPage].page : isProductPage ? 'product' : 'custom';

  return (
    <StorefrontContext.Provider value={ctx}>
      <ShellContext.Provider value={PREVIEW_SHELL}>
        <ShellFrame
          site={effectiveSite}
          scopeId="editor-preview"
          mode="editor"
          page={page}
          wrapHeader={editing ? node => <Editable target={{ kind: 'header' }} label="Header">{node}</Editable> : undefined}
          wrapFooter={editing ? node => <Editable target={{ kind: 'footer' }} label="Footer">{node}</Editable> : undefined}
          overlays={popupPreview && store ? <PopupPreview product={sample} site={effectiveSite} productLayout={productLayout ?? starterFor(store).product} /> : undefined}
        >
          <CurrentProductContext.Provider value={isProductPage ? sample : null}>
            <main id="sf-main" tabIndex={-1} className="outline-none">
              {!layout ? (
                <div className="sf-container py-16"><div className="sf-skeleton h-64 rounded-xl" aria-hidden /></div>
              ) : layout.sections.length === 0 ? (
                editing ? <EmptyPage /> : null
              ) : !editing ? (
                layout.sections.map((section, i) => (
                  <SectionFrame key={section.id} instance={section} context={{ mode: 'editor', page, isFirst: i === 0 }} />
                ))
              ) : (
                layout.sections.map((section, i) => {
                  const target: Target = { kind: 'section', id: section.id };
                  return (
                    <Editable key={section.id} target={target} label={resolvePack('section', section.type)?.manifest.name ?? section.type} index={i} count={layout.sections.length} hidden={section.hidden}>
                      <SectionFrame instance={withTryOn(section, target, tryOn)} context={{ mode: 'editor', page, isFirst: i === 0 }} />
                    </Editable>
                  );
                })
              )}
            </main>
          </CurrentProductContext.Provider>
        </ShellFrame>
      </ShellContext.Provider>
    </StorefrontContext.Provider>
  );
}

/** Store behaviour → "Preview popup": the product popup over the preview, with the product template's blocks. */
function PopupPreview({ product, site, productLayout }: { product: QuickviewProps['product']; site: SiteDoc; productLayout: PageLayout }) {
  const close = useEditor(s => s.setPopupPreview);
  const quickview = resolvePack<unknown, QuickviewProps>('quickview', 'quickview', site.behaviour.quickviewLayout);
  const content = useMemo(() => popupContent(productLayout, productLayout), [productLayout]);
  if (!quickview) return null;
  return (
    <Suspense fallback={null}>
      <quickview.Component
        product={product}
        blocks={content.blocks}
        settings={content.settings}
        context={POPUP_EDITOR_CONTEXT}
        onClose={() => close(false)}
        onViewFull={site.behaviour.productView === 'both' ? () => close(false) : undefined}
      />
    </Suspense>
  );
}

const POPUP_EDITOR_CONTEXT: RenderContext = { mode: 'editor', isFirst: false, page: 'product' };

function EmptyPage() {
  const openGallery = useEditor(s => s.openGallery);
  return (
    <div className="sb-empty">
      <strong style={{ fontSize: 18, color: '#0f172a' }}>This page is empty</strong>
      <span>Add sections from the left panel — any section, in any order.</span>
      <button type="button" onClick={() => openGallery(0)}>Add a section</button>
    </div>
  );
}

/** Wraps header / footer / a section with hover + selection outline and (for sections) a toolbar. */
function Editable({ target, label, children, index, count, hidden }: {
  target: Target;
  label: string;
  children: ReactNode;
  index?: number;
  count?: number;
  hidden?: boolean;
}) {
  const selected = useEditor(s => sameTarget(s.selection?.target, target));
  const select = useEditor(s => s.select);
  return (
    <div
      data-sb-editable={targetKey(target)}
      data-sb-selected={selected ? '' : undefined}
      data-sb-hidden={hidden ? '' : undefined}
      onClickCapture={e => {
        // Toolbar clicks are handled by the toolbar itself.
        if ((e.target as Element).closest('.sb-toolbar')) return;
        if (!selected) select({ target });
      }}
    >
      {children}
      <div className="sb-outline" aria-hidden />
      <div className="sb-label" aria-hidden>{hidden ? `${label} (hidden)` : label}</div>
      {selected && target.kind === 'section' && index !== undefined && count !== undefined && (
        <SectionToolbar id={target.id} index={index} count={count} hidden={!!hidden} />
      )}
    </div>
  );
}

function SectionToolbar({ id, index, count, hidden }: { id: string; index: number; count: number; hidden: boolean }) {
  const { moveSection, duplicateSection, removeSection, updateInstance, openSaveSection } = useEditor.getState();
  return (
    <div className="sb-toolbar" role="toolbar" aria-label="Section actions">
      <button type="button" title="Move up" aria-label="Move section up" disabled={index === 0} onClick={() => moveSection(id, index - 1)}><ArrowUp size={16} /></button>
      <button type="button" title="Move down" aria-label="Move section down" disabled={index === count - 1} onClick={() => moveSection(id, index + 1)}><ArrowDown size={16} /></button>
      <button type="button" title="Duplicate" aria-label="Duplicate section" onClick={() => duplicateSection(id)}><Copy size={16} /></button>
      <button type="button" title="Save for reuse" aria-label="Save section for reuse" onClick={() => openSaveSection(id)}><BookmarkPlus size={16} /></button>
      <button type="button" title={hidden ? 'Show' : 'Hide'} aria-label={hidden ? 'Show section' : 'Hide section'} onClick={() => updateInstance({ kind: 'section', id }, s => { s.hidden = !hidden || undefined; })}>
        {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
      <button type="button" className="sb-danger" title="Remove" aria-label="Remove section" onClick={() => removeSection(id)}><Trash2 size={16} /></button>
    </div>
  );
}

/** Links and forms inside the preview never leave the editor (React handlers still run). */
function usePreviewGuards(frameDoc: Document) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a[href]')) e.preventDefault();
    };
    const onSubmit = (e: Event) => e.preventDefault();
    frameDoc.addEventListener('click', onClick, true);
    frameDoc.addEventListener('submit', onSubmit, true);
    return () => {
      frameDoc.removeEventListener('click', onClick, true);
      frameDoc.removeEventListener('submit', onSubmit, true);
    };
  }, [frameDoc]);
}

/** Scrolls the selected header / section / footer into view when the panels ask for it. */
function useScrollToSelection(frameDoc: Document) {
  const nonce = useEditor(s => s.scrollNonce);
  useEffect(() => {
    const selection = useEditor.getState().selection;
    if (!nonce || !selection) return;
    // Wait a frame so a just-added section is in the DOM. Scroll only the frame's own
    // window (scrollIntoView would also scroll the editor's clipped containers).
    const raf = requestAnimationFrame(() => {
      const win = frameDoc.defaultView;
      const el = frameDoc.querySelector<HTMLElement>(`[data-sb-editable="${CSS.escape(targetKey(selection.target))}"]`);
      if (!win || !el) return;
      if (selection.target.kind === 'header') { win.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const header = frameDoc.querySelector<HTMLElement>('[data-sb-editable="header"]');
      const offset = header?.getBoundingClientRect().height ?? 0;
      win.scrollTo({ top: el.getBoundingClientRect().top + win.scrollY - offset - 8, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(raf);
  }, [nonce, frameDoc]);
}
