import type { PackManifest, SmartImage, SmartLink } from '../../../core/types';

export interface HeroSettings {
  eyebrow: string;
  /** Empty = the store name. */
  heading: string;
  /** Empty = the store description. */
  subheading: string;
  image: SmartImage;
  image2: SmartImage;
  image3: SmartImage;
  primaryLabel: string;
  primaryLink: SmartLink;
  secondaryLabel: string;
  secondaryLink: SmartLink;
  showWhatsApp: boolean;
  showHighlights: boolean;
  height: 'compact' | 'regular' | 'tall';
}

const manifest: PackManifest<HeroSettings> = {
  kind: 'section',
  id: 'hero',
  name: 'Hero banner',
  version: 1,
  tier: 'free',
  defaults: {
    eyebrow: '',
    heading: '',
    subheading: '',
    image: { $image: '' },
    image2: { $image: '' },
    image3: { $image: '' },
    primaryLabel: 'Shop now',
    primaryLink: { $link: '#all-products' },
    secondaryLabel: '',
    secondaryLink: { $link: '' },
    showWhatsApp: true,
    showHighlights: true,
    height: 'regular',
  },
  defaultLayout: 'centered',
  layouts: {
    centered: { name: 'Centered', load: () => import('./layouts/Centered') },
    'full-bleed': { name: 'Full-bleed image', load: () => import('./layouts/FullBleed') },
    'split-right': { name: 'Image right', load: () => import('./layouts/SplitRight') },
    'split-left': { name: 'Image left', load: () => import('./layouts/SplitLeft') },
    'bold-text': { name: 'Bold text', load: () => import('./layouts/BoldText') },
    collage: { name: 'Collage', load: () => import('./layouts/Collage') },
  },
};

export default manifest;
