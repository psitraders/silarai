/**
 * Public storefront API calls. Packs never call these directly — they use the
 * hooks in ./hooks.ts (design.md §13 rule 4).
 */
import axios from 'axios';
import { normaliseDetail, type RawDetail } from '../commerce/normalise';
import type { ProductDetail } from '../commerce/types';
import { clearPreviewToken, previewToken } from './preview';
import type { NavPage, PageLayout, ProductTemplateRule, SiteDoc, StoreCategory, StoreCoupon, StoreInfo, StoreProduct, StoreReviewsSummary } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL;

export interface PublishedSite {
  version: number;
  publishedAt?: string | null;
  doc: SiteDoc | null;
  hasHome: boolean;
  pages: NavPage[];
  /** Extra product designs and their categories / products (absent on older APIs). */
  productTemplates?: ProductTemplateRule[];
  /** True when this is the merchant's draft, opened through a preview link. */
  preview?: boolean;
  /** Set (client-side) when the preview link was turned off — the published store is shown instead. */
  previewExpired?: boolean;
}

export interface PublishedPage {
  id: string;
  title: string;
  slug: string;
  pageType: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  updatedAt?: string;
  layout: PageLayout;
}

export interface ProductListParams {
  search?: string;
  categoryId?: string | null;
  sort?: string;
  inStockOnly?: boolean;
  page?: number;
  pageSize?: number;
  /** Effective price (sale price, else base price). */
  minPrice?: number | null;
  maxPrice?: number | null;
  /** Ask for the list's price range (before the price filter). */
  withPriceBounds?: boolean;
}

export interface ProductList {
  items: StoreProduct[];
  totalCount: number;
  page: number;
  pageSize: number;
  priceBounds?: { min: number; max: number } | null;
}

const notFoundToNull = (err: unknown) => {
  if (axios.isAxiosError(err) && err.response?.status === 404) return null;
  throw err;
};

const isGone = (err: unknown) => axios.isAxiosError(err) && err.response?.status === 410;
/** `?preview=` for site reads while a preview link is open (SB-R22). */
const pv = (slug: string) => previewToken(slug) || undefined;

export const storefrontApi = {
  store: (slug: string) =>
    axios.get<StoreInfo>(`${BASE_URL}/public/${slug}`).then(r => r.data),

  /**
   * Published builder site; `doc` is null when the store never published (→ Starter). With a preview
   * link open it is the saved draft; a turned-off link falls back to the published site.
   */
  site: (slug: string): Promise<PublishedSite | null> =>
    axios.get<PublishedSite>(`${BASE_URL}/public/${slug}/site`, { params: { preview: pv(slug) } })
      .then(r => r.data)
      .catch(async err => {
        if (!isGone(err)) return notFoundToNull(err);
        clearPreviewToken(slug);
        const live = await axios.get<PublishedSite>(`${BASE_URL}/public/${slug}/site`).then(r => r.data).catch(notFoundToNull);
        return live && { ...live, previewExpired: true };
      }),

  page: (slug: string, pageSlug: string, version: number) =>
    axios.get<PublishedPage>(`${BASE_URL}/public/${slug}/site/pages/${encodeURIComponent(pageSlug)}`, { params: { v: version, preview: pv(slug) } })
      .then(r => r.data).catch(notFoundToNull),

  /** `id` = an extra product design (falls back to the default product page on the server). */
  template: (slug: string, kind: 'product' | 'quickview' | 'collection', version: number, id?: string | null) =>
    axios.get<PublishedPage>(`${BASE_URL}/public/${slug}/site/templates/${kind}`, { params: { v: version, id: id || undefined, preview: pv(slug) } })
      .then(r => r.data).catch(notFoundToNull),

  categories: (slug: string) =>
    axios.get<StoreCategory[]>(`${BASE_URL}/public/${slug}/categories`).then(r => r.data),

  products: (slug: string, p: ProductListParams) =>
    axios.get<ProductList>(`${BASE_URL}/public/${slug}/products`, {
      params: {
        search: p.search || undefined,
        categoryId: p.categoryId || undefined,
        sort: p.sort || undefined,
        inStockOnly: p.inStockOnly || undefined,
        page: p.page ?? 1,
        pageSize: p.pageSize ?? 24,
        minPrice: p.minPrice ?? undefined,
        maxPrice: p.maxPrice ?? undefined,
        withPriceBounds: p.withPriceBounds || undefined,
      },
    }).then(r => r.data),

  /** Coupons the merchant marked "Show on storefront" (active and valid only). */
  coupons: (slug: string) =>
    axios.get<StoreCoupon[]>(`${BASE_URL}/public/${slug}/coupons`).then(r => r.data),

  /** Newsletter signup — stored as a CRM Lead tagged "newsletter" (signing up twice is fine). */
  newsletter: (slug: string, body: { email: string; name?: string }) =>
    axios.post<{ subscribed: boolean }>(`${BASE_URL}/public/${slug}/newsletter`, body).then(r => r.data),

  /** Approved reviews across the store: average, star distribution and the latest ones. */
  reviewsSummary: (slug: string, limit: number, minRating: number) =>
    axios.get<StoreReviewsSummary>(`${BASE_URL}/public/${slug}/reviews/summary`, { params: { limit, minRating } }).then(r => r.data),

  /** One product with variants; images normalised to the list shape (`primaryImage` / `allImages`). */
  product: (slug: string, slugOrId: string): Promise<ProductDetail> =>
    axios.get<RawDetail>(`${BASE_URL}/public/${slug}/products/${encodeURIComponent(slugOrId)}`).then(r => normaliseDetail(r.data)),

  reviewSummary: (slug: string, productId: string) =>
    axios.get<{ averageRating: number; totalCount: number }>(`${BASE_URL}/public/${slug}/products/${productId}/reviews`)
      .then(r => ({ averageRating: r.data.averageRating, totalCount: r.data.totalCount })),
};

export const API_BASE_URL = BASE_URL;
