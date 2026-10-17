import type { PackManifest, Settings, SmartLink } from '../../../core/types';

export interface HeaderSettings {
  announcements: string[];
  announcementStyle: 'static' | 'marquee' | 'rotating';
  announcementLink: SmartLink;
  /** Two-tier layout: small text in the utility bar (delivery info, phone…). */
  utilityText: string;
  sticky: 'always' | 'scroll-up' | 'off';
  search: 'icon' | 'bar' | 'off';
  mobileMenu: 'drawer-left' | 'drawer-right' | 'fullscreen';
  logoSize: 'small' | 'medium' | 'large';
  cartIcon: 'bag' | 'cart' | 'basket';
  showAccount: boolean;
  showWhatsApp: boolean;
  /** Without a custom menu: add featured categories (with sub-category dropdowns) to the menu. */
  featuredCategoriesInMenu: boolean;
}

const manifest: PackManifest<HeaderSettings> = {
  kind: 'header',
  id: 'header',
  name: 'Header',
  version: 2,
  tier: 'free',
  defaults: {
    announcements: [],
    announcementStyle: 'marquee',
    announcementLink: { $link: '' },
    utilityText: '',
    sticky: 'always',
    search: 'icon',
    mobileMenu: 'drawer-left',
    logoSize: 'medium',
    cartIcon: 'bag',
    showAccount: true,
    showWhatsApp: true,
    featuredCategoriesInMenu: true,
  },
  defaultLayout: 'classic',
  layouts: {
    classic: { name: 'Classic', load: () => import('./layouts/Classic') },
    'logo-left-menu-right': { name: 'Menu right', load: () => import('./layouts/MenuRight') },
    'centered-logo': { name: 'Centred logo', load: () => import('./layouts/CenteredLogo') },
    'stacked-centered': { name: 'Stacked', load: () => import('./layouts/Stacked') },
    'split-menu': { name: 'Split menu', load: () => import('./layouts/SplitMenu') },
    'minimal-drawer': { name: 'Minimal', load: () => import('./layouts/MinimalDrawer') },
    'search-first': { name: 'Search first', load: () => import('./layouts/SearchFirst') },
    'two-tier': { name: 'Two-tier', load: () => import('./layouts/TwoTier') },
    'mega-menu': { name: 'Mega menu', load: () => import('./layouts/MegaMenu') },
    'category-rail': { name: 'Category rail', load: () => import('./layouts/CategoryRail') },
    transparent: { name: 'Transparent', placement: 'overlay', load: () => import('./layouts/Transparent') },
    sidebar: { name: 'Sidebar', placement: 'sidebar', load: () => import('./layouts/Sidebar') },
    'floating-pill': { name: 'Floating pill', load: () => import('./layouts/FloatingPill') },
  },
  /** v1 → v2: single announcement text → list; boolean sticky / showSearch → modes. */
  upgrade: (s: Settings, from: number) => {
    if (from >= 2) return s;
    // Only rewrite the v1 keys that are present (unversioned v2 data passes through unchanged).
    const { announcement, sticky, showSearch, ...rest } = s as Settings & { announcement?: unknown; sticky?: unknown; showSearch?: unknown };
    const out: Settings = { ...rest };
    if (typeof announcement === 'string') out.announcements = announcement.trim() ? [announcement] : [];
    if (typeof sticky === 'boolean') out.sticky = sticky ? 'always' : 'off';
    else if (sticky !== undefined) out.sticky = sticky;
    if (typeof showSearch === 'boolean') out.search = showSearch ? 'icon' : 'off';
    return out;
  },
};

export default manifest;
