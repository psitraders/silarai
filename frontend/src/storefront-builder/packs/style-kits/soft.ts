import type { StyleKitDef } from '../../core/types';

const kit: StyleKitDef = {
  id: 'soft',
  name: 'Soft',
  description: 'Rounded, gentle shadows, friendly.',
  options: {
    corners: 'round',
    imageCorners: 'round',
    shadowDepth: 'soft',
    headingWeight: 'bold',
    headingTracking: 'tight',
    buttonShape: 'pill',
    buttonStyle: 'filled',
    buttonHover: 'lift',
    cardStyle: 'shadow',
    cardHover: 'lift',
    cardPadding: 'normal',
    badgeShape: 'pill',
    inputStyle: 'filled',
    iconStroke: 'regular',
    sectionSpacing: 'comfortable',
    gradients: true,
    motion: 'subtle',
    scrollReveal: 'slide-up',
    overlay: 'medium',
  },
};

export default kit;
