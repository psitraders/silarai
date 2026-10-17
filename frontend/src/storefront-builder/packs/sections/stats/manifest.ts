import type { PackManifest } from '../../../core/types';

export interface StatsSettings { eyebrow: string; heading: string; subtitle: string }
export interface StatBlock { value: string; label: string }
export const STAT_DEFAULTS: StatBlock = { value: '10k+', label: 'Happy customers' };

const manifest: PackManifest<StatsSettings> = {
  kind: 'section',
  id: 'stats',
  name: 'Numbers',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', heading: '', subtitle: '' },
  defaultLayout: 'counters',
  layouts: {
    counters: { name: 'Counters', load: () => import('./layouts/Counters') },
    cards: { name: 'Cards', load: () => import('./layouts/Cards') },
  },
};

export default manifest;
