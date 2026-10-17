/**
 * The page frame every storefront view shares — live store and editor preview:
 * theme CSS, `.sf-root`, the header slot (sticky / hide-on-scroll / overlay /
 * sidebar placement), the page content, the footer slot and the overlay root
 * that drawers portal into.
 */
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { SectionFrame } from '../core/renderer/SectionFrame';
import { effectiveSettings, resolvePack } from '../core/renderer/lazyLayout';
import { OverlayRootContext } from '../core/shell-context';
import { themeRootAttributes } from '../core/theme/rootAttributes';
import { ThemeStyle } from '../core/theme/ThemeStyle';
import type { LayoutProps, RenderContext, SiteDoc } from '../core/types';

type StickyMode = 'always' | 'scroll-up' | 'off';

function headerBehaviour(site: SiteDoc): { sticky: StickyMode; placement?: 'overlay' | 'sidebar' } {
  const pack = resolvePack<{ sticky?: StickyMode }, LayoutProps>('header', site.header.type, site.header.layout);
  if (!pack) return { sticky: 'always' };
  const s = effectiveSettings(pack.manifest, site.header.settings, site.header.v);
  const sticky: StickyMode = s.sticky === 'off' || s.sticky === 'scroll-up' ? s.sticky : 'always';
  return { sticky, placement: pack.manifest.layouts[pack.layoutId]?.placement };
}

/** Hides the header while scrolling down, shows it on scroll up (page or editor frame). */
function useHideOnScroll(enabled: boolean, ref: RefObject<HTMLElement | null>) {
  const [hidden, setHidden] = useState(false);
  useLayoutEffect(() => {
    if (!enabled) return;
    const win = ref.current?.ownerDocument.defaultView;
    if (!win) return;
    let last = win.scrollY;
    const onScroll = () => {
      const y = win.scrollY;
      const h = ref.current?.offsetHeight ?? 64;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > h);
      last = y;
    };
    win.addEventListener('scroll', onScroll, { passive: true });
    return () => win.removeEventListener('scroll', onScroll);
  }, [enabled, ref]);
  return enabled && hidden;
}

export function ShellFrame({
  site, scopeId, mode, page, children, overlays, wrapHeader, wrapFooter, bottomPadding = false, rootRef,
}: {
  site: SiteDoc;
  scopeId: string;
  mode: RenderContext['mode'];
  page: RenderContext['page'];
  children: ReactNode;
  /** Cart, product view, modals, floating buttons — rendered inside `.sf-root` so they get the theme. */
  overlays?: ReactNode;
  /** Editor: wraps the header / footer with selection outlines. */
  wrapHeader?: (node: ReactNode) => ReactNode;
  wrapFooter?: (node: ReactNode) => ReactNode;
  /** Room for the mobile bottom bar. */
  bottomPadding?: boolean;
  rootRef?: (el: HTMLDivElement | null) => void;
}) {
  const [overlayRoot, setOverlayRoot] = useState<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const { sticky, placement } = headerBehaviour(site);
  const hidden = useHideOnScroll(sticky === 'scroll-up', headerRef);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Header height → --sf-header-h (sticky sub-bars) and the overlay offset.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      setHeaderHeight(el.offsetHeight);
      root.current?.style.setProperty('--sf-header-h', `${sticky === 'off' ? 0 : el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sticky]);

  const headerNode = <SectionFrame instance={site.header} kind="header" as="header" context={{ mode, page, isFirst: false }} minHeight={64} />;
  const footerNode = <SectionFrame instance={site.footer} kind="footer" as="footer" context={{ mode, page, isFirst: false }} minHeight={200} />;

  return (
    <OverlayRootContext.Provider value={overlayRoot}>
      <ThemeStyle theme={site.theme} scopeId={scopeId} />
      <div
        ref={el => { root.current = el; rootRef?.(el); }}
        className={`sf-root ${bottomPadding ? 'pb-20 md:pb-0' : ''}`}
        data-sf-root={scopeId}
        {...themeRootAttributes(site.theme)}
      >
        <a href="#sf-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900">
          Skip to content
        </a>

        <div
          ref={headerRef}
          className={`${sticky === 'off' ? 'relative' : 'sticky top-0'} z-30 transition-transform duration-300 ease-out motion-reduce:transition-none`}
          style={{
            transform: hidden ? 'translateY(-100%)' : undefined,
            marginBottom: placement === 'overlay' ? -headerHeight : undefined,
          }}
        >
          {wrapHeader ? wrapHeader(headerNode) : headerNode}
        </div>

        <div className={placement === 'sidebar' ? 'lg:pl-[260px]' : ''}>
          {children}
          {wrapFooter ? wrapFooter(footerNode) : footerNode}
        </div>

        {overlays}
        <div ref={setOverlayRoot} data-sf-overlays="" />
      </div>
    </OverlayRootContext.Provider>
  );
}
