import type { RenderContext, StoreProduct } from '../core/types';
import { CardSkeleton, ProductCard } from './ProductCard';
import { Scroller } from './Scroller';

const GRID = 'sf-gap grid grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-4';

/** A set of product cards as a grid or a swipeable row (with skeletons while loading). */
export function ProductRow({ products, isLoading, layout, context, label, cardStyle, skeletons = 4 }: {
  products: StoreProduct[];
  isLoading: boolean;
  layout: 'grid' | 'carousel';
  context: RenderContext;
  label: string;
  cardStyle?: string;
  skeletons?: number;
}) {
  const cards = isLoading
    ? Array.from({ length: skeletons }, (_, i) => <CardSkeleton key={i} />)
    : products.map(p => <ProductCard key={p.id} product={p} index={-1} context={context} cardStyle={cardStyle} />);
  if (layout === 'carousel') return <Scroller items={cards} itemClassName="w-[46%] @2xl:w-[31%] @5xl:w-[23%]" label={label} />;
  return <ul className={GRID} aria-label={label}>{cards.map((c, i) => <li key={i}>{c}</li>)}</ul>;
}
