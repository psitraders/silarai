import type { PackEditorMeta, ThumbRect } from '../../../core/types';

const card = (img: ThumbRect, rest: ThumbRect[]): ThumbRect[] => [img, ...rest];

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  description: 'How products look in every product section.',
  fields: [],
  layouts: {
    standard: { description: 'Image, title, price, add button', thumb: card([30, 2, 40, 34, 'i'], [[30, 2, 40, 60, 'c'], [33, 40, 30, 3, 't'], [33, 46, 18, 4, 'h'], [33, 53, 34, 6, 'b']]) },
    minimal: { description: 'Image, title and price only', thumb: card([30, 2, 40, 44, 'i'], [[30, 50, 30, 3, 't'], [30, 56, 16, 4, 'h']]) },
    overlay: { description: 'Info and button over the image', thumb: card([30, 2, 40, 60, 'i'], [[33, 46, 24, 3, 'm'], [33, 52, 14, 4, 'm'], [60, 48, 7, 7, 'b']]) },
    bordered: { description: 'Framed card with padding', thumb: card([33, 5, 34, 32, 'i'], [[30, 2, 40, 60, 'c'], [34, 41, 28, 3, 't'], [34, 47, 16, 4, 'h'], [34, 54, 32, 5, 'c']]) },
    elevated: { description: 'Shadow card that lifts on hover', thumb: card([30, 2, 40, 34, 'i'], [[28, 0, 44, 64, 'm'], [33, 40, 30, 3, 't'], [33, 46, 18, 4, 'h'], [33, 53, 34, 6, 'b']]) },
    'list-row': { description: 'Horizontal row with a +/− stepper', thumb: card([10, 20, 18, 22, 'i'], [[6, 16, 88, 30, 'c'], [32, 23, 34, 3, 't'], [32, 30, 16, 4, 'h'], [72, 25, 18, 10, 'b']]) },
    editorial: { description: 'Tall portrait image, serif name, no button', thumb: card([32, 0, 36, 50, 'i'], [[36, 53, 28, 4, 'h'], [42, 59, 16, 3, 't']]) },
    compact: { description: 'Small dense tile for 3-column phone grids', thumb: card([6, 10, 26, 26, 'i'], [[37, 10, 26, 26, 'i'], [68, 10, 26, 26, 'i'], [6, 40, 22, 3, 't'], [37, 40, 22, 3, 't'], [68, 40, 22, 3, 't'], [24, 29, 6, 6, 'b'], [55, 29, 6, 6, 'b'], [86, 29, 6, 6, 'b']]) },
    'rounded-center': { description: 'Arch-shaped image, centred text', thumb: card([32, 2, 36, 38, 'i'], [[36, 44, 28, 3, 't'], [42, 50, 16, 4, 'h'], [38, 56, 24, 6, 'b']]) },
    tech: { description: 'Spec chips, price and add', thumb: card([30, 2, 40, 30, 'i'], [[30, 2, 40, 60, 'c'], [33, 35, 30, 3, 't'], [33, 41, 10, 4, 'm'], [45, 41, 10, 4, 'm'], [57, 41, 10, 4, 'm'], [33, 48, 18, 4, 'h'], [33, 54, 34, 6, 'b']]) },
  },
};

export default meta;
