import type { StyleKitDef } from '../../core/types';

const kit: StyleKitDef = {
  id: 'glass',
  name: 'Glass',
  description: 'Frosted header and drawers, depth, vivid backdrops.',
  options: {
    corners: 'round',
    imageCorners: 'round',
    shadowDepth: 'strong',
    headingWeight: 'bold',
    headingTracking: 'tight',
    buttonShape: 'pill',
    buttonStyle: 'gradient',
    buttonHover: 'glow',
    cardStyle: 'glass',
    cardHover: 'lift',
    badgeShape: 'pill',
    inputStyle: 'filled',
    pageWidth: 'wide',
    sectionSpacing: 'comfortable',
    texture: 'none',
    gradients: true,
    motion: 'expressive',
    scrollReveal: 'zoom',
    surface: 'glass',
    overlay: 'medium',
  },
};

export default kit;
