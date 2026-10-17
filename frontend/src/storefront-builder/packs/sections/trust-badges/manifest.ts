import type { PackManifest } from '../../../core/types';

export type TrustIcon = 'truck' | 'shield' | 'whatsapp' | 'returns' | 'verified' | 'lock' | 'star' | 'gift';

export interface TrustItem { icon: TrustIcon; text: string }

export interface TrustBadgesSettings {
  items: TrustItem[];
  /** Hide the WhatsApp item when the store has no WhatsApp number. */
  hideWhatsAppWithoutNumber: boolean;
}

const manifest: PackManifest<TrustBadgesSettings> = {
  kind: 'section',
  id: 'trust-badges',
  name: 'Trust badges',
  version: 1,
  tier: 'free',
  defaults: {
    items: [
      { icon: 'truck', text: 'Fast delivery' },
      { icon: 'shield', text: 'Secure payments' },
      { icon: 'whatsapp', text: 'WhatsApp support' },
      { icon: 'returns', text: 'Easy returns' },
      { icon: 'verified', text: 'Trusted seller' },
    ],
    hideWhatsAppWithoutNumber: true,
  },
  defaultLayout: 'ribbon',
  layouts: {
    ribbon: { name: 'Ribbon', load: () => import('./layouts/Ribbon') },
    cards: { name: 'Cards', load: () => import('./layouts/Cards') },
    'icons-row': { name: 'Big icons', load: () => import('./layouts/IconsRow') },
  },
};

export default manifest;
