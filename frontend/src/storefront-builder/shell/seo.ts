/**
 * Head management for the storefront (moved from the old PublicStorefrontPage):
 * store / page / product meta + Open Graph, canonical, sitemap link, JSON-LD,
 * favicon and the store's GA4 tag.
 */
import { useEffect } from 'react';
import { API_BASE_URL } from '../core/data/api';
import type { StoreInfo, StoreProduct } from '../core/types';

const MARK = 'data-storefront';

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.setAttribute(MARK, '1');
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel: string, href: string, type?: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (type) el.type = type;
    el.setAttribute(MARK, '1');
    document.head.appendChild(el);
  }
  el.href = href;
}

export interface HeadInfo {
  title: string;
  description: string;
  image?: string | null;
  type?: 'website' | 'product';
}

/** Sets title, description, OG/Twitter tags and canonical for the current view. */
export function applyHead(info: HeadInfo) {
  document.title = info.title;
  setMeta('meta[name="description"]', 'name', 'description', info.description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', info.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', info.description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href);
  setMeta('meta[property="og:type"]', 'property', 'og:type', info.type ?? 'website');
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', info.title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', info.description);
  if (info.image) {
    setMeta('meta[property="og:image"]', 'property', 'og:image', info.image);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', info.image);
  }
  setLink('canonical', window.location.origin + window.location.pathname);
}

export function storeHead(store: StoreInfo): HeadInfo {
  return {
    title: store.seoTitle || `${store.name} — Shop Online`,
    description: store.seoDescription || store.description || `Shop at ${store.name}.`,
    image: store.seoImage || store.bannerUrl || store.logoUrl,
  };
}

/** Store-level head + sitemap + keywords + Organization JSON-LD. Restores app defaults on unmount. */
export function useStoreHead(store: StoreInfo | undefined, slug: string) {
  useEffect(() => {
    if (!store?.name) return;
    if (store.seoKeywords) setMeta('meta[name="keywords"]', 'name', 'keywords', store.seoKeywords);
    setLink('sitemap', `${API_BASE_URL}/public/${slug}/sitemap.xml`, 'application/xml');

    const org: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'OnlineStore', name: store.name, url: window.location.origin };
    if (store.description) org.description = store.description;
    if (store.seoKeywords) org.keywords = store.seoKeywords;
    if (store.logoUrl) { org.logo = { '@type': 'ImageObject', url: store.logoUrl }; org.image = store.logoUrl; }
    if (store.whatsAppNumber) {
      org.contactPoint = { '@type': 'ContactPoint', telephone: `+${store.whatsAppNumber.replace(/\D/g, '')}`, contactType: 'customer service' };
    }
    const sameAs = [
      store.instagramHandle ? `https://www.instagram.com/${store.instagramHandle.replace('@', '')}` : null,
      store.facebookPageUrl ?? null,
    ].filter(Boolean);
    if (sameAs.length) org.sameAs = sameAs;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ld-json-org';
    script.textContent = JSON.stringify(org);
    document.head.appendChild(script);

    return () => {
      document.getElementById('ld-json-org')?.remove();
      document.head.querySelectorAll(`[${MARK}="1"]`).forEach(el => el.remove());
      document.title = 'Silarai';
    };
  }, [store?.name, store?.description, store?.logoUrl, store?.seoKeywords, store?.whatsAppNumber, store?.instagramHandle, store?.facebookPageUrl, slug]);
}

/** Product JSON-LD (with review stars when available). */
export function useProductJsonLd(product: StoreProduct | null, store: StoreInfo, rating: { averageRating: number; totalCount: number } | null) {
  useEffect(() => {
    if (!product) return;
    const url = window.location.origin + window.location.pathname;
    const outOfStock = product.isOutOfStock === true || (product.stockQuantity != null && product.stockQuantity <= 0);
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      url,
      brand: { '@type': 'Brand', name: store.name },
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: store.currency ?? 'INR',
        price: (product.discountedPrice ?? product.basePrice).toFixed(2),
        itemCondition: 'https://schema.org/NewCondition',
        availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      },
    };
    if (product.description) schema.description = product.description;
    if (product.allImages?.length) schema.image = product.allImages;
    else if (product.primaryImage) schema.image = product.primaryImage;
    if (product.categoryName) schema.category = product.categoryName;
    if (rating && rating.totalCount > 0 && rating.averageRating > 0) {
      schema.aggregateRating = { '@type': 'AggregateRating', ratingValue: rating.averageRating.toFixed(1), reviewCount: rating.totalCount, bestRating: '5', worstRating: '1' };
    }
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ld-json-product';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById('ld-json-product')?.remove(); };
  }, [product, store.name, store.currency, rating]);
}

/** Uses the store favicon (or logo, or the API monogram) for the browser tab. */
export function useFavicon(store: StoreInfo | undefined, slug: string) {
  useEffect(() => {
    if (!store) return;
    const href = store.faviconUrl || store.logoUrl || `${API_BASE_URL}/public/${slug}/favicon.svg`;
    const links = document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']");
    if (!links.length) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = href;
      document.head.appendChild(link);
      return () => link.remove();
    }
    const originals = Array.from(links, el => ({ el, href: el.href }));
    links.forEach(l => { l.href = href; });
    return () => originals.forEach(({ el, href: h }) => { el.href = h; });
  }, [store, slug]);
}

/** Injects the store's GA4 tag once. */
export function useGa4(measurementId: string | undefined) {
  useEffect(() => {
    if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId) || document.getElementById('gtag-script')) return;
    const s1 = document.createElement('script');
    s1.id = 'gtag-script';
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(s1);
    const s2 = document.createElement('script');
    s2.id = 'gtag-inline';
    s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`;
    document.head.appendChild(s2);
    return () => {
      document.getElementById('gtag-script')?.remove();
      document.getElementById('gtag-inline')?.remove();
    };
  }, [measurementId]);
}
