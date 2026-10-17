/**
 * What every pack may read about the current store: slug, store info, the
 * effective site document (published or Starter), nav pages and URL helpers.
 * Provided by the shell; read through `useStorefront()`.
 */
import { createContext, useCallback, useContext } from 'react';
import { readLink } from './smart';
import type { NavPage, SiteDoc, StoreInfo, StoreProduct } from './types';

export interface StorefrontLinks {
  home: () => string;
  page: (pageSlug: string) => string;
  allProducts: () => string;
  category: (categoryName: string, subName?: string) => string;
  product: (p: Pick<StoreProduct, 'id' | 'slug'>) => string;
  orderConfirmation: (orderId: string) => string;
  /**
   * Merchant links (`$link`) are stored store-relative ("/products", "/p/about")
   * so they work on both /{slug} and custom domains; this adds the store base.
   */
  resolve: (href: string) => string;
}

export interface StorefrontContextValue {
  slug: string;
  isCustomDomain: boolean;
  store: StoreInfo;
  site: SiteDoc;
  /** Resolved primary colour (hex) — for third-party widgets that need a raw colour (e.g. Razorpay). */
  brandColor: string;
  /** Published site version — appended to page requests so publishes show at once. */
  version: number;
  /** True when the store has published at least once (otherwise the Starter design is shown). */
  isPublished: boolean;
  navPages: NavPage[];
  links: StorefrontLinks;
}

export const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function useStorefront(): StorefrontContextValue {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error('useStorefront() must be used inside the storefront shell');
  return ctx;
}

/** Category URL slug — must match the backend sitemap (lowercase, spaces → "-"). */
export const slugify = (name: string) => name.toLowerCase().trim().split(/\s+/).filter(Boolean).join('-');

export function buildLinks(slug: string, isCustomDomain: boolean): StorefrontLinks {
  const base = isCustomDomain ? '' : `/${slug}`;
  return {
    home: () => base || '/',
    page: pageSlug => `${base}/p/${pageSlug}`,
    allProducts: () => `${base}/products`,
    category: (name, sub) => `${base}/category/${slugify(name)}${sub ? `?sub=${slugify(sub)}` : ''}`,
    product: p => `${base}/products/${p.slug || p.id}`,
    orderConfirmation: orderId => `${base}/order-confirmation/${orderId}`,
    resolve: href => (href.startsWith('/') && !href.startsWith('//') ? (href === '/' ? base || '/' : `${base}${href}`) : href),
  };
}

/** Reads a `$link` smart value and resolves store-relative paths for this store. */
export function useLinkReader(): (value: unknown) => string | undefined {
  const { links } = useStorefront();
  return useCallback((value: unknown) => {
    const raw = readLink(value);
    return raw === undefined ? undefined : links.resolve(raw);
  }, [links]);
}
