import type { StyleOptions } from '../../core/types';

type Opt<K extends keyof StyleOptions> = { value: StyleOptions[K]; label: string };
export interface StyleField<K extends keyof StyleOptions = keyof StyleOptions> {
  key: K;
  label: string;
  helper?: string;
  /** Omitted for on/off options. */
  options?: Opt<K>[];
}

const f = <K extends keyof StyleOptions>(key: K, label: string, options?: Opt<K>[], helper?: string): StyleField => ({ key, label, options, helper } as StyleField);

/** Every fine-tune option (catalogue §1.2) the theme engine applies, grouped for the Style panel. */
export const STYLE_GROUPS: { title: string; fields: StyleField[] }[] = [
  {
    title: 'Typography',
    fields: [
      f('headingScale', 'Heading size', [{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Regular' }, { value: 'large', label: 'Large' }, { value: 'huge', label: 'Huge' }]),
      f('headingWeight', 'Heading weight', [{ value: 'regular', label: 'Regular' }, { value: 'semibold', label: 'Semibold' }, { value: 'bold', label: 'Bold' }, { value: 'black', label: 'Black' }]),
      f('headingCase', 'Heading case', [{ value: 'normal', label: 'Normal' }, { value: 'upper', label: 'UPPER' }]),
      f('headingTracking', 'Letter spacing', [{ value: 'tight', label: 'Tight' }, { value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }]),
      f('bodySize', 'Body text size', [{ value: 15, label: '15 px' }, { value: 16, label: '16 px' }, { value: 17, label: '17 px' }]),
      f('linkStyle', 'Links', [{ value: 'color', label: 'Colour' }, { value: 'underline', label: 'Underline' }, { value: 'animated', label: 'Animated' }]),
    ],
  },
  {
    title: 'Buttons',
    fields: [
      f('buttonShape', 'Shape', [{ value: 'square', label: 'Square' }, { value: 'soft', label: 'Soft' }, { value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' }]),
      f('buttonStyle', 'Style', [{ value: 'filled', label: 'Filled' }, { value: 'outline', label: 'Outline' }, { value: 'soft', label: 'Soft tint' }, { value: 'gradient', label: 'Gradient' }, { value: 'hard-shadow', label: 'Hard shadow' }]),
      f('buttonSize', 'Size', [{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Regular' }, { value: 'large', label: 'Large' }]),
      f('buttonHover', 'Hover effect', [{ value: 'darken', label: 'Darken' }, { value: 'lift', label: 'Lift' }, { value: 'glow', label: 'Glow' }]),
      f('buttonCase', 'Text case', [{ value: 'normal', label: 'Normal' }, { value: 'upper', label: 'UPPER' }]),
    ],
  },
  {
    title: 'Corners & cards',
    fields: [
      f('corners', 'Corners', [{ value: 'sharp', label: 'Sharp' }, { value: 'subtle', label: 'Subtle' }, { value: 'soft', label: 'Soft' }, { value: 'round', label: 'Round' }]),
      f('imageCorners', 'Image corners', [{ value: 'sharp', label: 'Sharp' }, { value: 'subtle', label: 'Subtle' }, { value: 'soft', label: 'Soft' }, { value: 'round', label: 'Round' }]),
      f('shadowDepth', 'Shadows', [{ value: 'none', label: 'None' }, { value: 'soft', label: 'Soft' }, { value: 'strong', label: 'Strong' }, { value: 'hard', label: 'Hard' }]),
      f('cardStyle', 'Card style', [{ value: 'flat', label: 'Flat' }, { value: 'bordered', label: 'Bordered' }, { value: 'shadow', label: 'Shadow' }, { value: 'elevated', label: 'Elevated' }, { value: 'glass', label: 'Glass' }, { value: 'hard-shadow', label: 'Hard shadow' }]),
      f('cardPadding', 'Card padding', [{ value: 'tight', label: 'Tight' }, { value: 'normal', label: 'Normal' }, { value: 'roomy', label: 'Roomy' }]),
      f('cardHover', 'Card hover', [{ value: 'none', label: 'None' }, { value: 'lift', label: 'Lift' }, { value: 'zoom', label: 'Zoom' }, { value: 'border', label: 'Border' }]),
    ],
  },
  {
    title: 'Product cards',
    fields: [
      f('productImageRatio', 'Image shape', [{ value: 'square', label: 'Square' }, { value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }]),
      f('productTitleLines', 'Title lines', [{ value: 1, label: '1 line' }, { value: 2, label: '2 lines' }]),
      f('productSecondImage', 'Second photo on hover'),
      f('productQuickAdd', 'Add-to-cart button'),
      f('productWishlist', 'Wishlist heart'),
      f('productShowCategory', 'Show category name'),
      f('foodMarkers', 'Veg / eggless marks', undefined, 'From product tags “veg”, “non-veg” and “eggless”.'),
    ],
  },
  {
    title: 'Badges & prices',
    fields: [
      f('badgeShape', 'Badge shape', [{ value: 'pill', label: 'Pill' }, { value: 'tag', label: 'Tag' }, { value: 'square', label: 'Square' }]),
      f('badgePosition', 'Badge position', [{ value: 'left', label: 'Top left' }, { value: 'right', label: 'Top right' }]),
      f('saleBadge', 'Sale badge text', [{ value: 'percent', label: '-20%' }, { value: 'amount', label: 'Save ₹200' }, { value: 'text', label: 'Sale' }]),
      f('priceCompare', 'Old price', [{ value: 'strike', label: 'Struck out' }, { value: 'strike-pill', label: '+ saving pill' }]),
      f('taxNote', 'Show "Incl. of all taxes"'),
    ],
  },
  {
    title: 'Inputs & icons',
    fields: [
      f('inputStyle', 'Input style', [{ value: 'outline', label: 'Outline' }, { value: 'filled', label: 'Filled' }, { value: 'underline', label: 'Underline' }]),
      f('iconStroke', 'Icon weight', [{ value: 'thin', label: 'Thin' }, { value: 'regular', label: 'Regular' }, { value: 'bold', label: 'Bold' }]),
    ],
  },
  {
    title: 'Layout & spacing',
    fields: [
      f('pageWidth', 'Page width', [{ value: 'narrow', label: 'Narrow' }, { value: 'regular', label: 'Regular' }, { value: 'wide', label: 'Wide' }, { value: 'full', label: 'Full' }]),
      f('sectionSpacing', 'Space between sections', [{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }, { value: 'airy', label: 'Airy' }]),
      f('gridGap', 'Grid gap', [{ value: 'tight', label: 'Tight' }, { value: 'normal', label: 'Normal' }, { value: 'loose', label: 'Loose' }]),
    ],
  },
  {
    title: 'Decoration & motion',
    fields: [
      f('texture', 'Background texture', [{ value: 'none', label: 'None' }, { value: 'grain', label: 'Grain' }, { value: 'dots', label: 'Dots' }, { value: 'grid', label: 'Grid' }, { value: 'paper', label: 'Paper' }]),
      f('gradients', 'Gradient backgrounds', undefined, 'Soft colour gradients on hero and call-to-action bands.'),
      f('motion', 'Motion', [{ value: 'none', label: 'None' }, { value: 'subtle', label: 'Subtle' }, { value: 'expressive', label: 'Expressive' }], 'Always off for shoppers who prefer reduced motion.'),
      f('scrollReveal', 'Reveal on scroll', [{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade' }, { value: 'slide-up', label: 'Slide up' }, { value: 'zoom', label: 'Zoom' }]),
    ],
  },
  {
    title: 'Drawers & popups',
    fields: [
      f('surface', 'Surface', [{ value: 'solid', label: 'Solid' }, { value: 'glass', label: 'Frosted glass' }]),
      f('overlay', 'Backdrop', [{ value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'dark', label: 'Dark' }]),
    ],
  },
];
