import type { PackManifest, SmartImage } from '../../../../core/types';

export interface CustomCakeSettings {
  eyebrow: string;
  heading: string;
  text: string;
  image: SmartImage;
  /** Choices for the occasion field (one per line in the editor list). */
  occasions: string[];
  /** Choices for size / servings. */
  sizes: string[];
  askFlavour: boolean;
  buttonLabel: string;
  successText: string;
}

/**
 * Crumb signature widget: a custom cake request form. It sends a normal store inquiry (it
 * shows up as a lead) with the occasion, date, size and flavour above the message.
 */
const manifest: PackManifest<CustomCakeSettings> = {
  kind: 'section',
  id: 'custom-cake-request',
  name: 'Custom cake request',
  version: 1,
  tier: 'free',
  template: 'crumb',
  defaults: {
    eyebrow: 'Made for your day',
    heading: 'Request a custom cake',
    text: 'Tell us about your celebration — we’ll reply with design ideas and a price.',
    image: { $image: '' },
    occasions: ['Birthday', 'Anniversary', 'Wedding', 'Baby shower', 'Other'],
    sizes: ['0.5 kg', '1 kg', '2 kg', '3 kg or more'],
    askFlavour: true,
    buttonLabel: 'Send request',
    successText: 'Thank you! We’ll get back to you shortly.',
  },
  defaultLayout: 'split',
  layouts: {
    split: { name: 'Photo + form', load: () => import('./layouts/Split') },
  },
};

export default manifest;
