import type { PackManifest } from '../../../../core/types';

export interface WarrantyStripSettings { heading: string }
export interface AssuranceBlock { icon: string; title: string; detail: string }

export const ASSURANCE_DEFAULTS: AssuranceBlock = { icon: 'shield', title: 'Warranty', detail: 'As per the brand' };

/**
 * Volt signature widget: warranty, payment and support assurances. The merchant writes every
 * line — no EMI or warranty offer is claimed by default.
 */
const manifest: PackManifest<WarrantyStripSettings> = {
  kind: 'section',
  id: 'warranty-strip',
  name: 'Warranty & payment strip',
  version: 1,
  tier: 'free',
  template: 'volt',
  defaults: { heading: '' },
  defaultLayout: 'strip',
  layouts: {
    strip: { name: 'Strip', load: () => import('./layouts/Strip') },
  },
};

export default manifest;
