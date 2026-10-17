import type { PackManifest, SmartImage } from '../../../../core/types';

export interface ConciergeSettings {
  eyebrow: string;
  heading: string;
  text: string;
  buttonLabel: string;
  /** Pre-filled WhatsApp message. */
  message: string;
  /** e.g. "Mon – Sat, 11 am – 7 pm". */
  hours: string;
  image: SmartImage;
}

/** Noor signature widget: book a personal WhatsApp video call with the store. */
const manifest: PackManifest<ConciergeSettings> = {
  kind: 'section',
  id: 'concierge',
  name: 'Concierge',
  version: 1,
  tier: 'free',
  template: 'noor',
  defaults: {
    eyebrow: 'Personal shopping',
    heading: 'See it live before you buy',
    text: 'Book a video call on WhatsApp. We’ll show you each piece up close, in natural light, and help you choose.',
    buttonLabel: 'Book a video call',
    message: 'Hi! I’d like to book a video call to see some pieces.',
    hours: '',
    image: { $image: '' },
  },
  defaultLayout: 'card',
  layouts: {
    card: { name: 'Card with photo', load: () => import('./layouts/Card') },
    banner: { name: 'Banner', load: () => import('./layouts/Banner') },
  },
};

export default manifest;
