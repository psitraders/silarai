import type { PackManifest } from '../../../core/types';

export interface NewsletterSettings {
  eyebrow: string;
  heading: string;
  text: string;
  buttonLabel: string;
  askName: boolean;
  /** Small print under the form. */
  note: string;
  successText: string;
}

/**
 * Email signup. Subscribers are saved as CRM Leads tagged "newsletter" (spec storefront-builder,
 * D12) — merchants find them under Leads and can reach them from campaigns.
 */
const manifest: PackManifest<NewsletterSettings> = {
  kind: 'section',
  id: 'newsletter',
  name: 'Newsletter',
  version: 1,
  tier: 'free',
  defaults: {
    eyebrow: 'Stay in the loop',
    heading: 'New arrivals and offers, first',
    text: 'Join our list for launches, restocks and members-only offers.',
    buttonLabel: 'Subscribe',
    askName: false,
    note: 'No spam. You can ask us to remove you anytime.',
    successText: 'You’re on the list — thank you!',
  },
  defaultLayout: 'band',
  layouts: {
    band: { name: 'Band', load: () => import('./layouts/Band') },
    card: { name: 'Card', load: () => import('./layouts/Card') },
  },
};

export default manifest;
