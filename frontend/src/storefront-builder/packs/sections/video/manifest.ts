import type { PackManifest, SmartImage, SmartLink } from '../../../core/types';

export interface VideoSettings {
  eyebrow: string;
  heading: string;
  text: string;
  /** YouTube or Vimeo link. */
  url: string;
  poster: SmartImage;
  buttonLabel: string;
  buttonLink: SmartLink;
}

const manifest: PackManifest<VideoSettings> = {
  kind: 'section',
  id: 'video',
  name: 'Video',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', heading: '', text: '', url: '', poster: { $image: '' }, buttonLabel: '', buttonLink: { $link: '' } },
  defaultLayout: 'inline',
  layouts: {
    inline: { name: 'Contained', load: () => import('./layouts/Inline') },
    'full-width': { name: 'Full width', load: () => import('./layouts/FullWidth') },
    'with-text': { name: 'With text', load: () => import('./layouts/WithText') },
  },
};

export default manifest;
