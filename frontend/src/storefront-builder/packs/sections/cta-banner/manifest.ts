import type { PackManifest, SmartImage, SmartLink } from '../../../core/types';

export interface CtaBannerSettings {
  eyebrow: string;
  heading: string;
  text: string;
  image: SmartImage;
  buttonLabel: string;
  buttonLink: SmartLink;
  secondaryLabel: string;
  secondaryLink: SmartLink;
}

const manifest: PackManifest<CtaBannerSettings> = {
  kind: 'section',
  id: 'cta-banner',
  name: 'Call to action',
  version: 1,
  tier: 'free',
  defaults: {
    eyebrow: '',
    heading: 'Free delivery on orders above ₹999',
    text: 'Stock up on your favourites and save.',
    image: { $image: '' },
    buttonLabel: 'Shop now',
    buttonLink: { $link: '/products' },
    secondaryLabel: '',
    secondaryLink: { $link: '' },
  },
  defaultLayout: 'solid',
  layouts: {
    solid: { name: 'Solid', load: () => import('./layouts/Solid') },
    gradient: { name: 'Gradient card', load: () => import('./layouts/Gradient') },
    image: { name: 'Image', load: () => import('./layouts/Image') },
    split: { name: 'Split', load: () => import('./layouts/Split') },
  },
};

export default manifest;
