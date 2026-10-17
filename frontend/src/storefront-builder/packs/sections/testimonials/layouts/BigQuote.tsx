import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useState } from 'react';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import type { TestimonialsSettings } from '../manifest';
import { Avatar, Stars } from '../Quote';
import { useQuotes } from '../quotes';

/** One large quote with previous / next controls (no auto-rotation). */
export default function BigQuote({ settings, blocks, context }: LayoutProps<TestimonialsSettings>) {
  const quotes = useQuotes(blocks);
  const [index, setIndex] = useState(0);
  if (!quotes.length) return <EditorHint context={context} text="Add customer quotes to this section." />;
  const i = index % quotes.length;
  const q = quotes[i].settings;
  const go = (d: number) => setIndex((i + d + quotes.length) % quotes.length);

  return (
    <div className="sf-container sf-section-pad text-center">
      {settings.eyebrow && <p className="sf-eyebrow mb-4">{settings.eyebrow}</p>}
      <Quote className="mx-auto h-10 w-10 sf-link" aria-hidden />
      <figure className="mx-auto mt-4 max-w-3xl" aria-live="polite">
        <blockquote className="sf-h2 font-normal" style={{ fontWeight: 'var(--sf-heading-weight)' }}>“{q.quote}”</blockquote>
        <figcaption className="mt-6 flex flex-col items-center gap-2">
          <Avatar q={q} size="h-12 w-12" />
          <span className="text-sm font-bold">{q.name}</span>
          {q.detail && <span className="text-xs sf-muted">{q.detail}</span>}
          <Stars rating={q.rating} />
        </figcaption>
      </figure>
      {quotes.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }} onClick={() => go(-1)} aria-label="Previous quote"><ChevronLeft className="h-5 w-5" aria-hidden /></button>
          <span className="text-xs tabular-nums sf-muted">{i + 1} / {quotes.length}</span>
          <button type="button" className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }} onClick={() => go(1)} aria-label="Next quote"><ChevronRight className="h-5 w-5" aria-hidden /></button>
        </div>
      )}
    </div>
  );
}
