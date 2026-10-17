/**
 * Noor — luxury jewellery, premium ethnic wear and gifting (catalogue §10.1).
 * Only this manifest is loaded up front; the documents live in ./build (own chunk).
 */
import type { TemplateManifest } from '../../core/types';

const noor: TemplateManifest = {
  id: 'noor',
  name: 'Noor',
  description: 'Quiet luxury for jewellery, premium ethnic wear and gifting.',
  tier: 'free',
  mood: 'Quiet luxury — lots of space, fine gold details, standalone product pages',
  shopTypes: ['jewellery', 'fashion', 'beauty'],
  palettes: ['luxe-gold', 'ivory-gold'],
  fontPair: 'luxury-serif',
  styleKit: 'luxe',
  load: () => import('./build'),
};

export default noor;
