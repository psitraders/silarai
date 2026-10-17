import type { StyleKitDef } from '../../core/types';

const kit: StyleKitDef = {
  id: 'bento',
  name: 'Bento',
  description: 'Modular tiles, Apple-like.',
  options: {
    corners: 'round',
    imageCorners: 'round',
    shadowDepth: 'none',
    headingScale: 'large',
    headingWeight: 'bold',
    headingTracking: 'tight',
    buttonShape: 'pill',
    buttonStyle: 'filled',
    buttonHover: 'darken',
    cardStyle: 'flat',
    cardHover: 'zoom',
    cardPadding: 'roomy',
    productImageRatio: 'square',
    badgeShape: 'pill',
    inputStyle: 'filled',
    iconStroke: 'regular',
    pageWidth: 'wide',
    sectionSpacing: 'comfortable',
    gridGap: 'tight',
    texture: 'none',
    gradients: false,
    motion: 'subtle',
    scrollReveal: 'slide-up',
    surface: 'glass',
    overlay: 'medium',
  },
};

export default kit;
