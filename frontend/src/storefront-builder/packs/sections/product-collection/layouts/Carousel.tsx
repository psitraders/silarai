import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { useResolvedProducts } from '../../../../core/data/hooks';
import type { LayoutProps } from '../../../../core/types';
import { CardSkeleton, ProductCard } from '../../../../ui/ProductCard';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { ProductCollectionSettings } from '../manifest';
import { ViewAllLink } from '../ViewAllLink';

/** Horizontal, swipeable row with arrow buttons (no auto-play). */
export default function Carousel({ settings, context, section }: LayoutProps<ProductCollectionSettings>) {
  const { items, isLoading } = useResolvedProducts(settings.products);
  const track = useRef<HTMLUListElement>(null);

  if (!isLoading && !items.length) {
    return context.mode === 'live' ? null : (
      <div className="sf-container sf-section-pad text-center sf-muted">No products match this collection yet.</div>
    );
  }

  const scroll = (dir: -1 | 1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const labelId = `${section.id}-title`;
  return (
    <div className="sf-container sf-section-pad sf-textured">
      <div id={labelId}>
        <SectionHeading
          eyebrow={settings.eyebrow}
          title={settings.title}
          subtitle={settings.subtitle}
          action={
            <div className="flex items-center gap-2">
              <button type="button" className="sf-icon-btn hidden @3xl:inline-flex" style={{ border: '1px solid var(--sf-border)' }} onClick={() => scroll(-1)} aria-label="Scroll left">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button type="button" className="sf-icon-btn hidden @3xl:inline-flex" style={{ border: '1px solid var(--sf-border)' }} onClick={() => scroll(1)} aria-label="Scroll right">
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
              {settings.showViewAll && <ViewAllLink query={settings.products.$products} categoryName={items[0]?.categoryName} />}
            </div>
          }
        />
      </div>
      <ul ref={track} className="sf-scroll-x -mx-4 flex snap-x snap-mandatory gap-4 px-4 pb-3" aria-labelledby={labelId}>
        {(isLoading ? Array.from({ length: 5 }, () => null) : items).map((p, i) => (
          <li key={p?.id ?? i} className="w-[46%] shrink-0 snap-start @2xl:w-[30%] @5xl:w-[22%]">
            {p ? <ProductCard product={p} index={settings.showRank ? i : -1} context={context} cardStyle={settings.cardStyle} /> : <CardSkeleton />}
          </li>
        ))}
      </ul>
    </div>
  );
}
