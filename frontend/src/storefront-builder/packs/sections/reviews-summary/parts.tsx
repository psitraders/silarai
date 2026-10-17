import { Star } from 'lucide-react';
import { useShell } from '../../../core/shell-context';
import type { StoreReviewsSummary } from '../../../core/types';
import { ProductImage } from '../../../ui/ProductImage';

type Review = StoreReviewsSummary['items'][number];

export function Stars({ rating, size = 'h-4 w-4' }: { rating: number; size?: string }) {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${size} ${i < n ? 'fill-current' : 'opacity-30'}`} style={{ color: 'var(--sf-badge)' }} aria-hidden />
      ))}
    </span>
  );
}

/** Server dates come without a zone; they are UTC. */
const reviewDate = (iso: string) => {
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export function ReviewCard({ review, showProduct }: { review: Review; showProduct: boolean }) {
  const { openProduct } = useShell();
  return (
    <figure className="sf-card flex h-full flex-col gap-3 p-5">
      <Stars rating={review.rating} />
      {review.comment && <blockquote className="line-clamp-6 flex-1 text-sm leading-relaxed">“{review.comment}”</blockquote>}
      <figcaption className="text-xs sf-muted">
        <span className="font-bold" style={{ color: 'var(--sf-text)' }}>{review.reviewerName || 'Customer'}</span>
        {reviewDate(review.createdAt) && <> · {reviewDate(review.createdAt)}</>}
      </figcaption>
      {showProduct && (
        <button type="button" onClick={() => openProduct(review.productId)} className="flex items-center gap-2.5 pt-3 text-left" style={{ borderTop: '1px solid var(--sf-border)' }}>
          <ProductImage src={review.productImage} alt="" width={96} className="h-10 w-10 shrink-0 rounded-[var(--sf-radius-sm)]" />
          <span className="line-clamp-2 text-xs font-semibold hover:underline">{review.productTitle}</span>
        </button>
      )}
    </figure>
  );
}

export function RatingSummary({ data, showDistribution }: { data: StoreReviewsSummary; showDistribution: boolean }) {
  const max = Math.max(1, ...data.distribution.map(d => d.count));
  return (
    <div>
      <p className="flex items-baseline gap-2">
        <span className="sf-h1 tabular-nums">{data.averageRating.toFixed(1)}</span>
        <span className="text-sm sf-muted">out of 5</span>
      </p>
      <div className="mt-2"><Stars rating={data.averageRating} size="h-5 w-5" /></div>
      <p className="mt-1 text-sm sf-muted">Based on {data.totalCount} review{data.totalCount === 1 ? '' : 's'}</p>
      {showDistribution && (
        <ul className="mt-5 space-y-1.5" aria-label="Star breakdown">
          {data.distribution.map(d => (
            <li key={d.rating} className="flex items-center gap-2 text-xs">
              <span className="w-8 shrink-0 tabular-nums font-semibold">{d.rating} ★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--sf-border)' }} aria-hidden>
                <span className="block h-full rounded-full" style={{ width: `${(d.count / max) * 100}%`, background: 'var(--sf-badge)' }} />
              </span>
              <span className="w-8 shrink-0 text-right tabular-nums sf-muted">{d.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const EMPTY_HINT = 'No approved reviews yet. Approve reviews under Reviews and they appear here automatically.';
