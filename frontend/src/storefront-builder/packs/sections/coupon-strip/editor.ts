import type { PackEditorMeta } from '../../../core/types';
import { COUPON_DEFAULTS } from './manifest';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  group: 'Conversion',
  description: 'Coupon codes shoppers can copy — live from your coupons. Expired ones hide themselves.',
  keywords: ['coupon', 'offer', 'discount', 'promo code', 'deal'],
  fields: [
    { key: 'eyebrow', label: 'Small heading', type: 'text' },
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'source', label: 'Coupons shown', type: 'select',
      options: [{ value: 'store', label: 'My coupons marked “Show on storefront”' }, { value: 'manual', label: 'Codes I type here' }],
      helper: 'Live coupons update by themselves when you change them under Coupons. Typed codes below are used only with “Codes I type here”.',
    },
  ],
  blocks: {
    label: 'Typed codes',
    max: 8,
    types: [{
      type: 'coupon', name: 'Coupon', defaults: { ...COUPON_DEFAULTS },
      fields: [
        { key: 'code', label: 'Code', type: 'text', helper: 'Must match a coupon you created under Coupons.' },
        { key: 'text', label: 'Offer text', type: 'text', placeholder: '10% off above ₹999' },
        { key: 'endsAt', label: 'Hide after', type: 'date', helper: 'Optional.' },
      ],
    }],
  },
  presets: [
    { id: 'strip', name: 'Offer strip', description: 'Your live coupons in a slim band', layout: 'strip', scheme: 'soft', settings: { source: 'store' }, blocks: [] },
    { id: 'tickets', name: 'Coupon tickets', description: 'Your live coupons as ticket cards', layout: 'tickets', settings: { source: 'store' }, blocks: [] },
    { id: 'typed', name: 'Typed codes', description: 'Codes and offer text you type yourself', layout: 'strip', scheme: 'soft', settings: { source: 'manual' }, blocks: [{ type: 'coupon', settings: { code: 'WELCOME10', text: '10% off your first order' } }, { type: 'coupon', settings: { code: 'FREESHIP', text: 'Free delivery above ₹999' } }] },
  ],
  layouts: {
    strip: { description: 'Slim band of copyable codes', thumb: [[0, 22, 100, 20, 'm'], [6, 29, 16, 5, 'h'], [26, 27, 22, 9, 'c'], [52, 27, 22, 9, 'c'], [78, 27, 18, 9, 'c']] },
    tickets: { description: 'Ticket cards with a copy button', thumb: [[6, 6, 40, 5, 'h'], [6, 18, 42, 26, 'c'], [6, 18, 12, 26, 'b'], [52, 18, 42, 26, 'c'], [52, 18, 12, 26, 'b'], [22, 24, 22, 4, 'h'], [68, 24, 22, 4, 'h'], [22, 34, 14, 5, 'm'], [68, 34, 14, 5, 'm']] },
  },
};

export default meta;
