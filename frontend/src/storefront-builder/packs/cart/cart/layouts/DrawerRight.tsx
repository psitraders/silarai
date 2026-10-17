import type { CartProps } from '../../../../core/types';
import { CartHost } from '../parts/CartHost';

/** Drawer from the right. */
export default function DrawerRight(props: CartProps) {
  return <CartHost {...props} placement="right" />;
}
