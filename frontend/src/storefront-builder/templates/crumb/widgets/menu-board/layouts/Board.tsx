import { useProductList, useResolvedCategories } from '../../../../../core/data/hooks';
import { useShell } from '../../../../../core/shell-context';
import { useStorefront } from '../../../../../core/storefront-context';
import type { LayoutProps, StoreCategory } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { FoodMark } from '../../../../../ui/FoodMark';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { formatCurrency } from '../../../../../../utils/formatCurrency';
import { displayPrice, isOutOfStock } from '../../../../../ui/product';
import type { MenuBoardSettings } from '../manifest';

/** Categories as menu columns; each item is a dotted line to its live price. */
export default function Board({ settings, context }: LayoutProps<MenuBoardSettings>) {
  const { items, isLoading } = useResolvedCategories(settings.categories);
  if (!isLoading && !items.length) return <EditorHint context={context} text="Add product categories to build your menu." />;
  const limit = Math.min(Math.max(Number(settings.perCategory) || 8, 3), 20);
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} align="center" />
      <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-x-16">
        {items.map(c => <MenuColumn key={c.id} category={c} limit={limit} />)}
      </div>
    </div>
  );
}

function MenuColumn({ category, limit }: { category: StoreCategory; limit: number }) {
  const { store } = useStorefront();
  const { openProduct } = useShell();
  const { data, isLoading } = useProductList({ categoryId: category.id, pageSize: limit });
  const products = data?.items ?? [];
  if (!isLoading && !products.length) return null;
  const headingId = `menu-${category.id}`;
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="sf-h3 mb-3 pb-2 text-center" style={{ borderBottom: '1px solid var(--sf-border)' }}>{category.name}</h3>
      {isLoading ? <div className="sf-skeleton h-40" aria-hidden /> : (
        <ul className="space-y-1">
          {products.map(p => {
            const { amount, from } = displayPrice(p);
            const soldOut = isOutOfStock(p);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => openProduct(p)} className="flex w-full items-baseline gap-2 py-1.5 text-left hover:underline" style={soldOut ? { opacity: 0.55 } : undefined}>
                  <span className="flex min-w-0 items-center gap-1.5 font-medium">
                    <FoodMark product={p} />
                    <span className="truncate">{p.title}</span>
                  </span>
                  <span aria-hidden className="min-w-4 flex-1 -translate-y-1 border-b-2 border-dotted" style={{ borderColor: 'var(--sf-border)' }} />
                  <span className="shrink-0 font-semibold tabular-nums">
                    {soldOut ? 'Sold out' : `${from ? 'from ' : ''}${formatCurrency(amount, store.currency ?? 'INR').replace(/\.00$/, '')}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
