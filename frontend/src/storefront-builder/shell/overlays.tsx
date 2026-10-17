import { Check, ChevronUp, MessageCircle, RotateCcw, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { generateWhatsAppLink } from '../../utils/whatsappLink';
import type { StoreInfo } from '../core/types';

const DEFAULT_RETURN_POLICY = `We want you to be completely satisfied with your purchase.

RETURNS
We accept returns within 7 days of delivery. Items must be unused, in original packaging and with proof of purchase.

NON-RETURNABLE ITEMS
• Opened personal care or beauty products
• Items on sale or marked as final sale
• Gift cards

REFUND PROCESS
Once we receive and inspect your return we will notify you. Approved refunds are processed within 5–7 business days to your original payment method.

DAMAGED OR WRONG ITEMS
Contact us within 48 hours of delivery with photos of the item and packaging.

EXCHANGE
Exchanges for a different size or colour of the same product are subject to availability.`;

export function ReturnPolicyModal({ store, onClose }: { store: StoreInfo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="sf-return-title">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[85vh] w-full flex-col rounded-t-2xl shadow-2xl sm:max-w-lg sm:rounded-2xl" style={{ background: 'var(--sf-surface)', color: 'var(--sf-text)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--sf-border)' }}>
          <h2 id="sf-return-title" className="flex items-center gap-2 font-bold">
            <RotateCcw className="h-4 w-4 sf-link" aria-hidden /> Return &amp; refund policy
          </h2>
          <button type="button" autoFocus onClick={onClose} className="sf-icon-btn" aria-label="Close">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto whitespace-pre-wrap px-5 py-5 text-sm leading-relaxed">
          {store.returnPolicy || DEFAULT_RETURN_POLICY}
        </div>
        {store.whatsAppNumber && (
          <div className="px-5 pb-5 pt-3" style={{ borderTop: '1px solid var(--sf-border)' }}>
            <a
              href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}! I have a question about your return policy.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="sf-btn sf-btn-primary sf-btn-block"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> Ask us on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/** Sticky mobile bar: cart (when it has items) + WhatsApp. */
export function MobileBottomBar({ store, cartCount, onOpenCart }: { store: StoreInfo; cartCount: number; onOpenCart: () => void }) {
  if (!store.whatsAppNumber && cartCount === 0) return null;
  return (
    <div
      className="sf-bar fixed inset-x-0 bottom-0 z-20 flex gap-2 md:hidden"
      style={{ padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--sf-border)', borderBottom: 0 }}
    >
      {cartCount > 0 && (
        <button type="button" onClick={onOpenCart} className="sf-btn sf-btn-secondary relative shrink-0" aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}>
          <ShoppingBag className="h-5 w-5" aria-hidden />
          <span aria-hidden className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold" style={{ background: 'var(--sf-badge)', color: 'var(--sf-on-badge)' }}>
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        </button>
      )}
      {store.whatsAppNumber && (
        <a
          href={generateWhatsAppLink(store.whatsAppNumber, `Hi! I'm interested in products at ${store.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="sf-btn sf-btn-primary flex-1"
        >
          <MessageCircle className="h-5 w-5" aria-hidden /> {store.whatsAppCtaLabel || 'Chat on WhatsApp'}
        </a>
      )}
    </div>
  );
}

/** Short confirmation when the cart does not auto-open on add (Store behaviour → Cart). */
export function AddedToast({ text, onOpenCart }: { text: string; onOpenCart: () => void }) {
  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-[var(--sf-radius-md)] px-4 py-3 shadow-xl sf-reveal md:bottom-6" style={{ background: 'var(--sf-text)', color: 'var(--sf-bg)' }} role="status">
      <Check className="h-4 w-4 shrink-0" aria-hidden />
      <span className="line-clamp-2 flex-1 text-sm font-semibold">{text}</span>
      <button type="button" onClick={onOpenCart} className="shrink-0 text-sm font-bold underline underline-offset-2">View cart</button>
    </div>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="sf-icon-btn fixed bottom-24 right-4 z-20 shadow-lg md:bottom-6"
      style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', color: 'var(--sf-text)' }}
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" aria-hidden />
    </button>
  );
}

export function BrandedLoader({ store }: { store?: StoreInfo }) {
  const name = store?.name ?? '';
  const logo = store?.faviconUrl ?? store?.logoUrl;
  const from = store?.themeColor ?? '#0F766E';
  const to = store?.secondaryColor ?? '#134E4A';
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} role="status" aria-label="Loading store">
      {logo ? (
        <img src={logo} alt="" className="h-[88px] w-[88px] rounded-[20px] bg-white object-cover shadow-xl" />
      ) : (
        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[20px] bg-white/20 text-3xl font-extrabold text-white shadow-xl">
          {name.slice(0, 2).toUpperCase() || ' '}
        </div>
      )}
      {name && <p className="text-lg font-bold text-white/90">{name}</p>}
      <svg viewBox="0 0 40 40" className="h-10 w-10 sf-spin" aria-hidden>
        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
        <circle cx="20" cy="20" r="16" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="60 40" />
      </svg>
    </div>
  );
}

export function StoreNotFound({ title = 'Store not found', text = 'This store link may be incorrect or the store may have been removed.' }: { title?: string; text?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
          <ShoppingBag className="h-10 w-10 text-slate-400" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
