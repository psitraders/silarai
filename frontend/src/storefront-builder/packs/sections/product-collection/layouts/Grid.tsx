import { useResolvedProducts } from '../../../../core/data/hooks';
import type { LayoutProps } from '../../../../core/types';
import { ProductCard, ProductGridSkeleton } from '../../../../ui/ProductCard';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { ProductCollectionSettings } from '../manifest';
import { ViewAllLink } from '../ViewAllLink';

const GRID = 'sf-gap grid grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-4';

export default function Grid({ settings, context }: LayoutProps<ProductCollectionSettings>) {
  const { items, isLoading } = useResolvedProducts(settings.products);

  if (!isLoading && !items.length) {
    return context.mode === 'live' ? null : (
      <div className="sf-container sf-section-pad text-center sf-muted">No products match this collection yet.</div>
    );
  }

  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading
        eyebrow={settings.eyebrow}
        title={settings.title}
        subtitle={settings.subtitle}
        action={settings.showViewAll ? <ViewAllLink query={settings.products.$products} categoryName={items[0]?.categoryName} /> : undefined}
      />
      {isLoading ? (
        <ProductGridSkeleton count={settings.products.$products.limit ?? 8} className={GRID} />
      ) : (
        <ul className={GRID}>
          {items.map((p, i) => (
            <li key={p.id}><ProductCard product={p} index={settings.showRank ? i : -1} context={context} cardStyle={settings.cardStyle} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
