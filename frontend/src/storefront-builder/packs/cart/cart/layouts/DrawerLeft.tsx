import type { CartProps } from '../../../../core/types';
import { CartHost } from '../parts/CartHost';

/** Drawer from the left. */
export default function DrawerLeft(props: CartProps) {
  return <CartHost {...props} placement="left" />;
}
