import type { CartProps } from '../../../../core/types';
import { CartHost } from '../parts/CartHost';

/** Slides up from the bottom. */
export default function BottomSheet(props: CartProps) {
  return <CartHost {...props} placement="sheet" />;
}
