import type { PackManifest } from '../../../core/types';

export interface WhatsAppCtaSettings {
  badge: string;
  heading: string;
  /** Empty = a default line using the store name. */
  body: string;
  buttonLabel: string;
  message: string;
  points: string[];
}

const manifest: PackManifest<WhatsAppCtaSettings> = {
  kind: 'section',
  id: 'whatsapp-cta',
  name: 'WhatsApp call-to-action',
  version: 1,
  tier: 'free',
  defaults: {
    badge: 'Usually replies in minutes',
    heading: 'Need help choosing?',
    body: '',
    buttonLabel: 'Chat on WhatsApp',
    message: 'Hi! I need help choosing a product.',
    points: ['Fast replies', 'Custom orders welcome', 'No commitment'],
  },
  defaultLayout: 'banner',
  layouts: {
    banner: { name: 'Banner', load: () => import('./layouts/Banner') },
    card: { name: 'Card', load: () => import('./layouts/Card') },
  },
};

export default manifest;
