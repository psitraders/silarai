import type { RenderContext } from '../../core/types';
import type { BuilderPageType } from '../api';

/** Store pages every store has (created on first save): Home and the two templates. */
export type SystemPageKey = 'home' | 'collection' | 'product';

export const SYSTEM_PAGES: Record<SystemPageKey, { pageType: BuilderPageType; title: string; subtitle: string; page: RenderContext['page']; path: (slug: string) => string }> = {
  home: { pageType: 'Home', title: 'Home', subtitle: 'Your storefront’s front page', page: 'home', path: slug => `/${slug}` },
  collection: { pageType: 'CollectionTemplate', title: 'Catalogue & categories', subtitle: 'All products, search and category pages', page: 'collection', path: slug => `/${slug}/products` },
  product: { pageType: 'ProductTemplate', title: 'Product page', subtitle: 'Every product’s page — and what the product popup shows', page: 'product', path: slug => `/${slug}/products/preview` },
};

export const SYSTEM_PAGE_KEYS = Object.keys(SYSTEM_PAGES) as SystemPageKey[];

export const isSystemPage = (key: string): key is SystemPageKey => key in SYSTEM_PAGES;
