import type { PackManifest } from '../../../core/types';

export interface AllProductsSettings {
  title: string;
  pageSize: number;
  showCategoryTabs: boolean;
  showFilters: boolean;
  showBreadcrumb: boolean;
  cardStyle: string;
  /** Desktop columns (2–6); phones use `mobileColumns`. */
  columns: number;
  mobileColumns: number;
  paging: 'pages' | 'load-more' | 'infinite';
  defaultSort: '' | 'price_asc' | 'price_desc' | 'newest';
  /** Filters offered in the filter panel / sidebar. */
  filterStock: boolean;
  filterSubcategories: boolean;
  /** Min / max price inputs (layouts with a filter panel or sidebar). */
  filterPrice: boolean;
}

/** The catalogue / category page: search, categories, sort, filters and paging, in 8 layouts (catalogue §7). */
const manifest: PackManifest<AllProductsSettings> = {
  kind: 'section',
  id: 'all-products',
  name: 'All products',
  version: 1,
  tier: 'free',
  defaults: {
    title: 'All products',
    pageSize: 36,
    showCategoryTabs: true,
    showFilters: true,
    showBreadcrumb: false,
    cardStyle: '',
    columns: 4,
    mobileColumns: 2,
    paging: 'pages',
    defaultSort: '',
    filterStock: true,
    filterSubcategories: true,
    filterPrice: true,
  },
  defaultLayout: 'grid-filters',
  layouts: {
    'grid-filters': { name: 'Top filters', load: () => import('./layouts/GridFilters') },
    'sidebar-filters': { name: 'Sidebar filters', load: () => import('./layouts/SidebarFilters') },
    list: { name: 'List', load: () => import('./layouts/List') },
    masonry: { name: 'Masonry', load: () => import('./layouts/Masonry') },
    'editorial-2col': { name: 'Editorial 2-column', load: () => import('./layouts/Editorial2Col') },
    'category-rows': { name: 'Category rows', load: () => import('./layouts/CategoryRows') },
    'banner-grid': { name: 'Banner + grid', load: () => import('./layouts/BannerGrid') },
    bento: { name: 'Bento', load: () => import('./layouts/Bento') },
  },
};

export default manifest;
