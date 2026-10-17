import { ArrowRight } from 'lucide-react';
import { useProductList } from '../../../../core/data/hooks';
import type { LayoutProps, RenderContext } from '../../../../core/types';
import { CardSkeleton, ProductCard } from '../../../../ui/ProductCard';
import { Scroller } from '../../../../ui/Scroller';
import type { AllProductsSettings } from '../manifest';
import { Breadcrumb, CatalogRoot, Pager, Results, Toolbar } from '../parts/Parts';
import { gridClass, useCatalog } from '../parts/useCatalog';

/**
 * One swipeable row per category (or per sub-category inside a category) — easy
 * browsing for food and grocery menus. Searches and leaf categories show a grid.
 */
export default function CategoryRows({ settings, context }: LayoutProps<AllProductsSettings>) {
  const c = useCatalog(settings, context);
  const groups = c.search ? [] : c.activeCat ? (c.sub ? [] : c.activeCat.subCategories ?? []) : c.categories.slice(0, 10);
  const grid = gridClass(settings);
  return (
    <CatalogRoot c={c}>
      <div className="sf-container space-y-6 py-8">
        <Breadcrumb c={c} settings={settings} />
        <Toolbar c={c} settings={settings} context={context} />
        {c.activeCat && <button type="button" className="sf-link text-sm font-semibold" onClick={() => c.selectCategory(null)}>← All categories</button>}
        {groups.length > 0 ? (
          <div className="space-y-10">
            {groups.map(g => (
              <Row key={g.id} name={g.name} categoryId={g.id} context={context} settings={settings} onViewAll={() => (c.activeCat ? c.selectCategory(c.cat, g.id) : c.selectCategory(g.id))} />
            ))}
          </div>
        ) : (
          <>
            <Results c={c} skeletonClass={grid} render={items => (
              <ul className={grid}>{items.map(p => <li key={p.id}><ProductCard product={p} index={-1} context={context} cardStyle={settings.cardStyle} /></li>)}</ul>
            )} />
            <Pager c={c} />
          </>
        )}
      </div>
    </CatalogRoot>
  );
}

function Row({ name, categoryId, context, settings, onViewAll }: { name: string; categoryId: string; context: RenderContext; settings: AllProductsSettings; onViewAll: () => void }) {
  const { data, isLoading } = useProductList({ categoryId, pageSize: 12 });
  const items = data?.items ?? [];
  if (!isLoading && !items.length) return null;
  const cards = isLoading
    ? Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)
    : items.map(p => <ProductCard key={p.id} product={p} index={-1} context={context} cardStyle={settings.cardStyle} />);
  return (
    <section aria-label={name}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="sf-h3 font-bold">{name}</h3>
        {(data?.totalCount ?? 0) > items.length && (
          <button type="button" className="sf-link inline-flex items-center gap-1 text-sm font-semibold" onClick={onViewAll}>View all {data?.totalCount} <ArrowRight className="h-4 w-4" aria-hidden /></button>
        )}
      </div>
      <Scroller items={cards} itemClassName="w-[44%] @2xl:w-[30%] @5xl:w-[19%]" label={name} arrows="none" />
    </section>
  );
}
