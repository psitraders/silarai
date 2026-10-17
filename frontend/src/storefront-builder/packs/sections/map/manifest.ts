import type { PackManifest } from '../../../core/types';

export interface MapSettings { heading: string; address: string; height: 'short' | 'regular' | 'tall'; note: string }

const manifest: PackManifest<MapSettings> = {
  kind: 'section',
  id: 'map',
  name: 'Map',
  version: 1,
  tier: 'free',
  defaults: { heading: 'Find us', address: '', height: 'regular', note: '' },
  defaultLayout: 'contained',
  layouts: {
    contained: { name: 'Contained', load: () => import('./layouts/Contained') },
    'full-width': { name: 'Full width', load: () => import('./layouts/FullWidth') },
  },
};

export default manifest;
