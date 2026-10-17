import type { PackManifest, SmartImage, SmartLink } from '../../../../core/types';

export interface BeforeAfterSettings {
  eyebrow: string;
  heading: string;
  text: string;
  before: SmartImage;
  after: SmartImage;
  beforeLabel: string;
  afterLabel: string;
  buttonLabel: string;
  buttonLink: SmartLink;
}

/** Bloom signature widget: a before / after comparison (beauty, alterations, styling). */
const manifest: PackManifest<BeforeAfterSettings> = {
  kind: 'section',
  id: 'before-after',
  name: 'Before / after',
  version: 1,
  tier: 'free',
  template: 'bloom',
  defaults: {
    eyebrow: 'See the difference',
    heading: 'Before and after',
    text: '',
    before: { $image: '' },
    after: { $image: '' },
    beforeLabel: 'Before',
    afterLabel: 'After',
    buttonLabel: '',
    buttonLink: { $link: '' },
  },
  defaultLayout: 'slider',
  layouts: {
    slider: { name: 'Drag slider', load: () => import('./layouts/Slider') },
    'side-by-side': { name: 'Side by side', load: () => import('./layouts/SideBySide') },
  },
};

export default manifest;
