import type { PackManifest } from '../../../../core/types';

export interface FreeDeliveryBarSettings {
  /** Order value for free delivery; 0 = the cart's setting (Style → Store behaviour). */
  threshold: number;
  /** "{amount}" is replaced by what's still missing. */
  progressText: string;
  doneText: string;
}

/**
 * Mandi signature widget: how far the shopper's cart is from free delivery. Display only —
 * delivery charges themselves are not changed (same as the cart's progress bar).
 */
const manifest: PackManifest<FreeDeliveryBarSettings> = {
  kind: 'section',
  id: 'free-delivery-bar',
  name: 'Free-delivery progress',
  version: 1,
  tier: 'free',
  template: 'mandi',
  defaults: { threshold: 0, progressText: 'Add {amount} more for free delivery', doneText: 'You’ve unlocked free delivery!' },
  defaultLayout: 'bar',
  layouts: {
    bar: { name: 'Progress bar', load: () => import('./layouts/Bar') },
  },
};

export default manifest;
