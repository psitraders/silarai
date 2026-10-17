import type { CartProps, PackManifest } from '../../../core/types';

/** Cart, 5 styles (catalogue §8). Checkout itself is unchanged (Razorpay / COD). */
const manifest: PackManifest<Record<string, never>, CartProps> = {
  kind: 'cart',
  id: 'cart',
  name: 'Cart',
  version: 1,
  tier: 'free',
  defaults: {},
  defaultLayout: 'drawer-right',
  layouts: {
    'drawer-right': { name: 'Drawer (right)', load: () => import('./layouts/DrawerRight') },
    'drawer-left': { name: 'Drawer (left)', load: () => import('./layouts/DrawerLeft') },
    page: { name: 'Full page', load: () => import('./layouts/Page') },
    popup: { name: 'Popup', load: () => import('./layouts/Popup') },
    'bottom-sheet': { name: 'Bottom sheet', load: () => import('./layouts/BottomSheet') },
  },
};

export default manifest;
