import type { PackManifest, SmartProducts } from '../../../../core/types';

export interface SpecCompareSettings { eyebrow: string; heading: string; subtitle: string; products: SmartProducts }

/** Volt signature widget: 2–4 hand-picked products side by side (specs from "Label: value" lines). */
const manifest: PackManifest<SpecCompareSettings> = {
  kind: 'section',
  id: 'spec-compare',
  name: 'Spec compare',
  version: 1,
  tier: 'free',
  template: 'volt',
  defaults: { eyebrow: 'Compare', heading: 'Which one is right for you?', subtitle: '', products: { $products: { source: 'manual', productIds: [], limit: 4 } } },
  defaultLayout: 'table',
  layouts: {
    table: { name: 'Comparison table', load: () => import('./layouts/Table') },
  },
};

export default manifest;
