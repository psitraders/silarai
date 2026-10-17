import { useState } from 'react';
import type { LayoutProps } from '../../../../core/types';
import { ProductCard } from '../../../../ui/ProductCard';
import type { AllProductsSettings } from '../manifest';
import { Breadcrumb, CatalogRoot, CategoryTabs, FilterPanel, Pager, Results, Toolbar } from '../parts/Parts';
import { gridClass, useCatalog } from '../parts/useCatalog';

/**
 * Full catalogue: sticky category tabs, search (from ?q=), sort, stock filter and paging.
 * On the collection page the category lives in the URL (/category/:slug?sub=…) so it can be shared.
 */
export default function GridFilters({ settings, context }: LayoutProps<AllProductsSettings>) {
  const c = useCatalog(settings, context);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const grid = gridClass(settings);
  return (
    <CatalogRoot c={c}>
      <CategoryTabs c={c} settings={settings} />
      <div className="sf-container space-y-5 py-8">
        <Breadcrumb c={c} settings={settings} />
        <Toolbar c={c} settings={settings} context={context} filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen(o => !o)} />
        <FilterPanel c={c} open={settings.showFilters && filtersOpen} />
        <Results c={c} skeletonClass={grid} render={items => (
          <ul className={grid}>
            {items.map((p, i) => (
              <li key={p.id} className="sf-reveal" style={{ animationDelay: `${Math.min(i % c.pageSize, 9) * 40}ms` }}>
                <ProductCard product={p} index={-1} context={context} cardStyle={settings.cardStyle} />
              </li>
            ))}
          </ul>
        )} />
        <Pager c={c} />
      </div>
    </CatalogRoot>
  );
}
