import type { PackManifest } from '../../../../core/types';

export interface CertificationSettings { heading: string }
export interface CertificationBlock { icon: string; title: string; detail: string }

export const CERTIFICATION_DEFAULTS: CertificationBlock = { icon: 'award', title: 'Certified', detail: '' };

/**
 * Noor signature widget: hallmark / certificate badges. Text is supplied by the merchant —
 * the store must actually hold the certifications it lists.
 */
const manifest: PackManifest<CertificationSettings> = {
  kind: 'section',
  id: 'certification-strip',
  name: 'Certification strip',
  version: 1,
  tier: 'free',
  template: 'noor',
  defaults: { heading: '' },
  defaultLayout: 'strip',
  layouts: {
    strip: { name: 'Strip', load: () => import('./layouts/Strip') },
    cards: { name: 'Cards', load: () => import('./layouts/Cards') },
  },
};

export default manifest;
