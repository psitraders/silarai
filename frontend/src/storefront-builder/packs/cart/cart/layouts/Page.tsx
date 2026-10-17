import type { CartProps } from '../../../../core/types';
import { CartHost } from '../parts/CartHost';

/** Full-screen cart page. */
export default function Page(props: CartProps) {
  return <CartHost {...props} placement="page" />;
}
