import type { PackManifest, SmartImage } from '../../../../core/types';

export interface CraftsmanshipSettings { eyebrow: string; heading: string; subtitle: string }
export interface CraftStepBlock { title: string; text: string; image: SmartImage }

export const CRAFT_STEP_DEFAULTS: CraftStepBlock = { title: 'A step of the making', text: 'Describe what happens here and who does it.', image: { $image: '' } };

/** Noor signature widget: how a piece is made, step by step. */
const manifest: PackManifest<CraftsmanshipSettings> = {
  kind: 'section',
  id: 'craftsmanship-story',
  name: 'Craftsmanship story',
  version: 1,
  tier: 'free',
  template: 'noor',
  defaults: { eyebrow: 'The making', heading: 'From sketch to sparkle', subtitle: 'Every piece passes through skilled hands before it reaches yours.' },
  defaultLayout: 'steps',
  layouts: {
    steps: { name: 'Numbered steps', load: () => import('./layouts/Steps') },
    alternating: { name: 'Alternating photos', load: () => import('./layouts/Alternating') },
  },
};

export default manifest;
