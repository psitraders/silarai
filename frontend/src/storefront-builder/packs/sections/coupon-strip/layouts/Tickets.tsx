import { Check, Copy } from 'lucide-react';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { CouponStripSettings } from '../manifest';
import { useCoupons } from '../useCoupons';

/** Ticket-shaped cards with a tear line and a copy button. */
export default function Tickets({ settings, blocks, context }: LayoutProps<CouponStripSettings>) {
  const { coupons, copied, copy, emptyHint, isLoading } = useCoupons(blocks, settings.source);
  if (isLoading) return <div className="sf-container sf-section-pad" aria-hidden><div className="h-28" /></div>;
  if (!coupons.length) return <EditorHint context={context} text={emptyHint} />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} />
      <ul className="sf-gap grid @xl:grid-cols-2 @4xl:grid-cols-3">
        {coupons.map(({ id, settings: c }) => (
          <li key={id} className="relative flex overflow-hidden rounded-[var(--sf-radius-md)]" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }}>
            <div className="flex w-24 shrink-0 flex-col items-center justify-center p-3 text-center" style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Code</span>
              <span className="mt-1 break-all font-mono text-sm font-bold">{c.code}</span>
            </div>
            <span className="absolute left-24 top-0 h-full -translate-x-1/2" style={{ borderLeft: '2px dashed var(--sf-bg)' }} aria-hidden />
            <div className="flex flex-1 flex-col justify-between gap-3 p-4">
              <div>
                <p className="font-bold leading-snug">{c.text}</p>
                {c.endsAt && !Number.isNaN(Date.parse(c.endsAt)) && <p className="mt-1 text-xs sf-muted">Valid till {new Date(c.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
              </div>
              <button type="button" onClick={() => { void copy(id, c.code); }} className="sf-btn sf-btn-secondary sf-btn-sm self-start" aria-label={`Copy coupon ${c.code}`}>
                {copied === id ? <><Check className="h-4 w-4" aria-hidden /> Copied</> : <><Copy className="h-4 w-4" aria-hidden /> Copy code</>}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <span className="sr-only" aria-live="polite">{copied ? 'Coupon code copied' : ''}</span>
    </div>
  );
}
