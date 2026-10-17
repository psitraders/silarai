import { ChevronRight } from 'lucide-react';
import { useProductList } from '../../../../core/data/hooks';
import { useStorefront } from '../../../../core/storefront-context';
import type { RenderContext, StoreCategory } from '../../../../core/types';
import { CardSkeleton, ProductCard } from '../../../../ui/ProductCard';
import { Scroller } from '../../../../ui/Scroller';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';

/** One category's products as +/− rows (grid) or compact cards (swipeable). */
export function CategoryProducts({ category, limit, viewAll, layout, context }: {
  category: StoreCategory;
  limit: number;
  viewAll: boolean;
  layout: 'rows' | 'carousel';
  context: RenderContext;
}) {
  const { links } = useStorefront();
  const { data, isLoading } = useProductList({ categoryId: category.id, pageSize: limit });
  const items = data?.items ?? [];
  if (!isLoading && !items.length) return null;
  const headingId = `qa-${category.id}`;
  const cards = isLoading
    ? Array.from({ length: Math.min(limit, 4) }, (_, i) => <CardSkeleton key={i} />)
    : items.map(p => <ProductCard key={p.id} product={p} index={-1} context={context} cardStyle={layout === 'rows' ? 'list-row' : 'compact'} />);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 id={headingId} className="sf-h3">{category.name}</h3>
        {viewAll && (
          <SmartLinkAnchor href={links.category(category.name)} className="sf-link inline-flex items-center gap-1 text-sm font-semibold">
            View all <ChevronRight className="h-4 w-4" aria-hidden />
          </SmartLinkAnchor>
        )}
      </div>
      {layout === 'rows' ? (
        <ul className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-3" aria-labelledby={headingId}>
          {cards.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      ) : (
        <Scroller items={cards} itemClassName="w-[44%] @2xl:w-[30%] @5xl:w-[19%]" label={category.name} arrows="none" />
      )}
    </div>
  );
}
