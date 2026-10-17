import type { PackManifest } from '../../../core/types';

export interface EnquiryFormSettings {
  eyebrow: string;
  heading: string;
  text: string;
  image: unknown;
  askEmail: boolean;
  messagePlaceholder: string;
  buttonLabel: string;
  successText: string;
}

/** A contact / custom-order form that sends a store inquiry (shows up as a lead for the merchant). */
const manifest: PackManifest<EnquiryFormSettings> = {
  kind: 'section',
  id: 'enquiry-form',
  name: 'Enquiry form',
  version: 1,
  tier: 'free',
  defaults: {
    eyebrow: 'Get in touch',
    heading: 'Have a question or a custom order?',
    text: 'Send us a message and we will get back to you on WhatsApp or email.',
    image: { $image: '' },
    askEmail: true,
    messagePlaceholder: 'Tell us what you are looking for…',
    buttonLabel: 'Send message',
    successText: 'Thank you! We will get back to you soon.',
  },
  defaultLayout: 'simple',
  layouts: {
    simple: { name: 'Simple', load: () => import('./layouts/Simple') },
    split: { name: 'Split image', load: () => import('./layouts/Split') },
  },
};

export default manifest;
