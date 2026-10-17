import type { CartProps } from '../../../../core/types';
import { CartHost } from '../parts/CartHost';

/** Centred popup. */
export default function Popup(props: CartProps) {
  return <CartHost {...props} placement="popup" />;
}
