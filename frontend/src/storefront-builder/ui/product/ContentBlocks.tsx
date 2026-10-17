import { ChevronDown, Ruler, Star } from 'lucide-react';
import { useState } from 'react';
import { useProductReviews, useSubmitReview } from '../../core/commerce/useInquiry';
import { useProductCtl } from '../../core/commerce/useProductController';
import { useShell } from '../../core/shell-context';
import { readImage } from '../../core/smart';
import { useStorefront } from '../../core/storefront-context';
import type { RenderContext } from '../../core/types';
import { Overlay } from '../Overlay';
import { SmartImage } from '../SmartImage';
import type { AccordionBlock, SizeGuideBlock } from './blockTypes';
import { Stars } from './InfoBlocks';

/** The body of an accordion row (also used as tab content). */
export function AccordionBody({ s }: { s: AccordionBlock }) {
  const { product } = useProductCtl();
  const { store } = useStorefront();
  const shell = useShell();
  if (s.content === 'description') return <p className="whitespace-pre-line text-sm leading-relaxed">{product.description || 'No description yet.'}</p>;
  if (s.content === 'return-policy') {
    return store.returnPolicy
      ? <p className="whitespace-pre-line text-sm leading-relaxed">{store.returnPolicy}</p>
      : <button type="button" className="sf-link text-sm font-semibold" onClick={shell.openReturnPolicy}>Read our return &amp; refund policy</button>;
  }
  return <p className="whitespace-pre-line text-sm leading-relaxed">{s.text || ' '}</p>;
}

export function AccordionView({ s }: { s: AccordionBlock }) {
  return (
    <details className="group" open={s.open} style={{ borderBottom: '1px solid var(--sf-border)' }}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 font-semibold [&::-webkit-details-marker]:hidden">
        {s.title || 'More info'}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pb-4"><AccordionBody s={s} /></div>
    </details>
  );
}

export function SizeGuideView({ s, context }: { s: SizeGuideBlock; context: RenderContext }) {
  const [open, setOpen] = useState(false);
  const hasContent = !!s.text.trim() || !!readImage(s.image);
  if (!hasContent && context.mode === 'live') return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="sf-link inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-2 hover:underline">
        <Ruler className="h-4 w-4" aria-hidden /> {s.label || 'Size guide'}
      </button>
      {open && (
        <Overlay onClose={() => setOpen(false)} label={s.heading || 'Size guide'} variant="modal" size="md">
          <div className="overflow-y-auto p-6">
            <h2 className="sf-h3 mb-4 pr-10 font-bold">{s.heading || 'Size guide'}</h2>
            {readImage(s.image) && <SmartImage value={s.image} alt={s.heading || 'Size guide'} className="mb-4" maxWidth={1200} />}
            {s.text.trim() ? <p className="whitespace-pre-line text-sm leading-relaxed">{s.text}</p> : !readImage(s.image) && <p className="text-sm sf-muted">Add a size table image or text in the editor.</p>}
          </div>
        </Overlay>
      )}
    </>
  );
}

export function ReviewsView({ context }: { context: RenderContext }) {
  const { product } = useProductCtl();
  const { data, isLoading } = useProductReviews(product.id);
  const [writing, setWriting] = useState(false);
  const items = data?.items ?? [];
  const avg = data?.averageRating ?? 0;

  return (
    <div id={`sf-reviews-${product.id}`} className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Customer reviews</h3>
          {items.length > 0 && (
            <p className="mt-1 flex items-center gap-2 text-sm"><Stars value={avg} /> <span className="font-semibold">{avg.toFixed(1)}</span> <span className="sf-muted">· {items.length} review{items.length === 1 ? '' : 's'}</span></p>
          )}
        </div>
        {!writing && <button type="button" className="sf-btn sf-btn-secondary sf-btn-sm" onClick={() => setWriting(true)}>Write a review</button>}
      </div>

      {writing && <ReviewForm onCancel={() => setWriting(false)} />}

      {isLoading ? (
        <div className="sf-skeleton h-20 rounded-[var(--sf-radius-md)]" aria-hidden />
      ) : items.length ? (
        <ul className="max-h-96 space-y-3 overflow-y-auto">
          {items.slice(0, 20).map(r => (
            <li key={r.id} className="rounded-[var(--sf-radius-md)] p-3" style={{ background: 'color-mix(in srgb, var(--sf-text) 4%, transparent)' }}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{r.reviewerName}</span>
                <Stars value={r.rating} size="h-3.5 w-3.5" />
              </div>
              {r.comment && <p className="text-sm leading-relaxed sf-muted">{r.comment}</p>}
            </li>
          ))}
        </ul>
      ) : (
        !writing && <p className="text-sm sf-muted">{context.mode === 'live' ? 'No reviews yet. Be the first to share your experience!' : 'Approved reviews for the product appear here.'}</p>
      )}
    </div>
  );
}

function ReviewForm({ onCancel }: { onCancel: () => void }) {
  const { product, preview } = useProductCtl();
  const review = useSubmitReview(product.id, preview);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (review.done) {
    return <p className="rounded-[var(--sf-radius-md)] px-3 py-3 text-sm font-semibold" style={{ background: 'color-mix(in srgb, var(--sf-success) 12%, transparent)' }} role="status">Thank you! Your review will appear once it's approved.</p>;
  }
  return (
    <form
      className="space-y-2 rounded-[var(--sf-radius-md)] p-4"
      style={{ border: '1px solid var(--sf-border)' }}
      onSubmit={e => {
        e.preventDefault();
        review.submit({ reviewerName: name.trim(), reviewerPhone: phone.trim() || undefined, reviewerEmail: email.trim() || undefined, rating, comment: comment.trim() || undefined });
      }}
    >
      <p className="text-sm sf-muted">Enter the phone number you ordered with so we can verify your purchase.</p>
      {review.error && <p className="text-sm" style={{ color: 'var(--sf-danger)' }} role="alert">{review.error}</p>}
      <input className="sf-input" placeholder="Your name *" value={name} onChange={e => setName(e.target.value)} aria-label="Your name" required />
      <input className="sf-input" placeholder="Phone number *" type="tel" value={phone} onChange={e => setPhone(e.target.value)} aria-label="Phone number" required />
      <input className="sf-input" placeholder="Email (optional)" type="email" value={email} onChange={e => setEmail(e.target.value)} aria-label="Email" />
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n === 1 ? '' : 's'}`} onClick={() => setRating(n)} className="p-1">
            <Star className="h-6 w-6" style={{ color: n <= rating ? 'var(--sf-accent)' : 'var(--sf-border)', fill: n <= rating ? 'var(--sf-accent)' : 'none' }} aria-hidden />
          </button>
        ))}
      </div>
      <textarea className="sf-input resize-none" rows={3} placeholder="Tell others about this product (optional)" value={comment} onChange={e => setComment(e.target.value)} aria-label="Review" />
      <div className="flex gap-2">
        <button type="submit" disabled={review.busy || !name.trim() || !phone.trim()} className="sf-btn sf-btn-primary flex-1">{review.busy ? 'Sending…' : 'Submit review'}</button>
        <button type="button" onClick={onCancel} className="sf-btn sf-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}
