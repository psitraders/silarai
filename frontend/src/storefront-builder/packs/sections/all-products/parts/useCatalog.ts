import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCategories, useInfiniteProductList, useProductList } from '../../../../core/data/hooks';
import { slugify, useStorefront } from '../../../../core/storefront-context';
import type { RenderContext } from '../../../../core/types';
import type { AllProductsSettings } from '../manifest';

export const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
];

const MOBILE: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };
const DESKTOP: Record<number, string> = {
  2: '@2xl:grid-cols-2',
  3: '@2xl:grid-cols-3',
  4: '@2xl:grid-cols-3 @5xl:grid-cols-4',
  5: '@2xl:grid-cols-3 @4xl:grid-cols-4 @6xl:grid-cols-5',
  6: '@2xl:grid-cols-3 @4xl:grid-cols-4 @6xl:grid-cols-6',
};

/** Grid classes for the merchant's column choice (container queries). */
export function gridClass(settings: Pick<AllProductsSettings, 'columns' | 'mobileColumns'>): string {
  const desktop = Math.min(Math.max(Number(settings.columns) || 4, 2), 6);
  const mobile = Math.min(Math.max(Number(settings.mobileColumns) || 2, 1), 3);
  return `grid gap-3 @3xl:gap-4 ${MOBILE[mobile]} ${DESKTOP[desktop]}`;
}

/**
 * Catalogue state shared by every collection layout: category (in the URL on the
 * collection page, local elsewhere), search (?q=), sort, stock filter and paging.
 */
export function useCatalog(settings: AllProductsSettings, context: RenderContext) {
  const { links } = useStorefront();
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const { data: categories = [] } = useCategories();
  // Callback ref (state) so layouts can attach it during render.
  const [topEl, setTopEl] = useState<HTMLDivElement | null>(null);
  const onCollectionPage = context.page === 'collection';

  const urlCategory = useMemo(() => {
    if (!categorySlug) return { cat: null as string | null, sub: null as string | null };
    const cat = categories.find(c => slugify(c.name) === categorySlug);
    const subSlug = searchParams.get('sub');
    const sub = subSlug ? cat?.subCategories?.find(s => slugify(s.name) === subSlug) : undefined;
    return { cat: cat?.id ?? null, sub: sub?.id ?? null };
  }, [categorySlug, categories, searchParams]);

  const search = searchParams.get('q')?.trim() ?? '';
  const [localCat, setLocalCat] = useState<{ cat: string | null; sub: string | null } | null>(null);
  const { cat, sub } = onCollectionPage ? urlCategory : (localCat ?? { cat: null, sub: null });
  const [pickedSort, setSort] = useState<string | null>(null);
  const sort = pickedSort ?? settings.defaultSort ?? '';
  const [inStockOnly, setInStockOnly] = useState(false);
  const [price, setPrice] = useState<PriceRange>(NO_PRICE);
  const [page, setPage] = useState(1);
  const showStockFilter = settings.showFilters && settings.filterStock !== false;
  const showPriceFilter = settings.showFilters && settings.filterPrice !== false;
  const priceActive = price.min != null || price.max != null;

  // Back to page 1 whenever the query changes.
  const queryKey = `${cat}|${sub}|${search}|${sort}|${inStockOnly}|${price.min}|${price.max}`;
  const [lastKey, setLastKey] = useState(queryKey);
  if (lastKey !== queryKey) { setLastKey(queryKey); setPage(1); }

  const pageSize = Math.min(Math.max(Number(settings.pageSize) || 36, 12), 60);
  const paged = (settings.paging ?? 'pages') === 'pages';
  const params = { search, categoryId: sub ?? cat, sort, inStockOnly, pageSize, minPrice: price.min, maxPrice: price.max, withPriceBounds: showPriceFilter };
  const list = useProductList({ ...params, page }, paged);
  const more = useInfiniteProductList(params, !paged);

  const items = paged ? list.data?.items ?? [] : more.data?.pages.flatMap(p => p.items) ?? [];
  const total = paged ? list.data?.totalCount ?? 0 : more.data?.pages[0]?.totalCount ?? 0;
  const priceBounds = (paged ? list.data?.priceBounds : more.data?.pages[0]?.priceBounds) ?? null;
  const isLoading = paged ? list.isLoading : more.isLoading;

  const activeCat = categories.find(c => c.id === cat);
  const activeSub = activeCat?.subCategories?.find(s => s.id === sub);

  const selectCategory = (catId: string | null, subId: string | null = null) => {
    if (onCollectionPage) {
      const c = categories.find(x => x.id === catId);
      const s = c?.subCategories?.find(x => x.id === subId);
      navigate(c ? links.category(c.name, s?.name) : links.allProducts(), { replace: true });
    } else {
      setLocalCat({ cat: catId, sub: subId });
    }
  };

  const scrollToTop = () => topEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const goToPage = (n: number) => { setPage(n); scrollToTop(); };
  const clearAll = () => {
    setSort(''); setInStockOnly(false); setPrice(NO_PRICE); selectCategory(null);
    if (search) navigate(links.allProducts(), { replace: true });
  };

  useEffect(() => {
    if (search && !onCollectionPage) topEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [search, onCollectionPage, topEl]);

  return {
    setTopEl,
    categories,
    cat,
    sub,
    activeCat,
    activeSub,
    selectCategory,
    search,
    sort,
    setSort,
    inStockOnly,
    setInStockOnly,
    price,
    setPrice,
    priceActive,
    priceBounds,
    showStockFilter,
    showPriceFilter,
    /** Filters in the filter panel (stock, price) — sort not counted. */
    panelFilters: [inStockOnly, priceActive].filter(Boolean).length,
    activeFilters: [sort, inStockOnly, priceActive].filter(Boolean).length,
    items,
    total,
    isLoading,
    paging: settings.paging ?? 'pages',
    page,
    pages: paged ? Math.ceil(total / pageSize) : 0,
    goToPage,
    hasMore: !paged && !!more.hasNextPage,
    loadMore: () => { void more.fetchNextPage(); },
    loadingMore: more.isFetchingNextPage,
    clearAll,
    pageSize,
    heading: activeSub?.name ?? activeCat?.name ?? (search ? `Results for “${search}”` : settings.title),
  };
}

export type Catalog = ReturnType<typeof useCatalog>;

/** Effective-price range (sale price, else base price); null = no limit. */
export interface PriceRange { min: number | null; max: number | null }
const NO_PRICE: PriceRange = { min: null, max: null };
