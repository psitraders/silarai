/**
 * Bloom — fashion, boutiques and beauty (catalogue §10.2).
 * Only this manifest is loaded up front; the documents live in ./build (own chunk).
 */
import type { TemplateManifest } from '../../core/types';

const bloom: TemplateManifest = {
  id: 'bloom',
  name: 'Bloom',
  description: 'Editorial and image-led for fashion, boutiques and beauty.',
  tier: 'free',
  mood: 'Editorial and trendy — big photos, lookbook stories, shoppable posts',
  shopTypes: ['fashion', 'beauty'],
  palettes: ['rose-gold', 'blossom'],
  fontPair: 'classic-elegant',
  styleKit: 'editorial',
  load: () => import('./build'),
};

export default bloom;
