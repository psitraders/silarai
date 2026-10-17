import type { PackManifest, SmartImage, SmartProducts } from '../../../../core/types';

export interface LookbookSettings { eyebrow: string; heading: string }
export interface StoryBlock { title: string; image: SmartImage; products: SmartProducts }

export const STORY_DEFAULTS: StoryBlock = { title: 'New look', image: { $image: '' }, products: { $products: { source: 'manual', productIds: [], limit: 4 } } };

/** Bloom signature widget: tap-through lookbook stories, each with the products in the look. */
const manifest: PackManifest<LookbookSettings> = {
  kind: 'section',
  id: 'lookbook-stories',
  name: 'Lookbook stories',
  version: 1,
  tier: 'free',
  template: 'bloom',
  defaults: { eyebrow: '', heading: 'Lookbook' },
  defaultLayout: 'circles',
  layouts: {
    circles: { name: 'Story circles', load: () => import('./layouts/Circles') },
    cards: { name: 'Story cards', load: () => import('./layouts/Cards') },
  },
};

export default manifest;
