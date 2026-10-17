/**
 * Volt — electronics, gadgets, accessories and modern D2C (catalogue §10.5).
 * Only this manifest is loaded up front; the documents live in ./build (own chunk).
 */
import type { TemplateManifest } from '../../core/types';

const volt: TemplateManifest = {
  id: 'volt',
  name: 'Volt',
  description: 'Dark, sleek and techy for electronics, gadgets and modern D2C brands.',
  tier: 'free',
  mood: 'Dark and sleek — bento features, spec compare, product videos',
  shopTypes: ['electronics'],
  palettes: ['midnight', 'launch-blue'],
  fontPair: 'geometric',
  styleKit: 'bento',
  load: () => import('./build'),
};

export default volt;
