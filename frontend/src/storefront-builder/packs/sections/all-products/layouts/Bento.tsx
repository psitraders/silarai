import { useState } from 'react';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { useShell } from '../../../../core/shell-context';
import type { LayoutProps, StoreProduct } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { ProductCard } from '../../../../ui/ProductCard';
import type { AllProductsSettings } from '../manifest';
import { Breadcrumb, CatalogRoot, CategoryTabs, FilterPanel, Pager, Results, Toolbar } from '../parts/Parts';
import { useCatalog } from '../parts/useCatalog';

/** A big featured tile first, then a regular grid (electronics, Volt). */
export default function Bento({ settings, context }: LayoutProps<AllProductsSettings>) {
  const c = useCatalog(settings, context);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const grid = 'grid grid-cols-2 gap-3 @3xl:grid-cols-4 @3xl:gap-4';
  return (
    <CatalogRoot c={c}>
      <CategoryTabs c={c} settings={settings} />
      <div className="sf-container space-y-5 py-8">
        <Breadcrumb c={c} settings={settings} />
        <Toolbar c={c} settings={settings} context={context} filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen(o => !o)} />
        <FilterPanel c={c} open={settings.showFilters && filtersOpen} />
        <Results c={c} skeletonClass={grid} render={items => (
          <ul className={`${grid} @3xl:grid-flow-dense`}>
            {items.map((p, i) => (
              <li key={p.id} className={i === 0 && c.page === 1 ? 'col-span-2 @3xl:row-span-2' : ''}>
                {i === 0 && c.page === 1 ? <Feature product={p} /> : <ProductCard product={p} index={-1} context={context} cardStyle={settings.cardStyle} />}
              </li>
            ))}
          </ul>
        )} />
        <Pager c={c} />
      </div>
    </CatalogRoot>
  );
}

function Feature({ product }: { product: StoreProduct }) {
  const shell = useShell();
  return (
    <button type="button" onClick={() => shell.openProduct(product)} className="group relative block h-full min-h-[320px] w-full overflow-hidden text-left sf-img" aria-label={`View ${product.title}`}>
      {product.primaryImage
        ? <img src={optimizeImage(product.primaryImage, 1000)} alt="" className="sf-zoom absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03]" />
        : <span className="sf-placeholder absolute inset-0" />}
      <span className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgb(0 0 0 / 0.65), transparent 60%)' }} aria-hidden />
      <span className="absolute inset-x-0 bottom-0 block p-5 text-white @3xl:p-7">
        <span className="sf-badge mb-2">Featured</span>
        <span className="block text-xl font-bold leading-tight @3xl:text-2xl">{product.title}</span>
        <span className="mt-1 block [&_.sf-price]:text-white [&_.sf-muted]:text-white/75"><Price product={product} /></span>
      </span>
    </button>
  );
}
