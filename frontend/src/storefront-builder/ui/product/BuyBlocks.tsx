import { Check, FileText, Lock, Mail, MessageCircle, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Zap } from 'lucide-react';
import React, { useId, useState } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { generateProductInquiryMessage, generateWhatsAppLink } from '../../../utils/whatsappLink';
import { useBuyNow } from '../../core/commerce/useBuyNow';
import { useInquiry } from '../../core/commerce/useInquiry';
import { useProductCtl } from '../../core/commerce/useProductController';
import { useStorefront } from '../../core/storefront-context';
import type { RenderContext } from '../../core/types';
import type { BuyButtonsBlock, LabelBlock, VariantsBlock } from './blockTypes';
import { useAddToCart } from './useAddToCart';

const QuoteRequestModal = React.lazy(() =>
  import('../../../components/storefront/QuoteRequestModal').then(m => ({ default: m.QuoteRequestModal })),
);

const swatchColour = (value: string): string | null => {
  const v = value.trim().toLowerCase();
  if (typeof CSS === 'undefined') return null;
  if (CSS.supports('color', v)) return v;
  const joined = v.replace(/\s+/g, '');
  return CSS.supports('color', joined) ? joined : null;
};

export function VariantsView({ s }: { s: VariantsBlock }) {
  const ctl = useProductCtl();
  const { store } = useStorefront();
  const currency = store.currency ?? 'INR';
  const baseId = useId();
  if (ctl.detailLoading) return <div className="sf-skeleton h-16 rounded-[var(--sf-radius-md)]" aria-hidden />;
  if (!ctl.variantGroups.length) return null;
  const adj = (n: number) => (n ? ` (${n > 0 ? '+' : '−'}${formatCurrency(Math.abs(n), currency)})` : '');

  return (
    <div className="space-y-4">
      {ctl.variantGroups.map(([group, values]) => {
        const current = ctl.selected[group];
        const labelId = `${baseId}-${group}`;
        if (s.style === 'dropdown') {
          return (
            <label key={group} className="block">
              <span className="mb-1.5 block text-sm font-semibold">{group}</span>
              <select className="sf-input" value={current ?? ''} onChange={e => ctl.select(group, e.target.value)}>
                {values.map(v => <option key={v.value} value={v.value}>{v.value}{adj(v.priceAdjustment)}</option>)}
              </select>
            </label>
          );
        }
        return (
          <fieldset key={group}>
            <legend id={labelId} className="mb-2 text-sm font-semibold">
              {group}{current && <span className="font-normal sf-muted"> — {current}</span>}
            </legend>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby={labelId}>
              {values.map(v => {
                const on = v.value === current;
                const colour = s.style === 'swatches' ? swatchColour(v.value) : null;
                if (colour) {
                  return (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => ctl.select(group, v.value)}
                      aria-pressed={on}
                      title={`${v.value}${adj(v.priceAdjustment)}`}
                      aria-label={`${v.value}${adj(v.priceAdjustment)}`}
                      className="h-9 w-9 rounded-full transition-transform"
                      style={{ background: colour, boxShadow: on ? '0 0 0 2px var(--sf-surface), 0 0 0 4px var(--sf-text)' : 'inset 0 0 0 1px rgb(0 0 0 / 0.15)' }}
                    />
                  );
                }
                return (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => ctl.select(group, v.value)}
                    aria-pressed={on}
                    className={s.style === 'chips' || s.style === 'swatches' ? 'sf-chip text-sm' : 'sf-chip min-w-12 justify-center rounded-[var(--sf-btn-radius)] text-sm'}
                  >
                    {v.value}
                    {v.priceAdjustment !== 0 && <span className="ml-1 text-xs opacity-75">{adj(v.priceAdjustment)}</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

export function QuantityView({ compact = false }: { compact?: boolean }) {
  const ctl = useProductCtl();
  if (ctl.outOfStock) return null;
  return (
    <div className={compact ? '' : 'flex items-center gap-3'}>
      {!compact && <span className="text-sm font-semibold">Quantity</span>}
      <div className="inline-flex items-center rounded-[var(--sf-btn-radius)]" style={{ border: '1px solid var(--sf-border)' }}>
        <button type="button" className="sf-icon-btn" onClick={() => ctl.setQuantity(ctl.quantity - 1)} disabled={ctl.quantity <= 1} aria-label="Decrease quantity">
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={ctl.maxQuantity}
          value={ctl.quantity}
          onChange={e => ctl.setQuantity(Number(e.target.value))}
          className="w-12 bg-transparent text-center font-semibold tabular-nums [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Quantity"
        />
        <button type="button" className="sf-icon-btn" onClick={() => ctl.setQuantity(ctl.quantity + 1)} disabled={ctl.quantity >= ctl.maxQuantity} aria-label="Increase quantity">
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function BuyButtonsView({ s, context }: { s: BuyButtonsBlock; context: RenderContext }) {
  const ctl = useProductCtl();
  const { store } = useStorefront();
  const { add, added } = useAddToCart();
  const [checkout, setCheckout] = useState(false);
  const currency = store.currency ?? 'INR';
  const wa = s.whatsapp && store.whatsAppNumber
    ? generateWhatsAppLink(store.whatsAppNumber, generateProductInquiryMessage(ctl.product.title, store.name, ctl.variantInfo))
    : null;

  if (ctl.outOfStock) {
    return (
      <div className="space-y-2">
        <p className="sf-btn sf-btn-secondary sf-btn-block pointer-events-none opacity-60" aria-disabled="true">Sold out</p>
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-ghost sf-btn-block"><MessageCircle className="h-4 w-4" aria-hidden /> Ask when it's back</a>}
      </div>
    );
  }

  const showAdd = s.addToCart;
  const showBuy = s.buyNow;
  const anyButton = showAdd || showBuy || wa;
  if (!anyButton) return context.mode === 'live' ? null : <p className="text-sm sf-muted">Turn on at least one button.</p>;

  return (
    <div className="space-y-3" data-sf-buy="">
      {!ctl.allSelected && ctl.missingGroup && (
        <p className="text-sm font-semibold" style={{ color: 'var(--sf-accent)' }} role="status">Please choose a {ctl.missingGroup.toLowerCase()}.</p>
      )}
      <div className={s.arrange === 'row' ? 'grid gap-2 @md:grid-cols-2' : 'grid gap-2'}>
        {showAdd && (
          <button type="button" onClick={() => add()} disabled={!ctl.allSelected} className={`sf-btn sf-btn-lg sf-btn-block ${showBuy ? 'sf-btn-secondary' : 'sf-btn-primary'}`} aria-live="polite">
            {added ? <><Check className="h-5 w-5" aria-hidden /> Added to cart</> : <><ShoppingBag className="h-5 w-5" aria-hidden /> Add to cart</>}
          </button>
        )}
        {showBuy && (
          <button type="button" onClick={() => setCheckout(c => !c)} disabled={!ctl.allSelected} aria-expanded={checkout} className="sf-btn sf-btn-primary sf-btn-lg sf-btn-block">
            <Zap className="h-5 w-5" aria-hidden /> Buy now · {formatCurrency(ctl.unitFor(ctl.quantity) * ctl.quantity, currency)}
          </button>
        )}
      </div>
      {wa && (
        <a href={ctl.allSelected ? wa : undefined} onClick={e => { if (!ctl.allSelected) e.preventDefault(); }} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-ghost sf-btn-block" style={{ border: '1px solid var(--sf-border)' }}>
          <MessageCircle className="h-5 w-5" aria-hidden /> {store.whatsAppCtaLabel || 'Order on WhatsApp'}
        </a>
      )}
      {checkout && <CheckoutPanel />}
    </div>
  );
}

/** Inline "Buy now" checkout: Razorpay or cash on delivery with an email code. */
export function CheckoutPanel() {
  const ctl = useProductCtl();
  const { store } = useStorefront();
  const buy = useBuyNow(ctl);
  const currency = store.currency ?? 'INR';
  const c = buy.customer;
  const sending = buy.otpStep === 'sending';

  return (
    <div className="space-y-3 rounded-[var(--sf-radius-md)] p-4 sf-reveal" style={{ border: '1px solid var(--sf-border)' }}>
      <p className="font-bold">Complete your order</p>
      <div className={`grid gap-2 ${buy.canPayOnline ? 'grid-cols-2' : ''}`} role="radiogroup" aria-label="Payment method">
        {buy.canPayOnline && (
          <button type="button" role="radio" aria-checked={buy.method === 'razorpay'} aria-pressed={buy.method === 'razorpay'} onClick={() => buy.setMethod('razorpay')} className="sf-chip justify-center text-sm">
            Pay online
          </button>
        )}
        <button type="button" role="radio" aria-checked={buy.method === 'cod'} aria-pressed={buy.method === 'cod'} onClick={() => buy.setMethod('cod')} className="sf-chip justify-center gap-1.5 text-sm">
          <Truck className="h-4 w-4" aria-hidden /> Cash on delivery
        </button>
      </div>

      {buy.error && <p className="rounded-[var(--sf-radius-sm)] px-3 py-2 text-sm" style={{ background: 'color-mix(in srgb, var(--sf-danger) 10%, transparent)', color: 'var(--sf-danger)' }} role="alert">{buy.error}</p>}

      {buy.method === 'cod' && buy.otpStep === 'awaiting' ? (
        <>
          <p className="text-sm">We sent a 6-digit code to <strong>{c.email}</strong>. Enter it to confirm your order.</p>
          <input className="sf-input text-center text-lg font-bold tracking-[0.4em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" value={buy.otp} onChange={e => buy.setOtp(e.target.value)} aria-label="Verification code" />
          {buy.otpError && <p className="text-sm" style={{ color: 'var(--sf-danger)' }} role="alert">{buy.otpError}</p>}
          <button type="button" onClick={() => { void buy.confirm(); }} disabled={buy.busy || buy.otp.length !== 6} className="sf-btn sf-btn-primary sf-btn-block">
            {buy.busy ? 'Placing order…' : `Verify & place order · ${formatCurrency(buy.total, currency)}`}
          </button>
          <button type="button" onClick={buy.resetOtp} className="w-full text-center text-sm sf-muted underline-offset-2 hover:underline">Change email or resend code</button>
        </>
      ) : (
        <>
          <input className="sf-input" placeholder="Your name *" autoComplete="name" value={c.name} onChange={e => buy.setField('name', e.target.value)} aria-label="Your name" />
          <input className="sf-input" placeholder="Phone number *" type="tel" autoComplete="tel" value={c.phone} onChange={e => buy.setField('phone', e.target.value)} aria-label="Phone number" />
          <input className="sf-input" placeholder={buy.method === 'cod' ? 'Email * (for the order code)' : 'Email (optional)'} type="email" autoComplete="email" value={c.email} onChange={e => buy.setField('email', e.target.value)} aria-label="Email" />
          <input className="sf-input" placeholder="Delivery address" autoComplete="street-address" value={c.address} onChange={e => buy.setField('address', e.target.value)} aria-label="Delivery address" />
          <button type="button" onClick={() => { void buy.submit(); }} disabled={buy.busy || sending} className="sf-btn sf-btn-primary sf-btn-block">
            {sending ? 'Sending code…' : buy.busy ? 'Opening payment…' : buy.method === 'cod' ? 'Continue — send code' : `Pay ${formatCurrency(buy.total, currency)} securely`}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs sf-muted">
            {buy.method === 'cod'
              ? <><Lock className="h-3 w-3" aria-hidden /> A one-time code is emailed to you to prevent fake orders</>
              : <><ShieldCheck className="h-3 w-3" aria-hidden /> Secured by Razorpay</>}
          </p>
        </>
      )}
    </div>
  );
}

export function InquiryView({ s }: { s: LabelBlock }) {
  const ctl = useProductCtl();
  const [open, setOpen] = useState(false);
  const inquiry = useInquiry({ productId: ctl.product.id, defaultMessage: `I'm interested in ${ctl.product.title}`, preview: ctl.preview, swallowErrors: true });
  if (inquiry.sent) {
    return <p className="rounded-[var(--sf-radius-md)] px-3 py-3 text-sm font-semibold" style={{ background: 'color-mix(in srgb, var(--sf-success) 12%, transparent)' }} role="status">Thanks — we'll get back to you soon.</p>;
  }
  return (
    <div>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="sf-btn sf-btn-ghost sf-btn-block" style={{ border: '1px solid var(--sf-border)' }}>
        <Mail className="h-4 w-4" aria-hidden /> {s.label || 'Send an inquiry'}
      </button>
      {open && (
        <div className="mt-3 space-y-2 sf-reveal">
          <input className="sf-input" placeholder="Your name *" value={inquiry.fields.name} onChange={e => inquiry.set('name', e.target.value)} aria-label="Your name" />
          <input className="sf-input" placeholder="Phone number" type="tel" value={inquiry.fields.phone} onChange={e => inquiry.set('phone', e.target.value)} aria-label="Phone number" />
          <textarea className="sf-input resize-none" rows={3} placeholder="Your message…" value={inquiry.fields.message} onChange={e => inquiry.set('message', e.target.value)} aria-label="Message" />
          {inquiry.error && <p className="text-sm" style={{ color: 'var(--sf-danger)' }} role="alert">{inquiry.error}</p>}
          <button type="button" onClick={inquiry.submit} disabled={inquiry.busy || !inquiry.fields.name.trim()} className="sf-btn sf-btn-primary sf-btn-block">
            {inquiry.busy ? 'Sending…' : 'Send inquiry'}
          </button>
        </div>
      )}
    </div>
  );
}

export function QuoteView({ s, context }: { s: LabelBlock; context: RenderContext }) {
  const ctl = useProductCtl();
  const { slug, store, brandColor } = useStorefront();
  const [open, setOpen] = useState(false);
  if (!ctl.isB2BCustomer) return context.mode === 'live' ? null : <p className="text-xs sf-muted">“{s.label}” shows to signed-in B2B customers.</p>;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="sf-btn sf-btn-ghost sf-btn-block" style={{ border: '1px solid var(--sf-border)' }}>
        <FileText className="h-4 w-4" aria-hidden /> {s.label || 'Request bulk quote'}
      </button>
      {open && (
        <React.Suspense fallback={null}>
          <QuoteRequestModal
            slug={slug}
            themeColor={brandColor}
            currency={store.currency ?? 'INR'}
            items={[{ productId: ctl.product.id, title: ctl.product.title, qty: ctl.quantity, unitPrice: ctl.unitPrice }]}
            onClose={() => setOpen(false)}
          />
        </React.Suspense>
      )}
    </>
  );
}

export function WholesaleView({ context }: { context: RenderContext }) {
  const ctl = useProductCtl();
  const { store } = useStorefront();
  const currency = store.currency ?? 'INR';
  if (!ctl.isWholesale || !ctl.tiers.length) {
    return context.mode === 'live' ? null : <p className="text-xs sf-muted">Wholesale price tiers show to approved B2B customers.</p>;
  }
  return (
    <div className="overflow-hidden rounded-[var(--sf-radius-md)]" style={{ border: '1px solid var(--sf-border)' }}>
      <p className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide" style={{ background: 'color-mix(in srgb, var(--sf-text) 5%, transparent)' }}>
        <FileText className="h-3.5 w-3.5" aria-hidden /> Wholesale pricing
      </p>
      <table className="w-full text-sm">
        <tbody>
          {ctl.tiers.map(t => (
            <tr key={t.id} style={{ borderTop: '1px solid var(--sf-border)' }} aria-current={ctl.quantity >= t.minQuantity && (t.maxQuantity == null || ctl.quantity <= t.maxQuantity)}>
              <td className="px-3 py-2 sf-muted">{t.label || (t.maxQuantity ? `${t.minQuantity}–${t.maxQuantity} pcs` : `${t.minQuantity}+ pcs`)}</td>
              <td className="px-3 py-2 text-right font-bold tabular-nums">{formatCurrency(t.pricePerUnit, currency)}<span className="text-xs font-normal sf-muted"> / pc</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {ctl.stock != null && <p className="px-3 py-2 text-xs sf-muted" style={{ borderTop: '1px solid var(--sf-border)' }}>{ctl.stock} units in stock</p>}
    </div>
  );
}
