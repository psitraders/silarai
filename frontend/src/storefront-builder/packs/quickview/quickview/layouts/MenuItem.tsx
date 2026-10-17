import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { AddOnList } from '../parts/AddOnList';
import { QuickAddRow } from '../parts/QuickAdd';
import { zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell } from '../parts/Shell';

const SHOWN = ['badges', 'title', 'price', 'rating', 'description', 'variants', 'delivery', 'countdown'];

/** Food & bakery: round photo, description, option chips, quantity + add, add-ons. */
export default function MenuItem(props: QuickviewProps) {
  const blocks = props.blocks.map(b => (b.type === 'variants' ? { ...b, settings: { ...b.settings, style: 'chips' } } : b));
  return (
    <PopupShell props={props} size="sm">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 pt-8">
        <div className="mx-auto w-56"><ProductGallery mode="round" zoom={zoomOf(props)} eager badge={false} /></div>
        <ProductInfo blocks={blocks} context={props.context} only={SHOWN} titleAs="h2" gap="gap-4" />
        <QuickAddRow />
        <AddOnList heading={String(props.settings.addOnsHeading || 'Add-ons')} />
        <FullPageLink />
      </div>
    </PopupShell>
  );
}
