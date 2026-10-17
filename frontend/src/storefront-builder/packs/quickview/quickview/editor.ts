import type { PackEditorMeta, ThumbRect } from '../../../core/types';

const frame: ThumbRect = [6, 4, 88, 56, 'c'];
const lines = (x: number, y: number, w: number): ThumbRect[] => [[x, y, w * 0.8, 5, 'h'], [x, y + 8, w * 0.4, 4, 't'], [x, y + 16, w, 3, 't'], [x, y + 24, w, 6, 'b']];

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  description: 'How a product opens when a shopper taps it (popup mode).',
  fields: [],
  layouts: {
    'classic-split': { description: 'Image left, details right', thumb: [frame, [6, 4, 40, 56, 'i'], ...lines(52, 10, 36)] },
    'wide-gallery': { description: '60 / 40 split, thumbnail strip under the image', thumb: [frame, [8, 6, 50, 42, 'i'], [8, 50, 10, 8, 'm'], [20, 50, 10, 8, 'm'], [32, 50, 10, 8, 'm'], ...lines(64, 10, 26)] },
    'thumb-rail': { description: 'Vertical thumbnails · main image · details', thumb: [frame, [8, 8, 7, 7, 'm'], [8, 17, 7, 7, 'm'], [8, 26, 7, 7, 'm'], [17, 6, 36, 52, 'i'], ...lines(58, 10, 32)] },
    'stacked-carousel': { description: 'Swipe carousel on top, details below — narrow', thumb: [[30, 2, 40, 60, 'c'], [30, 2, 40, 30, 'i'], ...lines(34, 36, 32)] },
    'side-drawer': { description: 'Slides in from the right, full height', thumb: [[0, 0, 56, 64, 'm'], [56, 0, 44, 64, 'c'], [60, 4, 36, 24, 'i'], ...lines(60, 32, 34)] },
    'bottom-sheet': { description: 'Slides up from the bottom (mobile-native)', thumb: [[0, 0, 100, 24, 'm'], [4, 24, 92, 40, 'c'], [44, 26, 12, 2, 'm'], [8, 32, 28, 28, 'i'], ...lines(42, 34, 50)] },
    'compact-quick-add': { description: 'Small card: thumb, title, price, options, add', thumb: [[24, 8, 52, 48, 'c'], [28, 12, 14, 14, 'i'], [46, 14, 26, 4, 'h'], [46, 20, 14, 3, 't'], [28, 32, 10, 5, 'c'], [40, 32, 10, 5, 'c'], [52, 32, 10, 5, 'c'], [28, 44, 44, 7, 'b']] },
    immersive: { description: 'Full-screen photos with a floating details panel', thumb: [[0, 0, 100, 64, 'i'], [62, 6, 32, 52, 'c'], ...lines(65, 12, 26)] },
    editorial: { description: 'Large photo with the name over it, minimal details', thumb: [frame, [6, 4, 54, 56, 'i'], [10, 44, 40, 6, 'h'], [66, 14, 22, 4, 't'], [66, 22, 22, 5, 'c'], [66, 32, 22, 6, 'b']] },
    'grid-gallery': { description: '2 × 2 image grid + details', thumb: [frame, [8, 6, 22, 25, 'i'], [32, 6, 22, 25, 'i'], [8, 33, 22, 25, 'i'], [32, 33, 22, 25, 'i'], ...lines(60, 10, 30)] },
    tabbed: { description: 'Split, with Details · Specs · Reviews tabs', thumb: [frame, [6, 4, 40, 56, 'i'], [52, 8, 30, 5, 'h'], [52, 16, 14, 4, 't'], [52, 24, 36, 6, 'b'], [52, 34, 11, 4, 'b'], [64, 34, 11, 4, 'm'], [76, 34, 11, 4, 'm'], [52, 40, 36, 16, 'm']] },
    'video-first': { description: 'Video on top, details below', thumb: [[22, 2, 56, 60, 'c'], [22, 2, 56, 32, 'i'], [46, 13, 8, 10, 'b'], ...lines(26, 38, 46)] },
    'menu-item': { description: 'Round photo, option chips, add-ons', thumb: [[24, 2, 52, 60, 'c'], [40, 6, 20, 20, 'i'], [32, 30, 36, 4, 'h'], [32, 37, 10, 4, 'c'], [44, 37, 10, 4, 'c'], [56, 37, 10, 4, 'c'], [32, 45, 36, 6, 'b'], [32, 53, 36, 6, 'm']] },
    'spec-card': { description: 'Image + key spec chips + warranty / EMI strip', thumb: [frame, [8, 8, 36, 40, 'i'], [50, 8, 34, 5, 'h'], [50, 16, 14, 4, 't'], [50, 24, 12, 5, 'c'], [64, 24, 12, 5, 'c'], [78, 24, 12, 5, 'c'], [50, 34, 40, 5, 'm'], [50, 44, 40, 7, 'b']] },
    story: { description: 'Full-width photos one under another, sticky add bar', thumb: [[30, 2, 40, 60, 'c'], [30, 2, 40, 22, 'i'], [30, 25, 40, 22, 'i'], [30, 50, 40, 12, 'm'], [34, 53, 32, 6, 'b']] },
  },
};

export default meta;
