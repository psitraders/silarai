import type { PackEditorMeta, ThumbRect } from '../../../core/types';
import { CARD_STYLE_FIELD } from '../../../ui/cardStyles';

const tiles = (y: number, h: number, xs: number[], w: number): ThumbRect[] => xs.map(x => [x, y, w, h, 'c']);

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Products',
  description: 'Your full catalogue with search, categories, sorting, filters and paging.',
  keywords: ['catalogue', 'shop', 'all', 'search', 'filters', 'collection', 'category page'],
  fields: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'showBreadcrumb', label: 'Show breadcrumb', type: 'toggle' },
    { key: 'showCategoryTabs', label: 'Show category tabs', type: 'toggle', helper: 'Not used by the Sidebar and Category rows layouts.' },
    { key: 'columns', label: 'Columns on wide screens', type: 'select', group: 'Grid', options: [2, 3, 4, 5, 6].map(n => ({ value: String(n), label: String(n) })) },
    { key: 'mobileColumns', label: 'Columns on phones', type: 'select', group: 'Grid', options: [1, 2, 3].map(n => ({ value: String(n), label: String(n) })) },
    { key: 'pageSize', label: 'Products per page', type: 'number', min: 12, max: 60, group: 'Grid' },
    {
      key: 'paging', label: 'Paging', type: 'select', group: 'Grid',
      options: [{ value: 'pages', label: 'Page numbers' }, { value: 'load-more', label: '"Load more" button' }, { value: 'infinite', label: 'Infinite scroll' }],
    },
    CARD_STYLE_FIELD,
    { key: 'showFilters', label: 'Show sort & filters', type: 'toggle', group: 'Sort & filters' },
    {
      key: 'defaultSort', label: 'Default sort', type: 'select', group: 'Sort & filters',
      options: [{ value: '', label: 'Featured' }, { value: 'newest', label: 'Newest' }, { value: 'price_asc', label: 'Price: low to high' }, { value: 'price_desc', label: 'Price: high to low' }],
    },
    { key: 'filterStock', label: 'Availability filter', type: 'toggle', group: 'Sort & filters' },
    { key: 'filterSubcategories', label: 'Sub-category filter', type: 'toggle', group: 'Sort & filters' },
    { key: 'filterPrice', label: 'Price filter', type: 'toggle', group: 'Sort & filters', helper: 'Shown in the Top filters, Sidebar filters and Bento layouts.' },
  ],
  presets: [
    { id: 'catalogue', name: 'Full catalogue', description: 'Category tabs, sort and filters', layout: 'grid-filters' },
    { id: 'sidebar', name: 'Shop with sidebar', description: 'Filters on the left', layout: 'sidebar-filters', settings: { columns: 3 } },
  ],
  layouts: {
    'grid-filters': { description: 'Category tabs, sort and filter bar above the grid', thumb: [[6, 4, 12, 4, 'b'], [20, 4, 12, 4, 'm'], [34, 4, 12, 4, 'm'], [6, 12, 88, 5, 'm'], ...tiles(22, 18, [6, 29, 52, 75], 20), ...tiles(43, 18, [6, 29, 52, 75], 20)] },
    'sidebar-filters': { description: 'Filters in a left sidebar + grid', thumb: [[6, 6, 22, 52, 'm'], [9, 10, 14, 3, 't'], [9, 16, 12, 3, 't'], [9, 22, 14, 3, 't'], ...tiles(6, 24, [32, 53, 74], 19), ...tiles(34, 24, [32, 53, 74], 19)] },
    list: { description: 'Rows with a +/− stepper (grocery)', thumb: [[6, 6, 40, 5, 'h'], ...[16, 30, 44].flatMap((y): ThumbRect[] => [[6, y, 42, 11, 'c'], [52, y, 42, 11, 'c']])] },
    masonry: { description: 'Pinterest-style columns, uncropped photos', thumb: [[6, 4, 20, 28, 'i'], [6, 34, 20, 20, 'i'], [29, 4, 20, 18, 'i'], [29, 24, 20, 30, 'i'], [52, 4, 20, 32, 'i'], [52, 38, 20, 16, 'i'], [75, 4, 20, 22, 'i'], [75, 28, 20, 26, 'i']] },
    'editorial-2col': { description: 'Two large columns, lots of space (luxury)', thumb: [[6, 4, 40, 5, 'h'], [8, 14, 38, 40, 'i'], [54, 14, 38, 40, 'i'], [18, 57, 18, 3, 't'], [64, 57, 18, 3, 't']] },
    'category-rows': { description: 'One swipeable row per category', thumb: [[6, 4, 24, 4, 'h'], ...tiles(11, 16, [6, 29, 52, 75], 20), [6, 32, 24, 4, 'h'], ...tiles(39, 16, [6, 29, 52, 75], 20)] },
    'banner-grid': { description: 'Category banner, then the grid', thumb: [[6, 4, 88, 20, 'i'], [10, 14, 30, 5, 'h'], ...tiles(28, 15, [6, 29, 52, 75], 20), ...tiles(46, 15, [6, 29, 52, 75], 20)] },
    bento: { description: 'Big featured tile + regular grid', thumb: [[6, 6, 42, 52, 'i'], ...tiles(6, 25, [52, 74], 20), ...tiles(33, 25, [52, 74], 20)] },
  },
};

export default meta;
