import type { PackManifest, QuickviewProps } from '../../../core/types';

/**
 * Product popup (quick view), 15 layouts (catalogue §5.2). Content comes from the
 * product template's blocks, so the popup and the product page always match.
 * The store picks the layout in Style → Store behaviour.
 */
const manifest: PackManifest<Record<string, never>, QuickviewProps> = {
  kind: 'quickview',
  id: 'quickview',
  name: 'Product popup',
  version: 1,
  tier: 'free',
  defaults: {},
  defaultLayout: 'classic-split',
  layouts: {
    'classic-split': { name: 'Classic split', load: () => import('./layouts/ClassicSplit') },
    'wide-gallery': { name: 'Wide gallery', load: () => import('./layouts/WideGallery') },
    'thumb-rail': { name: 'Thumbnail rail', load: () => import('./layouts/ThumbRail') },
    'stacked-carousel': { name: 'Stacked carousel', load: () => import('./layouts/StackedCarousel') },
    'side-drawer': { name: 'Side drawer', load: () => import('./layouts/SideDrawer') },
    'bottom-sheet': { name: 'Bottom sheet', load: () => import('./layouts/BottomSheet') },
    'compact-quick-add': { name: 'Compact quick-add', load: () => import('./layouts/CompactQuickAdd') },
    immersive: { name: 'Full-screen immersive', load: () => import('./layouts/Immersive') },
    editorial: { name: 'Editorial', load: () => import('./layouts/Editorial') },
    'grid-gallery': { name: 'Grid gallery', load: () => import('./layouts/GridGallery') },
    tabbed: { name: 'Tabbed', load: () => import('./layouts/Tabbed') },
    'video-first': { name: 'Video first', load: () => import('./layouts/VideoFirst') },
    'menu-item': { name: 'Menu item', load: () => import('./layouts/MenuItem') },
    'spec-card': { name: 'Spec card', load: () => import('./layouts/SpecCard') },
    story: { name: 'Story', load: () => import('./layouts/Story') },
  },
};

export default manifest;
