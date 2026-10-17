import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { ratioOf, zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell } from '../parts/Shell';

/** Slides up from the bottom with a drag handle — mobile-native on every screen. */
export default function BottomSheet(props: QuickviewProps) {
  return (
    <PopupShell props={props} variant="sheet" size="lg">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 @3xl:grid @3xl:grid-cols-[40%_1fr] @3xl:gap-8 @3xl:p-8">
        <ProductGallery mode="single" ratio={ratioOf(props)} zoom={zoomOf(props)} eager />
        <div className="pt-5 @3xl:pt-0">
          <ProductInfo blocks={props.blocks} context={props.context} titleAs="h2" />
          <FullPageLink className="mt-6" />
        </div>
      </div>
    </PopupShell>
  );
}
