import { useCurrentProduct } from '../../../../core/commerce/currentProduct';
import { useRelatedProducts } from '../../../../core/data/hooks';
import type { RenderContext } from '../../../../core/types';
import { CardSkeleton, ProductCard } from '../../../../ui/ProductCard';
import { Scroller } from '../../../../ui/Scroller';

/** Cross-sell row: more products from the same category (Menu item, Shop the look). */
export function AddOns({ heading, context, wide = false }: { heading: string; context: RenderContext; wide?: boolean }) {
  const product = useCurrentProduct();
  const { items, isLoading } = useRelatedProducts(product, 8);
  if (!isLoading && !items.length) return null;
  const cards = isLoading
    ? Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)
    : items.map((p, i) => <ProductCard key={p.id} product={p} index={-1 - i} context={context} />);
  return (
    <div className="mt-12">
      {heading && <h2 className="sf-h3 mb-4 font-bold">{heading}</h2>}
      <Scroller items={cards} itemClassName={wide ? 'w-[46%] @3xl:w-[23%]' : 'w-[46%] @3xl:w-[30%]'} label={heading || 'More products'} />
    </div>
  );
}
