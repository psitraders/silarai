import { Check, Copy, Tag } from 'lucide-react';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import type { CouponStripSettings } from '../manifest';
import { useCoupons } from '../useCoupons';

/** A compact band of coupon chips — tap to copy. */
export default function Strip({ settings, blocks, context }: LayoutProps<CouponStripSettings>) {
  const { coupons, copied, copy, emptyHint, isLoading } = useCoupons(blocks, settings.source);
  if (isLoading) return <div className="sf-container h-16" aria-hidden />;
  if (!coupons.length) return <EditorHint context={context} text={emptyHint} />;
  return (
    <div className="sf-container py-5">
      <div className="flex flex-wrap items-center gap-3 @3xl:flex-nowrap">
        {(settings.heading || settings.eyebrow) && (
          <p className="flex shrink-0 items-center gap-2 font-bold">
            <Tag className="h-4 w-4 sf-link" aria-hidden /> {settings.heading || settings.eyebrow}
          </p>
        )}
        <ul className="sf-scroll-x -mx-4 flex flex-1 gap-2 px-4 @3xl:mx-0 @3xl:px-0">
          {coupons.map(({ id, settings: c }) => (
            <li key={id} className="shrink-0">
              <button
                type="button"
                onClick={() => { void copy(id, c.code); }}
                className="inline-flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm"
                style={{ border: '1px dashed var(--sf-border)', background: 'var(--sf-surface)' }}
                aria-label={`Copy coupon ${c.code}: ${c.text}`}
              >
                <span className="rounded-full px-2.5 py-1 font-mono text-xs font-bold tracking-wider" style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>{c.code}</span>
                <span className="font-medium">{c.text}</span>
                {copied === id ? <Check className="h-4 w-4" style={{ color: 'var(--sf-success)' }} aria-hidden /> : <Copy className="h-3.5 w-3.5 sf-muted" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <span className="sr-only" aria-live="polite">{copied ? 'Coupon code copied' : ''}</span>
    </div>
  );
}
