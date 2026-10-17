import { Star } from 'lucide-react';
import { SmartImage } from '../../../ui/SmartImage';
import type { QuoteBlock } from './manifest';

export function Stars({ rating }: { rating: number }) {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  if (!n) return null;
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < n ? 'fill-current' : 'opacity-30'}`} style={{ color: 'var(--sf-badge)' }} aria-hidden />
      ))}
    </span>
  );
}

export function QuoteCard({ q }: { q: QuoteBlock }) {
  return (
    <figure className="sf-card flex h-full flex-col gap-4 p-6">
      <Stars rating={q.rating} />
      <blockquote className="flex-1 text-base leading-relaxed">“{q.quote}”</blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar q={q} />
        <span>
          <span className="block text-sm font-bold">{q.name}</span>
          {q.detail && <span className="block text-xs sf-muted">{q.detail}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export function Avatar({ q, size = 'h-10 w-10' }: { q: QuoteBlock; size?: string }) {
  return (
    <span className={`relative inline-flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold`} style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>
      {q.image?.$image ? <SmartImage value={q.image} alt="" rounded={false} fill maxWidth={480} /> : (q.name || '?').charAt(0).toUpperCase()}
    </span>
  );
}
