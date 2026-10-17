import type { PackManifest, SmartCategories, SmartImage } from '../../../../core/types';

export interface CollectionSpotlightSettings {
  eyebrow: string;
  /** Empty = the category's name. */
  heading: string;
  text: string;
  /** Empty = the category's photo. */
  image: SmartImage;
  /** The collection this band sells (first category of the rule). */
  category: SmartCategories;
  buttonLabel: string;
  height: 'regular' | 'tall';
}

/** Noor signature widget: one collection, full-bleed, with a fine accent rule. */
const manifest: PackManifest<CollectionSpotlightSettings> = {
  kind: 'section',
  id: 'collection-spotlight',
  name: 'Collection spotlight',
  version: 1,
  tier: 'free',
  template: 'noor',
  defaults: {
    eyebrow: 'The collection',
    heading: '',
    text: 'Handcrafted pieces, made to be treasured.',
    image: { $image: '' },
    category: { $categories: { source: 'featured', limit: 1 } },
    buttonLabel: 'Explore the collection',
    height: 'tall',
  },
  defaultLayout: 'full-bleed',
  layouts: {
    'full-bleed': { name: 'Full-bleed', load: () => import('./layouts/FullBleed') },
    framed: { name: 'Framed', load: () => import('./layouts/Framed') },
  },
};

export default manifest;
