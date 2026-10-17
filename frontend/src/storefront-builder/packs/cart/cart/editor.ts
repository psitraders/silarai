import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  description: 'Where the cart opens. Checkout, coupons and cash-on-delivery work the same in every style.',
  fields: [],
  layouts: {
    'drawer-right': { description: 'Slides in from the right', thumb: [[0, 0, 60, 64, 'm'], [60, 0, 40, 64, 'c'], [64, 6, 30, 4, 'h'], [64, 14, 32, 8, 'c'], [64, 24, 32, 8, 'c'], [64, 52, 32, 7, 'b']] },
    'drawer-left': { description: 'Slides in from the left', thumb: [[40, 0, 60, 64, 'm'], [0, 0, 40, 64, 'c'], [4, 6, 30, 4, 'h'], [4, 14, 32, 8, 'c'], [4, 24, 32, 8, 'c'], [4, 52, 32, 7, 'b']] },
    page: { description: 'Full-screen cart', thumb: [[0, 0, 100, 64, 'c'], [26, 6, 48, 4, 'h'], [26, 14, 48, 8, 'c'], [26, 24, 48, 8, 'c'], [26, 34, 48, 8, 'c'], [26, 52, 48, 7, 'b']] },
    popup: { description: 'Centred popup', thumb: [[0, 0, 100, 64, 'm'], [26, 6, 48, 52, 'c'], [30, 11, 30, 4, 'h'], [30, 19, 40, 8, 'c'], [30, 29, 40, 8, 'c'], [30, 46, 40, 7, 'b']] },
    'bottom-sheet': { description: 'Slides up from the bottom', thumb: [[0, 0, 100, 26, 'm'], [0, 24, 100, 40, 'c'], [44, 26, 12, 2, 'm'], [8, 32, 84, 8, 'c'], [8, 42, 84, 8, 'c'], [8, 54, 84, 7, 'b']] },
  },
};

export default meta;
