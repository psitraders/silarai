import type { LayoutProps } from '../../../../core/types';
import type { RelatedProductsSettings } from '../manifest';
import { Related } from '../Related';

export default function Grid(props: LayoutProps<RelatedProductsSettings>) {
  return <Related {...props} layout="grid" />;
}
