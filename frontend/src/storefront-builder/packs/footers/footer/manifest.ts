import type { PackManifest, SmartImage, SmartLink } from '../../../core/types';

export interface FooterSettings {
  /** Empty = the store description. */
  about: string;
  showTrustStrip: boolean;
  showCategories: boolean;
  showReturnPolicy: boolean;
  showSocial: boolean;
  showPayments: boolean;
  newsletterHeading: string;
  newsletterText: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactHours: string[];
  madeIn: string;
  /** Empty = "© year Store name". */
  copyright: string;
}

export interface FooterPhotoBlock { image: SmartImage; link: SmartLink }
export const PHOTO_DEFAULTS: FooterPhotoBlock = { image: { $image: '' }, link: { $link: '' } };

const manifest: PackManifest<FooterSettings> = {
  kind: 'footer',
  id: 'footer',
  name: 'Footer',
  version: 1,
  tier: 'free',
  defaults: {
    about: '',
    showTrustStrip: true,
    showCategories: true,
    showReturnPolicy: true,
    showSocial: true,
    showPayments: true,
    newsletterHeading: 'Get offers before anyone else',
    newsletterText: 'Join our WhatsApp updates — new arrivals and private sales, no spam.',
    contactAddress: '',
    contactPhone: '',
    contactEmail: '',
    contactHours: [],
    madeIn: '',
    copyright: '',
  },
  defaultLayout: 'columns',
  layouts: {
    columns: { name: 'Columns', load: () => import('./layouts/Columns') },
    'simple-centered': { name: 'Simple centred', load: () => import('./layouts/SimpleCentered') },
    'newsletter-band': { name: 'Updates band', load: () => import('./layouts/NewsletterBand') },
    'minimal-line': { name: 'Minimal line', load: () => import('./layouts/MinimalLine') },
    'big-wordmark': { name: 'Big wordmark', load: () => import('./layouts/BigWordmark') },
    'split-story': { name: 'Split story', load: () => import('./layouts/SplitStory') },
    'contact-card': { name: 'Contact card', load: () => import('./layouts/ContactCard') },
    mega: { name: 'Mega', load: () => import('./layouts/Mega') },
    'instagram-strip': { name: 'Photo strip', load: () => import('./layouts/PhotoStrip') },
    'app-like': { name: 'App-like', load: () => import('./layouts/AppLike') },
  },
};

export default manifest;
