import type { LayoutProps } from '../../../../core/types';
import { ProductCard } from '../../../../ui/ProductCard';
import type { AllProductsSettings } from '../manifest';
import { Breadcrumb, CatalogRoot, Pager, Results, SubChips, Toolbar } from '../parts/Parts';
import { useCatalog } from '../parts/useCatalog';

/** Two large columns with generous spacing (jewellery, luxury — Noor). Uses the editorial card unless overridden. */
export default function Editorial2Col({ settings, context }: LayoutProps<AllProductsSettings>) {
  const c = useCatalog(settings, context);
  const grid = 'grid grid-cols-1 gap-x-8 gap-y-14 @xl:grid-cols-2 @5xl:gap-x-14';
  return (
    <CatalogRoot c={c}>
      <div className="sf-container space-y-8 py-10 @3xl:py-16">
        <Breadcrumb c={c} settings={settings} />
        <Toolbar c={c} settings={settings} context={context} />
        {settings.showCategoryTabs && (
          <div className="sf-scroll-x flex gap-2">
            {[{ id: null as string | null, name: 'All' }, ...c.categories].map(cat => (
              <button key={cat.id ?? 'all'} type="button" className="sf-chip" aria-pressed={c.cat === cat.id} onClick={() => c.selectCategory(cat.id)}>{cat.name}</button>
            ))}
          </div>
        )}
        {settings.filterSubcategories !== false && <SubChips c={c} />}
        <Results c={c} skeletonClass={grid} skeletons={4} render={items => (
          <ul className={grid}>{items.map(p => <li key={p.id}><ProductCard product={p} index={-1} context={context} cardStyle={settings.cardStyle || 'editorial'} /></li>)}</ul>
        )} />
        <Pager c={c} />
      </div>
    </CatalogRoot>
  );
}
