import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

/**
 * Horizontal, swipeable strip with arrow buttons (no auto-play, design.md §10).
 * Items scroll inside their own container, so the page never scrolls sideways.
 */
export function Scroller({ items, itemClassName, label, arrows = 'top' }: {
  items: ReactNode[];
  /** Width classes for each item, e.g. "w-[80%] @3xl:w-[32%]". */
  itemClassName: string;
  label: string;
  arrows?: 'top' | 'none';
}) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: -1 | 1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  return (
    <div>
      {arrows === 'top' && (
        <div className="mb-3 hidden justify-end gap-2 @3xl:flex">
          <button type="button" className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }} onClick={() => scroll(-1)} aria-label="Scroll left">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }} onClick={() => scroll(1)} aria-label="Scroll right">
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}
      <ul ref={track} className="sf-scroll-x -mx-4 flex snap-x snap-mandatory gap-4 px-4 pb-3" aria-label={label}>
        {items.map((item, i) => (
          <li key={i} className={`shrink-0 snap-start ${itemClassName}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
