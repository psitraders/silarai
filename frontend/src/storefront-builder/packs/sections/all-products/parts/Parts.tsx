import { ArrowUpDown, ChevronLeft, ChevronRight, Loader2, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { useStorefront } from '../../../../core/storefront-context';
import type { RenderContext, StoreProduct } from '../../../../core/types';
import { CardSkeleton } from '../../../../ui/ProductCard';
import type { AllProductsSettings } from '../manifest';
import { SORTS, type Catalog } from './useCatalog';

/** Sticky category tabs with sub-category chips. */
export function CategoryTabs({ c, settings }: { c: Catalog; settings: AllProductsSettings }) {
  if (!settings.showCategoryTabs || c.categories.length < 2) return null;
  return (
    <nav aria-label="Product categories" className="sf-bar sticky z-20" style={{ top: 'var(--sf-header-h, 64px)' }}>
      <div className="sf-container">
        <div className="sf-scroll-x flex">
          {[{ id: null as string | null, name: 'All' }, ...c.categories].map(cat => {
            const active = c.cat === cat.id;
            return (
              <button
                key={cat.id ?? 'all'}
                type="button"
                onClick={() => c.selectCategory(cat.id)}
                aria-current={active ? 'true' : undefined}
                className="shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition-colors"
                style={active ? { borderColor: 'var(--sf-link)', color: 'var(--sf-link)' } : { borderColor: 'transparent', color: 'var(--sf-muted)' }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
        {settings.filterSubcategories !== false && !!c.activeCat?.subCategories?.length && <SubChips c={c} className="pb-3 pt-1" />}
      </div>
    </nav>
  );
}

export function SubChips({ c, className = '' }: { c: Catalog; className?: string }) {
  if (!c.activeCat?.subCategories?.length) return null;
  return (
    <div className={`sf-scroll-x flex gap-2 ${className}`}>
      <button type="button" className="sf-chip" aria-pressed={!c.sub} onClick={() => c.selectCategory(c.cat, null)}>All {c.activeCat.name}</button>
      {c.activeCat.subCategories.map(s => (
        <button key={s.id} type="button" className="sf-chip" aria-pressed={c.sub === s.id} onClick={() => c.selectCategory(c.cat, s.id)}>{s.name}</button>
      ))}
    </div>
  );
}

export function Breadcrumb({ c, settings }: { c: Catalog; settings: AllProductsSettings }) {
  const { links } = useStorefront();
  if (!settings.showBreadcrumb) return null;
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-medium sf-muted">
      <Link to={links.home()} className="hover:underline">Home</Link>
      <ChevronRight className="h-3 w-3" aria-hidden />
      {c.activeCat ? (
        <>
          <Link to={links.allProducts()} className="hover:underline">All products</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span aria-current="page" className="font-semibold" style={{ color: 'var(--sf-text)' }}>{c.activeCat.name}</span>
        </>
      ) : (
        <span aria-current="page" className="font-semibold" style={{ color: 'var(--sf-text)' }}>All products</span>
      )}
    </nav>
  );
}

export function SortSelect({ c }: { c: Catalog }) {
  return (
    <label className="relative">
      <span className="sr-only">Sort products</span>
      <select value={c.sort} onChange={e => c.setSort(e.target.value)} className="sf-input cursor-pointer appearance-none py-2 pl-3.5 pr-9 text-sm font-medium">
        {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 sf-muted" aria-hidden />
    </label>
  );
}

/** Heading + item count, with sort and a filters button on the right. */
export function Toolbar({ c, settings, context, filtersOpen, onToggleFilters, extra }: {
  c: Catalog; settings: AllProductsSettings; context: RenderContext; filtersOpen?: boolean; onToggleFilters?: () => void; extra?: ReactNode;
}) {
  const H = context.isFirst ? 'h1' : 'h2';
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <H className="sf-h2">{c.heading}</H>
        <p className="mt-1 text-xs font-medium sf-muted" aria-live="polite">{c.isLoading ? 'Loading…' : `${c.total} item${c.total === 1 ? '' : 's'}`}</p>
      </div>
      {settings.showFilters && (
        <div className="flex items-center gap-2">
          {extra}
          <SortSelect c={c} />
          {onToggleFilters && (c.showStockFilter || c.showPriceFilter) && (
            <button type="button" onClick={onToggleFilters} aria-expanded={filtersOpen} className={`sf-btn sf-btn-sm ${filtersOpen || c.panelFilters ? 'sf-btn-primary' : 'sf-btn-secondary'}`}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> {c.panelFilters ? `Filters · ${c.panelFilters}` : 'Filters'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function StockFilter({ c }: { c: Catalog }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-3">
      <input type="checkbox" checked={c.inStockOnly} onChange={e => c.setInStockOnly(e.target.checked)} className="h-5 w-5 cursor-pointer" style={{ accentColor: 'var(--sf-button)' }} />
      <span className="text-sm font-medium">In stock only</span>
    </label>
  );
}

/**
 * Min / max price inputs (effective price: sale price, else base price). Applied on
 * blur or Enter, so the list doesn't reload on every keystroke.
 */
export function PriceFilter({ c, label = true }: { c: Catalog; label?: boolean }) {
  const { store } = useStorefront();
  const currency = store.currency ?? 'INR';
  const fmt = (n: number) => formatCurrency(n, currency).replace(/\.00$/, '');
  const toText = (n: number | null) => (n == null ? '' : String(n));
  const [draft, setDraft] = useState({ min: toText(c.price.min), max: toText(c.price.max) });
  // Follow outside changes ("Clear all").
  const applied = `${c.price.min}|${c.price.max}`;
  const [seen, setSeen] = useState(applied);
  if (seen !== applied) { setSeen(applied); setDraft({ min: toText(c.price.min), max: toText(c.price.max) }); }

  const commit = () => {
    const parse = (s: string) => { const n = Number(s); return s.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : null; };
    let min = parse(draft.min);
    let max = parse(draft.max);
    if (min != null && max != null && min > max) [min, max] = [max, min];
    if (min !== c.price.min || max !== c.price.max) c.setPrice({ min, max });
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') commit(); };
  const b = c.priceBounds;
  const input = 'sf-input w-full min-w-0 px-3 py-2 text-base @3xl:text-sm';

  return (
    <fieldset className="min-w-0">
      <legend className={label ? 'mb-2 text-sm font-medium' : 'sr-only'}>Price</legend>
      <div className="flex items-center gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Minimum price</span>
          <input type="number" inputMode="decimal" min={0} className={input} placeholder={b ? `Min ${fmt(b.min)}` : 'Min'} value={draft.min}
            onChange={e => setDraft(d => ({ ...d, min: e.target.value }))} onBlur={commit} onKeyDown={onKey} />
        </label>
        <span aria-hidden className="sf-muted">–</span>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Maximum price</span>
          <input type="number" inputMode="decimal" min={0} className={input} placeholder={b ? `Max ${fmt(b.max)}` : 'Max'} value={draft.max}
            onChange={e => setDraft(d => ({ ...d, max: e.target.value }))} onBlur={commit} onKeyDown={onKey} />
        </label>
      </div>
      {c.priceActive && (
        <button type="button" className="sf-link mt-1.5 text-xs font-semibold" onClick={() => c.setPrice({ min: null, max: null })}>Any price</button>
      )}
    </fieldset>
  );
}

export function ClearButton({ c }: { c: Catalog }) {
  if (!(c.sort || c.inStockOnly || c.priceActive || c.cat || c.search)) return null;
  return (
    <button type="button" className="sf-btn sf-btn-ghost sf-btn-sm" onClick={c.clearAll}>
      <X className="h-4 w-4" aria-hidden /> Clear all
    </button>
  );
}

export function FilterPanel({ c, open }: { c: Catalog; open: boolean }) {
  if (!open) return null;
  return (
    <div className="sf-card sf-slide-down flex flex-wrap items-end gap-6 p-5">
      {c.showPriceFilter && <div className="w-full max-w-xs"><PriceFilter c={c} /></div>}
      {c.showStockFilter && <StockFilter c={c} />}
      <ClearButton c={c} />
    </div>
  );
}

/** Loading skeletons, the empty state, or the products drawn by `render`. */
export function Results({ c, render, skeletonClass, skeletons = 8 }: {
  c: Catalog;
  render: (items: StoreProduct[]) => ReactNode;
  skeletonClass: string;
  skeletons?: number;
}) {
  if (c.isLoading) {
    return <div className={skeletonClass} aria-hidden>{Array.from({ length: skeletons }, (_, i) => <CardSkeleton key={i} />)}</div>;
  }
  if (!c.items.length) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 sf-muted opacity-40" aria-hidden />
        <h3 className="sf-h3 mb-1">No products found</h3>
        <p className="text-sm sf-muted">{c.search ? `Nothing matches “${c.search}”. Try another search.` : 'There are no products here yet.'}</p>
        {(c.search || c.cat || c.inStockOnly || c.priceActive) && <button type="button" className="sf-btn sf-btn-secondary sf-btn-sm mt-4" onClick={c.clearAll}>Clear filters</button>}
      </div>
    );
  }
  return <>{render(c.items)}</>;
}

/** Page numbers, a "Load more" button, or an infinite-scroll sentinel. */
export function Pager({ c }: { c: Catalog }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasMore, loadingMore, loadMore, paging } = c;
  useEffect(() => {
    if (paging !== 'infinite' || !hasMore) return;
    const el = sentinel.current;
    const win = el?.ownerDocument.defaultView;
    if (!el || !win || !('IntersectionObserver' in win)) return;
    const io = new win.IntersectionObserver(([e]) => { if (e.isIntersecting && !loadingMore) loadMore(); }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [paging, hasMore, loadingMore, loadMore]);

  if (paging === 'infinite') {
    return (
      <div ref={sentinel} className="flex justify-center py-6" aria-live="polite">
        {loadingMore && <Loader2 className="h-6 w-6 sf-spin sf-muted" aria-label="Loading more products" />}
      </div>
    );
  }
  if (paging === 'load-more') {
    if (!hasMore) return null;
    return (
      <div className="flex flex-col items-center gap-2 pt-6">
        <p className="text-xs sf-muted">Showing {c.items.length} of {c.total}</p>
        <button type="button" className="sf-btn sf-btn-secondary" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? <><Loader2 className="h-4 w-4 sf-spin" aria-hidden /> Loading…</> : 'Load more'}
        </button>
      </div>
    );
  }
  if (c.pages <= 1) return null;
  return (
    <nav aria-label="Pages" className="flex items-center justify-center gap-2 pt-4">
      <button type="button" className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }} disabled={c.page === 1} onClick={() => c.goToPage(c.page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      {Array.from({ length: c.pages }, (_, i) => i + 1).filter(n => Math.abs(n - c.page) < 3).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => c.goToPage(n)}
          aria-current={n === c.page ? 'page' : undefined}
          className="h-11 w-11 rounded-[var(--sf-btn-radius)] text-sm font-semibold"
          style={n === c.page ? { background: 'var(--sf-button)', color: 'var(--sf-on-button)' } : { border: '1px solid var(--sf-border)' }}
        >
          {n}
        </button>
      ))}
      <button type="button" className="sf-icon-btn" style={{ border: '1px solid var(--sf-border)' }} disabled={c.page === c.pages} onClick={() => c.goToPage(c.page + 1)} aria-label="Next page">
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}

/** Anchor + scroll offset every collection layout wraps itself in (hero "Shop now" links to #all-products). */
export function CatalogRoot({ c, children }: { c: Catalog; children: ReactNode }) {
  const { setTopEl } = c;
  return <div id="all-products" ref={setTopEl} style={{ scrollMarginTop: 'var(--sf-header-h, 64px)' }}>{children}</div>;
}
