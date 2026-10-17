import type { PackManifest } from '../../../../core/types';

export interface DeliverySlotsSettings { eyebrow: string; heading: string; areas: string; note: string }
export interface SlotBlock { label: string; time: string }

export const SLOT_DEFAULTS: SlotBlock = { label: 'Morning', time: '9 am – 12 pm' };

/** Crumb signature widget: delivery slots and areas, as the merchant describes them (display only). */
const manifest: PackManifest<DeliverySlotsSettings> = {
  kind: 'section',
  id: 'delivery-slots',
  name: 'Delivery slots & areas',
  version: 1,
  tier: 'free',
  template: 'crumb',
  defaults: { eyebrow: 'Delivery', heading: 'When and where we deliver', areas: '', note: '' },
  defaultLayout: 'card',
  layouts: {
    card: { name: 'Card', load: () => import('./layouts/Card') },
  },
};

export default manifest;
