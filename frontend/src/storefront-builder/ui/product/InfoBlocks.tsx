import { Check, Link2, MessageCircle, Share2, Star } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useProductReviews } from '../../core/commerce/useInquiry';
import { useProductCtl } from '../../core/commerce/useProductController';
import { readImage, readRichText } from '../../core/smart';
import { useLinkReader, useStorefront } from '../../core/storefront-context';
import { useStyleOptions } from '../../core/theme/useStyleOptions';
import type { RenderContext } from '../../core/types';
import { EditorHint } from '../EditorHint';
import { StoreIcon } from '../icons';
import { RichText } from '../RichText';
import { SmartImage } from '../SmartImage';
import { useCountdown } from '../useCountdown';
import {
  parseSpecs, type BadgesBlock, type CountdownBlock, type DeliveryBlock, type DescriptionBlock, type ImageBlock,
  type PriceBlock, type SpecsBlock, type StockBlock, type TextBlock, type TitleBlock, type TrustBlock,
} from './blockTypes';

export function TitleView({ s, as = 'h1' }: { s: TitleBlock; as?: 'h1' | 'h2' }) {
  const { product } = useProductCtl();
  const H = as;
  const size = s.size === 'xl' ? 'sf-h1' : s.size === 'lg' ? 'sf-h2' : 'sf-h3 font-bold';
  return (
    <div>
      {s.showCategory && product.categoryName && <p className="sf-eyebrow mb-1">{product.categoryName}</p>}
      <H className={`${size} leading-tight`}>{product.title}</H>
    </div>
  );
}

export function PriceView({ s }: { s: PriceBlock }) {
  const ctl = useProductCtl();
  const { store } = useStorefront();
  const style = useStyleOptions();
  const currency = store.currency ?? 'INR';
  const wholesale = ctl.isWholesale ? ctl.unitFor(Math.max(1, ...ctl.tiers.map(t => t.minQuantity))) : ctl.unitPrice;
  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`sf-price ${s.size === 'lg' ? 'text-3xl' : 'text-xl'}`}>{formatCurrency(ctl.unitPrice, currency)}</span>
        {ctl.compareAt != null && (
          <span className="text-base sf-muted line-through tabular-nums"><span className="sr-only">Was </span>{formatCurrency(ctl.compareAt, currency)}</span>
        )}
        {ctl.compareAt != null && style.priceCompare === 'strike-pill' && (
          <span className="sf-badge">Save {formatCurrency(ctl.compareAt - ctl.unitPrice, currency)}</span>
        )}
        {ctl.compareAt != null && style.priceCompare !== 'strike-pill' && ctl.discountPercent > 0 && (
          <span className="text-sm font-bold" style={{ color: 'var(--sf-success)' }}>{ctl.discountPercent}% off</span>
        )}
      </p>
      {wholesale < ctl.unitPrice && (
        <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--sf-success)' }}>Wholesale from {formatCurrency(wholesale, currency)} / pc</p>
      )}
      {s.showTaxNote && <p className="mt-0.5 text-xs sf-muted">Inclusive of all taxes</p>}
    </div>
  );
}

export function Stars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={size} style={{ color: i <= Math.round(value) ? 'var(--sf-accent)' : 'var(--sf-border)', fill: i <= Math.round(value) ? 'var(--sf-accent)' : 'none' }} />
      ))}
    </span>
  );
}

export function RatingView({ context }: { context: RenderContext }) {
  const { product } = useProductCtl();
  const { data } = useProductReviews(product.id);
  if (!data || data.totalCount === 0) {
    return context.mode === 'live' ? null : <p className="flex items-center gap-2 text-sm sf-muted"><Stars value={4.5} /> Rating summary (shows once reviews arrive)</p>;
  }
  const jump = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget.ownerDocument.getElementById(`sf-reviews-${product.id}`);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <a href={`#sf-reviews-${product.id}`} onClick={jump} className="inline-flex items-center gap-2 text-sm">
      <Stars value={data.averageRating} />
      <span className="font-semibold">{data.averageRating.toFixed(1)}</span>
      <span className="sf-muted underline-offset-2 hover:underline">{data.totalCount} review{data.totalCount === 1 ? '' : 's'}</span>
    </a>
  );
}

export function BadgesView({ s, context }: { s: BadgesBlock; context: RenderContext }) {
  const ctl = useProductCtl();
  const badges: string[] = [];
  if (ctl.outOfStock) badges.push('Sold out');
  else {
    if (s.showSale && ctl.discountPercent > 0) badges.push('Sale');
    if (s.showFeatured && ctl.product.isFeatured) badges.push('Bestseller');
    if (ctl.stock != null && ctl.stock <= s.lowStockAt) badges.push(`Only ${ctl.stock} left`);
  }
  if (!badges.length) return context.mode === 'live' ? null : <p className="text-xs sf-muted">Badges (sale, bestseller, low stock) appear here when they apply.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(b => <span key={b} className={`sf-badge ${b === 'Sold out' ? 'sf-badge-neutral' : ''}`}>{b}</span>)}
    </div>
  );
}

export function DescriptionView({ s, context }: { s: DescriptionBlock; context: RenderContext }) {
  const { product } = useProductCtl();
  const [more, setMore] = useState(false);
  if (!product.description) return context.mode === 'live' ? null : <p className="text-sm sf-muted">The product description shows here.</p>;
  if (s.mode === 'full') return <p className="whitespace-pre-line leading-relaxed">{product.description}</p>;
  const clamp = ({ 2: 'line-clamp-2', 3: 'line-clamp-3', 4: 'line-clamp-4', 6: 'line-clamp-6' } as Record<number, string>)[s.lines] ?? 'line-clamp-4';
  const long = product.description.length > 180;
  return (
    <div>
      <p className={`whitespace-pre-line leading-relaxed sf-muted ${more ? '' : clamp}`}>{product.description}</p>
      {long && (
        <button type="button" className="sf-link mt-1 text-sm font-semibold" onClick={() => setMore(m => !m)} aria-expanded={more}>
          {more ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

export function StockView({ s }: { s: StockBlock }) {
  const ctl = useProductCtl();
  const low = ctl.stock != null && ctl.stock > 0 && ctl.stock <= s.lowStockAt;
  const color = ctl.outOfStock ? 'var(--sf-danger)' : low ? 'var(--sf-accent)' : 'var(--sf-success)';
  const text = ctl.outOfStock ? 'Out of stock' : low ? `Hurry — only ${ctl.stock} left` : 'In stock, ready to ship';
  return (
    <p className="flex items-center gap-2 text-sm font-semibold">
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        {!ctl.outOfStock && <span className="absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping" style={{ background: color }} />}
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      </span>
      {text}
    </p>
  );
}

export function DeliveryView({ s }: { s: DeliveryBlock }) {
  if (!s.text.trim() && !s.subtext.trim()) return null;
  return (
    <div className="flex items-start gap-3 rounded-[var(--sf-radius-md)] p-3" style={{ border: '1px solid var(--sf-border)' }}>
      <StoreIcon name={s.icon} className="mt-0.5 h-5 w-5 shrink-0 sf-link" />
      <div className="text-sm">
        {s.text.trim() && <p className="font-semibold">{s.text}</p>}
        {s.subtext.trim() && <p className="sf-muted">{s.subtext}</p>}
      </div>
    </div>
  );
}

const TRUST: { key: keyof TrustBlock; icon: string; text: string }[] = [
  { key: 'cod', icon: 'cod', text: 'Cash on delivery' },
  { key: 'returns', icon: 'returns', text: 'Easy returns' },
  { key: 'secure', icon: 'shield', text: 'Secure checkout' },
  { key: 'shipping', icon: 'truck', text: 'Fast shipping' },
  { key: 'genuine', icon: 'verified', text: '100% genuine' },
];

export function TrustView({ s }: { s: TrustBlock }) {
  const items = TRUST.filter(t => s[t.key]);
  if (!items.length) return null;
  return (
    <ul className="grid grid-cols-3 gap-2 text-center text-xs">
      {items.map(t => (
        <li key={t.key} className="flex flex-col items-center gap-1.5 rounded-[var(--sf-radius-md)] px-1 py-3" style={{ background: 'color-mix(in srgb, var(--sf-text) 4%, transparent)' }}>
          <StoreIcon name={t.icon} className="h-5 w-5 sf-link" />
          <span className="font-semibold leading-tight">{t.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function ShareView() {
  const { product } = useProductCtl();
  const { store, links } = useStorefront();
  const [copied, setCopied] = useState(false);
  const url = typeof window === 'undefined' ? '' : new URL(links.product(product), window.location.origin).toString();
  const text = `${product.title} — ${store.name}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };
  const native = typeof navigator !== 'undefined' && 'share' in navigator;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-semibold">Share</span>
      <a className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }} href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
        <MessageCircle className="h-4 w-4" aria-hidden />
      </a>
      <button type="button" className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }} onClick={copy} aria-label="Copy link">
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
      </button>
      {native && (
        <button type="button" className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }} onClick={() => { void navigator.share({ title: text, url }).catch(() => undefined); }} aria-label="More sharing options">
          <Share2 className="h-4 w-4" aria-hidden />
        </button>
      )}
      <span className="sr-only" aria-live="polite">{copied ? 'Link copied' : ''}</span>
    </div>
  );
}

export function TextView({ s, context }: { s: TextBlock; context: RenderContext }) {
  const html = readRichText(s.text);
  if (!html && !s.heading) return <EditorHint context={context} text="Add text to this block." padded={false} />;
  return (
    <div>
      {s.heading && <h3 className="mb-2 font-bold">{s.heading}</h3>}
      {html && <RichText html={html} />}
    </div>
  );
}

export function ImageView({ s, context }: { s: ImageBlock; context: RenderContext }) {
  const read = useLinkReader();
  if (!readImage(s.image)) return <EditorHint context={context} text="Choose an image for this block." padded={false} />;
  const img = <SmartImage value={s.image} alt={s.alt} sizes="(min-width: 768px) 40vw, 100vw" maxWidth={1200} />;
  const href = read(s.link);
  return href ? <a href={href} className="block">{img}</a> : img;
}

export function CountdownView({ s, context }: { s: CountdownBlock; context: RenderContext }) {
  const t = useCountdown(s.endsAt || undefined);
  if (!t.valid || t.done) return <EditorHint context={context} text={t.done ? 'The countdown has ended — pick a new end date.' : 'Pick an end date for the countdown.'} padded={false} />;
  const parts: [number, string][] = [[t.days, 'd'], [t.hours, 'h'], [t.minutes, 'm'], [t.seconds, 's']];
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[var(--sf-radius-md)] px-3 py-2.5" style={{ background: 'color-mix(in srgb, var(--sf-accent) 14%, transparent)' }}>
      <span className="text-sm font-semibold">{s.label}</span>
      <span className="flex gap-1.5 font-mono text-sm font-bold tabular-nums" role="timer" aria-live="off">
        {parts.map(([n, u]) => <span key={u} className="rounded-[var(--sf-radius-sm)] px-1.5 py-0.5" style={{ background: 'var(--sf-surface)' }}>{String(n).padStart(2, '0')}{u}</span>)}
      </span>
    </div>
  );
}

export function SpecsView({ s, context, chips = false }: { s: SpecsBlock; context: RenderContext; chips?: boolean }) {
  const { product } = useProductCtl();
  const rows = parseSpecs(product.description);
  if (!rows.length) {
    return <EditorHint context={context} padded={false} text='Specifications come from "Label: value" lines in the product description (e.g. "Material: Cotton").' />;
  }
  if (chips) {
    return (
      <ul className="flex flex-wrap gap-2">
        {rows.slice(0, 4).map(r => (
          <li key={r.label} className="rounded-[var(--sf-radius-sm)] px-2.5 py-1.5 text-xs" style={{ background: 'color-mix(in srgb, var(--sf-text) 6%, transparent)' }}>
            <span className="sf-muted">{r.label}</span> <span className="font-semibold">{r.value}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div>
      {s.title && <h3 className="mb-2 font-bold">{s.title}</h3>}
      <dl className="divide-y overflow-hidden rounded-[var(--sf-radius-md)] text-sm" style={{ border: '1px solid var(--sf-border)', borderColor: 'var(--sf-border)' }}>
        {rows.map(r => (
          <div key={r.label} className="grid grid-cols-[40%_1fr] gap-3 px-3 py-2" style={{ borderColor: 'var(--sf-border)' }}>
            <dt className="sf-muted">{r.label}</dt>
            <dd className="font-semibold">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
