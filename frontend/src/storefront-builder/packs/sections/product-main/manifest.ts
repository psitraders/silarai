import type { LayoutProps, PackManifest } from '../../../core/types';
import type { ImageRatio } from '../../../ui/product/Gallery';
import type { InfoMode } from '../../../ui/product/ProductInfo';

export interface ProductMainSettings {
  imageRatio: ImageRatio;
  /** Tap an image to open the full-screen viewer. */
  zoom: boolean;
  /** How long-form blocks show (tabbed / accordion layouts set their own). */
  infoStyle: InfoMode;
  stickyBar: boolean;
  breadcrumbs: boolean;
  /** Spec sheet: strip under the specs. */
  warranty: string;
  emi: string;
  /** Menu item / Shop the look: heading of the cross-sell row. */
  addOnsHeading: string;
}

export type ProductMainProps = LayoutProps<ProductMainSettings>;

/**
 * The product itself on the product page (and the source of the popup's blocks):
 * gallery + product blocks in one of 15 layouts (catalogue §5.3).
 */
const manifest: PackManifest<ProductMainSettings> = {
  kind: 'section',
  id: 'product-main',
  name: 'Product details',
  version: 1,
  tier: 'free',
  defaults: {
    imageRatio: 'portrait',
    zoom: true,
    infoStyle: 'plain',
    stickyBar: true,
    breadcrumbs: true,
    warranty: '1-year warranty',
    emi: 'No-cost EMI on cards',
    addOnsHeading: 'Goes well with',
  },
  defaultLayout: 'classic',
  layouts: {
    classic: { name: 'Classic two-column', load: () => import('./layouts/Classic') },
    'thumb-rail': { name: 'Thumbnail rail', load: () => import('./layouts/ThumbRail') },
    'stacked-sticky': { name: 'Stacked + sticky info', load: () => import('./layouts/StackedSticky') },
    'grid-sticky': { name: 'Grid + sticky info', load: () => import('./layouts/GridSticky') },
    'hero-slider': { name: 'Hero slider', load: () => import('./layouts/HeroSlider') },
    mirrored: { name: 'Mirrored', load: () => import('./layouts/Mirrored') },
    'centered-minimal': { name: 'Centred minimal', load: () => import('./layouts/CenteredMinimal') },
    'split-screen': { name: 'Split screen', load: () => import('./layouts/SplitScreen') },
    'bento-gallery': { name: 'Bento gallery', load: () => import('./layouts/BentoGallery') },
    'editorial-story': { name: 'Editorial story', load: () => import('./layouts/EditorialStory') },
    tabbed: { name: 'Tabbed', load: () => import('./layouts/Tabbed') },
    accordion: { name: 'Accordion', load: () => import('./layouts/Accordion') },
    'spec-sheet': { name: 'Spec sheet', load: () => import('./layouts/SpecSheet') },
    'menu-item': { name: 'Menu item', load: () => import('./layouts/MenuItem') },
    'shop-the-look': { name: 'Shop the look', load: () => import('./layouts/ShopTheLook') },
  },
};

export default manifest;
