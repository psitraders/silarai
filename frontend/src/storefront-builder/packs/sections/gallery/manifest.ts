import type { PackManifest, SmartImage, SmartLink } from '../../../core/types';

export interface GallerySettings { eyebrow: string; heading: string; subtitle: string; columns: '2' | '3' | '4' }
export interface GalleryImageBlock { image: SmartImage; caption: string; link: SmartLink }
export const IMAGE_DEFAULTS: GalleryImageBlock = { image: { $image: '' }, caption: '', link: { $link: '' } };

const manifest: PackManifest<GallerySettings> = {
  kind: 'section',
  id: 'gallery',
  name: 'Image gallery',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', heading: 'Gallery', subtitle: '', columns: '3' },
  defaultLayout: 'grid',
  layouts: {
    grid: { name: 'Grid', load: () => import('./layouts/Grid') },
    masonry: { name: 'Masonry', load: () => import('./layouts/Masonry') },
    carousel: { name: 'Carousel', load: () => import('./layouts/Carousel') },
  },
};

export default manifest;
