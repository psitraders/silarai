/**
 * Data hooks for packs. Layouts never fetch on their own (design.md §13 rule 4):
 * they read smart values through these hooks. Published pages arrive with
 * `items` already filled by the server; drafts and the Starter default are
 * resolved here on the client with the same rules.
 */
import { useInfiniteQuery, useMutation, useQueries, useQuery } from '@tanstack/react-query';
import type { ProductDetail } from '../commerce/types';
import { useStorefront } from '../storefront-context';
import type { SmartCategories, SmartProducts, StoreCategory, StoreCoupon, StoreProduct, StoreReviewsSummary } from '../types';
import { storefrontApi, type ProductListParams } from './api';

const FIVE_MIN = 5 * 60 * 1000;

export function useCategories() {
  const { slug } = useStorefront();
  return useQuery<StoreCategory[]>({
    queryKey: ['public-categories', slug],
    queryFn: () => storefrontApi.categories(slug),
    staleTime: FIVE_MIN,
    gcTime: 30 * 60 * 1000,
  });
}

export function useProductList(params: ProductListParams, enabled = true) {
  const { slug } = useStorefront();
  return useQuery({
    queryKey: ['public-products', slug, params.search ?? '', params.categoryId ?? null, params.sort ?? '', !!params.inStockOnly, params.page ?? 1, params.pageSize ?? 24, params.minPrice ?? null, params.maxPrice ?? null, !!params.withPriceBounds],
    queryFn: () => storefrontApi.products(slug, params),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled,
  });
}

/** Page-by-page product list for "Load more" / infinite scroll. */
export function useInfiniteProductList(params: Omit<ProductListParams, 'page'>, enabled = true) {
  const { slug } = useStorefront();
  const pageSize = params.pageSize ?? 24;
  return useInfiniteQuery({
    queryKey: ['public-products-pages', slug, params.search ?? '', params.categoryId ?? null, params.sort ?? '', !!params.inStockOnly, pageSize, params.minPrice ?? null, params.maxPrice ?? null, !!params.withPriceBounds],
    queryFn: ({ pageParam }) => storefrontApi.products(slug, { ...params, page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: last => (last.page * last.pageSize < last.totalCount ? last.page + 1 : undefined),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}

/** Full, live details of several products (compare tray / table), in the given order. */
export function useProductDetails(ids: string[]): { items: ProductDetail[]; isLoading: boolean } {
  const { slug } = useStorefront();
  const results = useQueries({
    queries: ids.map(id => ({
      queryKey: ['public-product', slug, id],
      queryFn: () => storefrontApi.product(slug, id),
      staleTime: 2 * 60 * 1000,
    })),
  });
  return {
    items: results.flatMap(r => (r.data ? [r.data] : [])),
    isLoading: results.some(r => r.isLoading),
  };
}

/**
 * Newsletter signup. In the editor and gallery nothing is sent (like orders and inquiries):
 * the form just shows its success state.
 */
export function useNewsletterSignup(live: boolean) {
  const { slug } = useStorefront();
  return useMutation({
    mutationFn: (body: { email: string; name?: string }) =>
      live ? storefrontApi.newsletter(slug, body) : Promise.resolve({ subscribed: true }),
  });
}

/** Coupons marked "Show on storefront" (coupon strip, source "store"). */
export function useStoreCoupons(enabled = true) {
  const { slug } = useStorefront();
  return useQuery<StoreCoupon[]>({
    queryKey: ['public-coupons', slug],
    queryFn: () => storefrontApi.coupons(slug),
    enabled: enabled && !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

/** Store-wide approved reviews for the reviews summary section. */
export function useReviewsSummary(limit: number, minRating: number) {
  const { slug } = useStorefront();
  return useQuery<StoreReviewsSummary>({
    queryKey: ['public-reviews-summary', slug, limit, minRating],
    queryFn: () => storefrontApi.reviewsSummary(slug, limit, minRating),
    enabled: !!slug,
    staleTime: FIVE_MIN,
  });
}

/** Products for a `$products` smart value (server-resolved when published). */
export function useResolvedProducts(value: SmartProducts | undefined): { items: StoreProduct[]; isLoading: boolean } {
  const { slug } = useStorefront();
  const query = value?.$products;
  const serverItems = value?.items;
  const limit = Math.min(Math.max(query?.limit ?? 8, 1), 24);

  const q = useQuery<StoreProduct[]>({
    queryKey: ['sb-products', slug, query ?? null],
    enabled: !!query && !serverItems,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      switch (query!.source) {
        case 'featured':
          return (await storefrontApi.products(slug, { pageSize: 48 })).items.filter(p => p.isFeatured).slice(0, limit);
        case 'category':
          return (await storefrontApi.products(slug, { categoryId: query!.categoryId, pageSize: limit })).items;
        case 'newest':
          return (await storefrontApi.products(slug, { sort: 'newest', pageSize: limit })).items;
        case 'sale':
          return (await storefrontApi.products(slug, { pageSize: 48 })).items
            .filter(p => p.discountedPrice != null && p.discountedPrice < p.basePrice).slice(0, limit);
        case 'manual': {
          const ids = (query!.productIds ?? []).slice(0, limit);
          const results = await Promise.allSettled(ids.map(id => storefrontApi.product(slug, id)));
          return results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []));
        }
        default:
          return (await storefrontApi.products(slug, { pageSize: limit })).items;
      }
    },
  });

  if (serverItems) return { items: serverItems, isLoading: false };
  return { items: q.data ?? [], isLoading: !!query && q.isLoading };
}

/** Categories for a `$categories` smart value. */
export function useResolvedCategories(value: SmartCategories | undefined): { items: StoreCategory[]; isLoading: boolean } {
  const serverItems = value?.items;
  const all = useCategories();
  if (serverItems) return { items: serverItems, isLoading: false };

  const q = value?.$categories;
  const list = all.data ?? [];
  const limit = Math.min(Math.max(q?.limit ?? 12, 1), 48);
  const picked =
    q?.source === 'featured' ? list.filter(c => c.isFeatured)
    : q?.source === 'manual' ? (q.categoryIds ?? []).map(id => list.find(c => c.id === id)).filter((c): c is StoreCategory => !!c)
    : list;
  return { items: picked.slice(0, limit), isLoading: all.isLoading };
}

/** Products from the same category as `product` (resolved by name when the id is unknown), excluding it. */
export function useRelatedProducts(product: StoreProduct | null, limit = 8) {
  const { slug } = useStorefront();
  const categories = useCategories();
  const categoryId = product?.categoryId
    ?? (product?.categoryName ? categories.data?.find(c => c.name === product.categoryName)?.id ?? null : null);
  const waitingForCategory = !product?.categoryId && !!product?.categoryName && categories.isLoading;
  const q = useQuery({
    queryKey: ['sb-related', slug, product?.id ?? null, categoryId, limit],
    enabled: !!product && !waitingForCategory,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const res = await storefrontApi.products(slug, { categoryId, pageSize: limit + 1 });
      return res.items.filter(p => p.id !== product!.id).slice(0, limit);
    },
  });
  return { items: q.data ?? [], isLoading: !!product && (waitingForCategory || q.isLoading) };
}

/** Products by id, in the given order (missing / unpublished ones are skipped). */
export function useProductsByIds(ids: string[]) {
  const { slug } = useStorefront();
  const q = useQuery<StoreProduct[]>({
    queryKey: ['sb-products-by-id', slug, ids],
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const results = await Promise.allSettled(ids.map(id => storefrontApi.product(slug, id)));
      return results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []));
    },
  });
  return { items: q.data ?? [], isLoading: ids.length > 0 && q.isLoading };
}
