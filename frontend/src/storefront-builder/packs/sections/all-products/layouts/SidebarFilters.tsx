import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { LayoutProps } from '../../../../core/types';
import { Overlay } from '../../../../ui/Overlay';
import { ProductCard } from '../../../../ui/ProductCard';
import type { AllProductsSettings } from '../manifest';
import { Breadcrumb, CatalogRoot, ClearButton, Pager, PriceFilter, Results, SortSelect, StockFilter } from '../parts/Parts';
import { gridClass, useCatalog, type Catalog } from '../parts/useCatalog';

/** Filters in a left sidebar on wide screens (a drawer on phones) beside the grid. */
export default function SidebarFilters({ settings, context }: LayoutProps<AllProductsSettings>) {
  const c = useCatalog(settings, context);
  const [drawer, setDrawer] = useState(false);
  const grid = gridClass({ ...settings, columns: Math.min(Number(settings.columns) || 3, 4) });
  const H = context.isFirst ? 'h1' : 'h2';
  return (
    <CatalogRoot c={c}>
      <div className="sf-container space-y-5 py-8">
        <Breadcrumb c={c} settings={settings} />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <H className="sf-h2">{c.heading}</H>
            <p className="mt-1 text-xs font-medium sf-muted" aria-live="polite">{c.isLoading ? 'Loading…' : `${c.total} item${c.total === 1 ? '' : 's'}`}</p>
          </div>
          {settings.showFilters && (
            <button type="button" className="sf-btn sf-btn-secondary sf-btn-sm @4xl:hidden" onClick={() => setDrawer(true)}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters{c.activeFilters ? ` · ${c.activeFilters}` : ''}
            </button>
          )}
        </div>
        <div className="grid gap-8 @4xl:grid-cols-[240px_1fr]">
          {settings.showFilters && <aside className="hidden @4xl:block" aria-label="Filters"><Sidebar c={c} settings={settings} /></aside>}
          <div className={settings.showFilters ? '' : '@4xl:col-span-2'}>
            <Results c={c} skeletonClass={grid} render={items => (
              <ul className={grid}>{items.map(p => <li key={p.id}><ProductCard product={p} index={-1} context={context} cardStyle={settings.cardStyle} /></li>)}</ul>
            )} />
            <Pager c={c} />
          </div>
        </div>
      </div>
      {drawer && (
        <Overlay onClose={() => setDrawer(false)} label="Filters" variant="drawer-left" size="sm">
          <div className="overflow-y-auto p-5 pt-14"><Sidebar c={c} settings={settings} /></div>
          <div className="mt-auto p-4" style={{ borderTop: '1px solid var(--sf-border)' }}>
            <button type="button" className="sf-btn sf-btn-primary sf-btn-block" onClick={() => setDrawer(false)}>Show {c.total} item{c.total === 1 ? '' : 's'}</button>
          </div>
        </Overlay>
      )}
    </CatalogRoot>
  );
}

function Sidebar({ c, settings }: { c: Catalog; settings: AllProductsSettings }) {
  return (
    <div className="space-y-7 @4xl:sticky @4xl:top-[calc(var(--sf-header-h,64px)+1rem)]">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide sf-muted">Sort by</p>
        <SortSelect c={c} />
      </div>
      {c.categories.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide sf-muted">Category</p>
          <ul className="space-y-0.5">
            {[{ id: null as string | null, name: 'All products', subCategories: [] as { id: string; name: string }[] }, ...c.categories].map(cat => (
              <li key={cat.id ?? 'all'}>
                <button type="button" onClick={() => c.selectCategory(cat.id)} aria-current={c.cat === cat.id ? 'true' : undefined} className="w-full rounded-[var(--sf-radius-sm)] px-2.5 py-2 text-left text-sm font-medium transition-colors" style={c.cat === cat.id ? { background: 'color-mix(in srgb, var(--sf-link) 12%, transparent)', color: 'var(--sf-link)', fontWeight: 700 } : undefined}>
                  {cat.name}
                </button>
                {settings.filterSubcategories !== false && c.cat === cat.id && !!cat.subCategories?.length && (
                  <ul className="ml-3 mt-0.5 space-y-0.5 pl-2" style={{ borderLeft: '2px solid var(--sf-border)' }}>
                    {cat.subCategories.map(s => (
                      <li key={s.id}>
                        <button type="button" onClick={() => c.selectCategory(cat.id, s.id)} aria-current={c.sub === s.id ? 'true' : undefined} className="w-full px-2 py-1.5 text-left text-sm sf-muted" style={c.sub === s.id ? { color: 'var(--sf-link)', fontWeight: 700 } : undefined}>{s.name}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {c.showPriceFilter && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide sf-muted" aria-hidden>Price</p>
          <PriceFilter c={c} label={false} />
        </div>
      )}
      {settings.filterStock !== false && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide sf-muted">Availability</p>
          <StockFilter c={c} />
        </div>
      )}
      <ClearButton c={c} />
    </div>
  );
}
