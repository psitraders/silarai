import { useResolvedProducts } from '../../../../core/data/hooks';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { CardSkeleton, ProductCard } from '../../../../ui/ProductCard';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { ProductCollectionSettings } from '../manifest';
import { ViewAllLink } from '../ViewAllLink';

/** The first product takes a 2×2 spot; the rest fill the grid around it. */
export default function LargeFirst({ settings, context }: LayoutProps<ProductCollectionSettings>) {
  const { items, isLoading } = useResolvedProducts(settings.products);
  if (!isLoading && !items.length) return <EditorHint context={context} text="No products match this collection yet." />;
  const list = isLoading ? Array.from({ length: 5 }, () => null) : items;

  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading
        eyebrow={settings.eyebrow}
        title={settings.title}
        subtitle={settings.subtitle}
        action={settings.showViewAll ? <ViewAllLink query={settings.products.$products} categoryName={items[0]?.categoryName} /> : undefined}
      />
      <ul className="sf-gap grid grid-cols-2 @3xl:grid-cols-4">
        {list.map((p, i) => (
          <li key={p?.id ?? i} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
            {p ? <ProductCard product={p} index={settings.showRank ? i : -1} context={context} cardStyle={settings.cardStyle} /> : <CardSkeleton />}
          </li>
        ))}
      </ul>
    </div>
  );
}
