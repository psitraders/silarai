import type { StyleKitDef } from '../../core/types';

const kit: StyleKitDef = {
  id: 'bold',
  name: 'Bold',
  description: 'Thick borders, hard offset shadows, punchy colour.',
  options: {
    corners: 'subtle',
    imageCorners: 'subtle',
    shadowDepth: 'hard',
    headingScale: 'large',
    headingWeight: 'black',
    headingCase: 'upper',
    headingTracking: 'tight',
    linkStyle: 'underline',
    buttonShape: 'soft',
    buttonStyle: 'hard-shadow',
    buttonSize: 'large',
    buttonHover: 'lift',
    cardStyle: 'hard-shadow',
    cardHover: 'lift',
    cardPadding: 'normal',
    productImageRatio: 'square',
    badgeShape: 'square',
    saleBadge: 'amount',
    inputStyle: 'outline',
    iconStroke: 'bold',
    sectionSpacing: 'comfortable',
    gridGap: 'loose',
    gradients: false,
    motion: 'expressive',
    scrollReveal: 'slide-up',
    overlay: 'dark',
  },
};

export default kit;
