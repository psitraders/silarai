import type { CardProps, PackManifest } from '../../../core/types';

/**
 * Product card, 10 styles (catalogue §6). The store picks one in Style → Store
 * behaviour; product sections can override it. All follow the "Product cards"
 * and "Badges" style options.
 */
const manifest: PackManifest<Record<string, never>, CardProps> = {
  kind: 'card',
  id: 'card',
  name: 'Product card',
  version: 1,
  tier: 'free',
  defaults: {},
  defaultLayout: 'standard',
  layouts: {
    standard: { name: 'Standard', load: () => import('./layouts/Standard') },
    minimal: { name: 'Minimal', load: () => import('./layouts/Minimal') },
    overlay: { name: 'Overlay', load: () => import('./layouts/Overlay') },
    bordered: { name: 'Bordered', load: () => import('./layouts/Bordered') },
    elevated: { name: 'Elevated', load: () => import('./layouts/Elevated') },
    'list-row': { name: 'List row', load: () => import('./layouts/ListRow') },
    editorial: { name: 'Editorial', load: () => import('./layouts/Editorial') },
    compact: { name: 'Compact', load: () => import('./layouts/Compact') },
    'rounded-center': { name: 'Rounded, centred', load: () => import('./layouts/RoundedCenter') },
    tech: { name: 'Tech', load: () => import('./layouts/Tech') },
  },
};

export default manifest;
