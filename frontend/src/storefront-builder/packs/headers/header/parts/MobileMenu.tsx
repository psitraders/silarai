import { ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useOverlayRoot } from '../../../../core/shell-context';
import type { SchemeId } from '../../../../core/types';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';
import type { HeaderSettings } from '../manifest';
import type { HeaderMenuItem } from '../useMenu';
import { SearchField } from './SearchBar';
import type { HeaderState } from './useHeader';

const SIDE = {
  'drawer-left': 'left-0 top-0 h-full w-[86%] max-w-sm sf-drawer-in-left',
  'drawer-right': 'right-0 top-0 h-full w-[86%] max-w-sm sf-drawer-in-right',
  fullscreen: 'inset-0 sf-reveal',
} as const;

/**
 * The menu drawer (all layouts on phones; "minimal" and "sidebar" everywhere).
 * Portalled into the store's overlay root so sticky / glass headers can't clip it.
 * Traps focus, closes on Esc and returns focus to the menu button.
 */
export function MobileMenu({ items, settings, state, scheme, extra }: {
  items: HeaderMenuItem[];
  settings: HeaderSettings;
  state: HeaderState;
  scheme: SchemeId;
  extra?: ReactNode;
}) {
  const overlayRoot = useOverlayRoot();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = state.mobileOpen;
  const close = () => state.setMobileOpen(false);

  useEffect(() => {
    if (!open) return;
    const doc = panel.current?.ownerDocument ?? document;
    opener.current = doc.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('a, button, input')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { state.setMobileOpen(false); return; }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button, input')].filter(el => !el.hasAttribute('disabled'));
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    doc.addEventListener('keydown', onKey);
    const body = doc.body;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      doc.removeEventListener('keydown', onKey);
      body.style.overflow = prev;
      opener.current?.focus?.();
    };
  }, [open, state]);

  if (!open) return null;
  const mode = settings.mobileMenu ?? 'drawer-left';
  const content = (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="sf-overlay absolute inset-0" onClick={close} aria-hidden />
      <div ref={panel} data-sf-scheme={scheme} className={`sf-drawer sf-scheme absolute flex flex-col overflow-y-auto shadow-xl ${SIDE[mode] ?? SIDE['drawer-left']}`}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--sf-border)' }}>
          <span className="text-sm font-bold">Menu</span>
          <button type="button" className="sf-icon-btn" onClick={close} aria-label="Close menu"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        {settings.search !== 'off' && <div className="px-4 pt-4"><SearchField onDone={close} /></div>}
        <nav aria-label="Main" className="flex-1 px-2 py-3">
          <ul className={mode === 'fullscreen' ? 'mx-auto max-w-md space-y-1 text-center' : 'space-y-1'}>
            {items.map(item => <MobileItem key={item.id} item={item} onNavigate={close} large={mode === 'fullscreen'} />)}
          </ul>
        </nav>
        {extra && <div className="px-4 pb-6">{extra}</div>}
      </div>
    </div>
  );
  return overlayRoot ? createPortal(content, overlayRoot) : content;
}

function MobileItem({ item, onNavigate, large, depth = 0 }: { item: HeaderMenuItem; onNavigate: () => void; large: boolean; depth?: number }) {
  const [open, setOpen] = useState(false);
  const text = depth === 0 ? (large ? 'text-xl font-bold' : 'text-base font-semibold') : 'text-sm opacity-80';
  return (
    <li>
      <div className="flex items-center">
        <SmartLinkAnchor href={item.href} onClick={onNavigate} className={`flex-1 rounded-[var(--sf-radius-sm)] px-3 py-3 ${text}`}>{item.label}</SmartLinkAnchor>
        {item.children && (
          <button type="button" className="sf-icon-btn" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={`${open ? 'Hide' : 'Show'} ${item.label} links`}>
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
          </button>
        )}
      </div>
      {item.children && open && (
        <ul className="mb-2 ml-4 pl-2" style={{ borderLeft: '2px solid var(--sf-border)' }}>
          {item.children.map(c => <MobileItem key={c.id} item={c} onNavigate={onNavigate} large={false} depth={depth + 1} />)}
        </ul>
      )}
    </li>
  );
}
