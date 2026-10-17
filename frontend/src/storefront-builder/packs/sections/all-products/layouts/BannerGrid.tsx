import { optimizeImage } from '../../../../../utils/imageUrl';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import { ProductCard } from '../../../../ui/ProductCard';
import type { AllProductsSettings } from '../manifest';
import { Breadcrumb, CatalogRoot, CategoryTabs, Pager, Results, SortSelect } from '../parts/Parts';
import { gridClass, useCatalog } from '../parts/useCatalog';

/** A category banner (its photo, name and description) above the grid. */
export default function BannerGrid({ settings, context }: LayoutProps<AllProductsSettings>) {
  const c = useCatalog(settings, context);
  const { store } = useStorefront();
  const image = c.activeSub?.imageUrl ?? c.activeCat?.imageUrl ?? store.bannerUrl ?? null;
  const description = c.activeSub?.description ?? c.activeCat?.description ?? null;
  const grid = gridClass(settings);
  const H = context.isFirst ? 'h1' : 'h2';
  return (
    <CatalogRoot c={c}>
      <div className="sf-container pt-6">
        <div className="relative flex min-h-[200px] items-end overflow-hidden sf-img @3xl:min-h-[280px]" style={{ background: 'var(--sf-button)' }}>
          {image && <img src={optimizeImage(image, 1600)} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority={context.isFirst ? 'high' : undefined} />}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgb(0 0 0 / 0.6), rgb(0 0 0 / 0.05))' }} aria-hidden />
          <div className="relative p-6 text-white @3xl:p-10">
            <H className="sf-h1">{c.heading}</H>
            {description && <p className="mt-2 max-w-xl text-sm opacity-90 @3xl:text-base">{description}</p>}
            <p className="mt-2 text-xs font-semibold opacity-80" aria-live="polite">{c.isLoading ? 'Loading…' : `${c.total} item${c.total === 1 ? '' : 's'}`}</p>
          </div>
        </div>
      </div>
      <div className="mt-4"><CategoryTabs c={c} settings={settings} /></div>
      <div className="sf-container space-y-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumb c={c} settings={settings} />
          {settings.showFilters && <SortSelect c={c} />}
        </div>
        <Results c={c} skeletonClass={grid} render={items => (
          <ul className={grid}>{items.map(p => <li key={p.id}><ProductCard product={p} index={-1} context={context} cardStyle={settings.cardStyle} /></li>)}</ul>
        )} />
        <Pager c={c} />
      </div>
    </CatalogRoot>
  );
}
