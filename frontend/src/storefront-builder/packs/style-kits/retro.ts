import type { StyleKitDef } from '../../core/types';

const kit: StyleKitDef = {
  id: 'retro',
  name: 'Retro',
  description: 'Warm faded tones, grain, polaroid feel.',
  options: {
    corners: 'subtle',
    imageCorners: 'subtle',
    shadowDepth: 'hard',
    headingScale: 'regular',
    headingWeight: 'bold',
    headingCase: 'upper',
    headingTracking: 'wide',
    linkStyle: 'underline',
    buttonShape: 'soft',
    buttonStyle: 'hard-shadow',
    buttonHover: 'lift',
    buttonCase: 'upper',
    cardStyle: 'bordered',
    cardHover: 'lift',
    cardPadding: 'roomy',
    productImageRatio: 'square',
    badgeShape: 'tag',
    saleBadge: 'text',
    inputStyle: 'outline',
    iconStroke: 'regular',
    sectionSpacing: 'comfortable',
    texture: 'grain',
    gradients: false,
    motion: 'subtle',
    scrollReveal: 'fade',
    overlay: 'medium',
  },
};

export default kit;
