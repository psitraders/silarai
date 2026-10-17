import type { PackManifest, SmartImage, SmartLink, SmartRichText } from '../../../core/types';

export interface ImageWithTextSettings {
  eyebrow: string;
  heading: string;
  body: SmartRichText;
  image: SmartImage;
  imageRatio: 'square' | 'portrait' | 'landscape';
  buttonLabel: string;
  buttonLink: SmartLink;
}

const manifest: PackManifest<ImageWithTextSettings> = {
  kind: 'section',
  id: 'image-with-text',
  name: 'Image with text',
  version: 1,
  tier: 'free',
  defaults: {
    eyebrow: '',
    heading: 'Made with care',
    body: { $richtext: '<p>Share what makes your products special — the materials, the people and the care behind every order.</p>' },
    image: { $image: '' },
    imageRatio: 'portrait',
    buttonLabel: '',
    buttonLink: { $link: '' },
  },
  defaultLayout: 'image-left',
  layouts: {
    'image-left': { name: 'Image left', load: () => import('./layouts/ImageLeft') },
    'image-right': { name: 'Image right', load: () => import('./layouts/ImageRight') },
    overlap: { name: 'Overlap', load: () => import('./layouts/Overlap') },
    'full-bleed': { name: 'Full-bleed', load: () => import('./layouts/FullBleed') },
  },
};

export default manifest;
