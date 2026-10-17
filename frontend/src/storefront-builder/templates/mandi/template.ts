/**
 * Mandi — grocery, organic, daily needs and kirana (catalogue §10.4).
 * Only this manifest is loaded up front; the documents live in ./build (own chunk).
 */
import type { TemplateManifest } from '../../core/types';

const mandi: TemplateManifest = {
  id: 'mandi',
  name: 'Mandi',
  description: 'Fresh, fast and app-like for grocery, organic and daily-needs stores.',
  tier: 'free',
  mood: 'Fresh and fast — dense rows, +/− quick add, bottom-sheet cart',
  shopTypes: ['grocery', 'food'],
  palettes: ['emerald-market', 'fresh-amber'],
  fontPair: 'ecom-clean',
  styleKit: 'minimal',
  load: () => import('./build'),
};

export default mandi;
