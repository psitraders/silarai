import type { StyleKitDef } from '../../core/types';

const kit: StyleKitDef = {
  id: 'organic',
  name: 'Organic',
  description: 'Earthy, curved shapes, paper texture.',
  options: {
    corners: 'round',
    imageCorners: 'round',
    shadowDepth: 'soft',
    headingScale: 'regular',
    headingWeight: 'semibold',
    headingTracking: 'normal',
    bodySize: 17,
    linkStyle: 'underline',
    buttonShape: 'pill',
    buttonStyle: 'soft',
    buttonHover: 'darken',
    cardStyle: 'bordered',
    cardHover: 'border',
    cardPadding: 'roomy',
    productImageRatio: 'square',
    badgeShape: 'tag',
    inputStyle: 'outline',
    iconStroke: 'regular',
    sectionSpacing: 'airy',
    texture: 'paper',
    gradients: false,
    motion: 'subtle',
    scrollReveal: 'fade',
    overlay: 'light',
  },
};

export default kit;
