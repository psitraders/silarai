/**
 * Crumb — bakeries, cafés, home chefs, sweets and cloud kitchens (catalogue §10.3).
 * Only this manifest is loaded up front; the documents live in ./build (own chunk).
 */
import type { TemplateManifest } from '../../core/types';

const crumb: TemplateManifest = {
  id: 'crumb',
  name: 'Crumb',
  description: 'Warm and appetising for bakeries, cafés, home chefs and sweet shops.',
  tier: 'free',
  mood: 'Warm and homely — menu board, today’s bake, custom cake requests',
  shopTypes: ['food'],
  palettes: ['caramel', 'terracotta'],
  fontPair: 'bakery-sc',
  styleKit: 'soft',
  load: () => import('./build'),
};

export default crumb;
