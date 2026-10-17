import type { PackManifest } from '../../../core/types';

export interface DividerSettings { size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }

const manifest: PackManifest<DividerSettings> = {
  kind: 'section',
  id: 'divider',
  name: 'Spacer & divider',
  version: 1,
  tier: 'free',
  defaults: { size: 'md' },
  defaultLayout: 'space',
  layouts: {
    space: { name: 'Space', load: () => import('./layouts/Space') },
    line: { name: 'Line', load: () => import('./layouts/Line') },
    dots: { name: 'Dots', load: () => import('./layouts/Dots') },
    wave: { name: 'Wave', load: () => import('./layouts/Wave') },
  },
};

export default manifest;
