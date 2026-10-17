import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { ratioOf, zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell } from '../parts/Shell';

/** Slides in from the right, full height. */
export default function SideDrawer(props: QuickviewProps) {
  return (
    <PopupShell props={props} variant="drawer-right" size="lg">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-4 pb-0"><ProductGallery mode="carousel" ratio={ratioOf(props)} zoom={zoomOf(props)} eager /></div>
        <div className="p-5 pt-6">
          <ProductInfo blocks={props.blocks} context={props.context} titleAs="h2" />
          <FullPageLink className="mt-6" />
        </div>
      </div>
    </PopupShell>
  );
}
