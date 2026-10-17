import type { PackManifest, SmartImage } from '../../../core/types';

export interface ContactInfoSettings {
  eyebrow: string;
  heading: string;
  text: string;
  address: string;
  phone: string;
  email: string;
  hours: string[];
  showWhatsApp: boolean;
  showDirections: boolean;
  image: SmartImage;
}

const manifest: PackManifest<ContactInfoSettings> = {
  kind: 'section',
  id: 'contact-info',
  name: 'Contact & hours',
  version: 1,
  tier: 'free',
  defaults: {
    eyebrow: '',
    heading: 'Get in touch',
    text: 'We usually reply within a few minutes during opening hours.',
    address: '',
    phone: '',
    email: '',
    hours: ['Mon – Sat: 10 am – 8 pm', 'Sunday: closed'],
    showWhatsApp: true,
    showDirections: true,
    image: { $image: '' },
  },
  defaultLayout: 'card',
  layouts: {
    card: { name: 'Card', load: () => import('./layouts/Card') },
    split: { name: 'Split', load: () => import('./layouts/Split') },
    columns: { name: 'Columns', load: () => import('./layouts/Columns') },
  },
};

export default manifest;
