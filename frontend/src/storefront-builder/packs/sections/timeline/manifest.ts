import type { PackManifest } from '../../../core/types';

export interface TimelineSettings { eyebrow: string; heading: string; subtitle: string }
export interface StepBlock { label: string; title: string; text: string; image: unknown }

export const STEP_DEFAULTS: StepBlock = { label: '2020', title: 'A milestone', text: 'Tell this part of your story.', image: { $image: '' } };

/** Your story or process as steps — vertical or horizontal. */
const manifest: PackManifest<TimelineSettings> = {
  kind: 'section',
  id: 'timeline',
  name: 'Timeline',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: 'Our journey', heading: 'How we got here', subtitle: '' },
  defaultLayout: 'vertical',
  layouts: {
    vertical: { name: 'Vertical', load: () => import('./layouts/Vertical') },
    horizontal: { name: 'Horizontal', load: () => import('./layouts/Horizontal') },
  },
};

export default manifest;
