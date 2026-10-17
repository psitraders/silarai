import type { LayoutProps } from '../../../../core/types';
import { ProductCard } from '../../../../ui/ProductCard';
import type { AllProductsSettings } from '../manifest';
import { Breadcrumb, CatalogRoot, CategoryTabs, Pager, Results, Toolbar } from '../parts/Parts';
import { useCatalog } from '../parts/useCatalog';

/** Fast-scanning rows with +/− steppers (grocery, kirana). Uses the list-row card unless overridden. */
export default function List({ settings, context }: LayoutProps<AllProductsSettings>) {
  const c = useCatalog(settings, context);
  const list = 'grid gap-2.5 @3xl:grid-cols-2';
  return (
    <CatalogRoot c={c}>
      <CategoryTabs c={c} settings={settings} />
      <div className="sf-container space-y-5 py-8">
        <Breadcrumb c={c} settings={settings} />
        <Toolbar c={c} settings={settings} context={context} />
        <Results c={c} skeletonClass={list} skeletons={6} render={items => (
          <ul className={list}>{items.map(p => <li key={p.id}><ProductCard product={p} index={-1} context={context} cardStyle={settings.cardStyle || 'list-row'} /></li>)}</ul>
        )} />
        <Pager c={c} />
      </div>
    </CatalogRoot>
  );
}
