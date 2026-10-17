import { X } from 'lucide-react';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useOverlayRoot } from '../core/shell-context';

export type OverlayVariant = 'modal' | 'drawer-right' | 'drawer-left' | 'sheet' | 'full';

const PANEL: Record<OverlayVariant, string> = {
  // Phones get a bottom sheet; wider screens a centred dialog.
  modal: 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[var(--sf-radius-lg)] sf-modal-in sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[var(--sf-radius-lg)]',
  'drawer-right': 'right-0 top-0 h-full w-full sf-drawer-in-right',
  'drawer-left': 'left-0 top-0 h-full w-full sf-drawer-in-left',
  sheet: 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[var(--sf-radius-lg)] sf-sheet-in',
  full: 'inset-0 sf-reveal',
};

const WIDTH = { sm: 'sm:max-w-md', md: 'sm:max-w-2xl', lg: 'sm:max-w-4xl', xl: 'sm:max-w-6xl' } as const;
const DRAWER_WIDTH = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' } as const;
const SHEET_WIDTH = { sm: 'mx-auto max-w-md', md: 'mx-auto max-w-2xl', lg: 'mx-auto max-w-4xl', xl: '' } as const;

/**
 * Store popup / drawer / sheet: portalled into the overlay root (keeps theme tokens,
 * escapes sticky headers), traps focus, closes on Esc, locks page scroll and
 * returns focus to whatever opened it (design.md §13 rules 12, 19).
 */
export function Overlay({
  open = true, onClose, label, variant = 'modal', size = 'lg', children, className = '', style, showClose = true, handle,
}: {
  open?: boolean;
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  variant?: OverlayVariant;
  size?: keyof typeof WIDTH;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  showClose?: boolean;
  /** Drag-handle bar on sheets (default: on for sheets). */
  handle?: boolean;
}) {
  const overlayRoot = useOverlayRoot();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open || !panel.current) return;
    const el = panel.current;
    const doc = el.ownerDocument;
    const opener = doc.activeElement as HTMLElement | null;
    (el.querySelector<HTMLElement>('[data-autofocus]') ?? el).focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const focusables = [...el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter(f => f.offsetParent !== null || f === doc.activeElement);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && (doc.activeElement === first || doc.activeElement === el)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    doc.addEventListener('keydown', onKey);
    const body = doc.body;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      doc.removeEventListener('keydown', onKey);
      body.style.overflow = prev;
      opener?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  const isDrawer = variant === 'drawer-left' || variant === 'drawer-right';
  const width = isDrawer ? DRAWER_WIDTH[size] : variant === 'sheet' ? SHEET_WIDTH[size] : variant === 'modal' ? WIDTH[size] : '';
  const showHandle = handle ?? (variant === 'sheet');

  const content = (
    <div className="fixed inset-0 z-50" role="presentation">
      <div className="sf-overlay absolute inset-0" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`sf-drawer sf-cq absolute flex flex-col overflow-hidden shadow-2xl outline-none ${PANEL[variant]} ${width} ${className}`}
        style={style}
      >
        {showHandle && <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full opacity-30" style={{ background: 'var(--sf-text)' }} aria-hidden />}
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="sf-icon-btn absolute right-3 top-3 z-20 shadow-sm"
            style={{ background: 'color-mix(in srgb, var(--sf-surface) 88%, transparent)' }}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        )}
        {children}
      </div>
    </div>
  );
  return overlayRoot ? createPortal(content, overlayRoot) : content;
}
