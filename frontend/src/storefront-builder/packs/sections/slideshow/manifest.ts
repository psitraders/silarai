import type { PackManifest, SmartImage, SmartLink } from '../../../core/types';

export interface SlideshowSettings { autoplay: boolean; interval: number; height: 'compact' | 'regular' | 'tall' }
export interface SlideBlock { image: SmartImage; eyebrow: string; heading: string; text: string; buttonLabel: string; buttonLink: SmartLink; align: 'left' | 'center' }
export const SLIDE_DEFAULTS: SlideBlock = { image: { $image: '' }, eyebrow: '', heading: 'Slide heading', text: '', buttonLabel: 'Shop now', buttonLink: { $link: '/products' }, align: 'left' };

const manifest: PackManifest<SlideshowSettings> = {
  kind: 'section',
  id: 'slideshow',
  name: 'Slideshow',
  version: 1,
  tier: 'free',
  defaults: { autoplay: true, interval: 6, height: 'regular' },
  defaultLayout: 'full',
  layouts: {
    full: { name: 'Full width', load: () => import('./layouts/Full') },
    contained: { name: 'Contained', load: () => import('./layouts/Contained') },
  },
};

export default manifest;
