import type { PackEditorMeta } from '../../../core/types';
import { PHOTO_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  description: 'Brand, links, contact, payments and policies. Shared by every page.',
  fields: [
    { key: 'about', label: 'About text', type: 'textarea', helper: 'Leave empty to use your store description.', group: 'Content' },
    { key: 'madeIn', label: 'Badge line', type: 'text', placeholder: 'e.g. Made with love in Jaipur', group: 'Content' },
    { key: 'copyright', label: 'Copyright text', type: 'text', helper: 'Leave empty for "© year Store name".', group: 'Content' },
    { key: 'showTrustStrip', label: 'Show trust strip', type: 'toggle', group: 'Show' },
    { key: 'showCategories', label: 'List categories (default menu)', type: 'toggle', group: 'Show' },
    { key: 'showReturnPolicy', label: 'Show return policy link', type: 'toggle', group: 'Show' },
    { key: 'showSocial', label: 'Show social icons', type: 'toggle', group: 'Show' },
    { key: 'showPayments', label: 'Show payment methods', type: 'toggle', group: 'Show' },
    { key: 'newsletterHeading', label: 'Updates heading', type: 'text', helper: 'Newsletter-band layout.', group: 'Updates' },
    { key: 'newsletterText', label: 'Updates text', type: 'textarea', group: 'Updates' },
    { key: 'contactAddress', label: 'Address', type: 'textarea', group: 'Contact' },
    { key: 'contactPhone', label: 'Phone', type: 'text', group: 'Contact' },
    { key: 'contactEmail', label: 'Email', type: 'text', group: 'Contact' },
    { key: 'contactHours', label: 'Opening hours', type: 'list', group: 'Contact' },
  ],
  blocks: {
    label: 'Photo strip',
    max: 8,
    types: [{
      type: 'photo', name: 'Photo', defaults: { ...PHOTO_DEFAULTS },
      fields: [{ key: 'image', label: 'Photo', type: 'image' }, { key: 'link', label: 'Link', type: 'link' }],
    }],
  },
  layouts: {
    columns: { description: 'Brand + link columns (accordions on phones)', thumb: [[6, 10, 24, 6, 'h'], [6, 20, 24, 3, 't'], [6, 25, 20, 3, 't'], [40, 10, 14, 4, 'h'], [40, 18, 14, 3, 't'], [40, 23, 14, 3, 't'], [60, 10, 14, 4, 'h'], [60, 18, 14, 3, 't'], [80, 10, 14, 4, 'h'], [80, 18, 14, 3, 't'], [0, 50, 100, 8, 'm']] },
    'simple-centered': { description: 'Logo, a row of links, social icons, copyright', thumb: [[42, 8, 16, 8, 'h'], [20, 24, 12, 3, 't'], [36, 24, 12, 3, 't'], [52, 24, 12, 3, 't'], [68, 24, 12, 3, 't'], [40, 34, 5, 5, 'b'], [48, 34, 5, 5, 'b'], [56, 34, 5, 5, 'b'], [30, 50, 40, 3, 't']] },
    'newsletter-band': { description: 'Big WhatsApp updates band above the columns', thumb: [[0, 4, 100, 20, 'm'], [6, 9, 40, 5, 'h'], [70, 9, 24, 8, 'b'], [6, 32, 20, 4, 'h'], [36, 32, 14, 3, 't'], [56, 32, 14, 3, 't'], [76, 32, 14, 3, 't'], [0, 54, 100, 6, 'm']] },
    'minimal-line': { description: 'One line: © · links · social', thumb: [[6, 30, 24, 3, 't'], [40, 30, 10, 3, 't'], [54, 30, 10, 3, 't'], [80, 29, 4, 4, 'b'], [87, 29, 4, 4, 'b']] },
    'big-wordmark': { description: 'Your name huge across the bottom', thumb: [[6, 8, 14, 3, 't'], [26, 8, 14, 3, 't'], [46, 8, 14, 3, 't'], [6, 26, 88, 26, 'h']] },
    'split-story': { description: 'Brand story on the left, links on the right', thumb: [[6, 8, 40, 6, 'h'], [6, 18, 40, 3, 't'], [6, 24, 34, 3, 't'], [6, 30, 38, 3, 't'], [58, 8, 14, 4, 'h'], [58, 16, 14, 3, 't'], [78, 8, 14, 4, 'h'], [78, 16, 14, 3, 't']] },
    'contact-card': { description: 'Address, hours, phone and directions in a card', thumb: [[6, 8, 40, 44, 'c'], [10, 14, 24, 5, 'h'], [10, 24, 30, 3, 't'], [10, 30, 26, 3, 't'], [10, 40, 18, 6, 'b'], [56, 10, 14, 4, 'h'], [56, 18, 14, 3, 't'], [76, 10, 14, 4, 'h'], [76, 18, 14, 3, 't']] },
    mega: { description: 'All categories, pages, trust badges and payments', thumb: [[0, 2, 100, 8, 'm'], [6, 16, 12, 3, 'h'], [6, 21, 12, 3, 't'], [6, 26, 12, 3, 't'], [24, 16, 12, 3, 'h'], [24, 21, 12, 3, 't'], [42, 16, 12, 3, 'h'], [42, 21, 12, 3, 't'], [60, 16, 12, 3, 'h'], [60, 21, 12, 3, 't'], [78, 16, 12, 3, 'h'], [78, 21, 12, 3, 't'], [6, 44, 50, 5, 'c'], [0, 56, 100, 6, 'm']] },
    'instagram-strip': { description: 'A row of photos above a simple footer', thumb: [[0, 4, 16, 16, 'i'], [17, 4, 16, 16, 'i'], [34, 4, 16, 16, 'i'], [51, 4, 16, 16, 'i'], [68, 4, 16, 16, 'i'], [85, 4, 15, 16, 'i'], [42, 30, 16, 6, 'h'], [30, 42, 40, 3, 't']] },
    'app-like': { description: 'Compact, tap-to-open sections for phones', thumb: [[6, 6, 88, 9, 'c'], [6, 17, 88, 9, 'c'], [6, 28, 88, 9, 'c'], [36, 44, 28, 4, 't']] },
  },
};

export default meta;
