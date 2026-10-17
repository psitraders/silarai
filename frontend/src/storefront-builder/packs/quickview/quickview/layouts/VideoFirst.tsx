import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell } from '../parts/Shell';

/** Video (or the photos) on top, details below. */
export default function VideoFirst(props: QuickviewProps) {
  return (
    <PopupShell props={props} variant="modal" size="lg">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div><ProductGallery mode="single" ratio="landscape" zoom={zoomOf(props)} eager videoFirst /></div>
        <div className="p-5 pt-6">
          <ProductInfo blocks={props.blocks} context={props.context} titleAs="h2" />
          <FullPageLink className="mt-6" />
        </div>
      </div>
    </PopupShell>
  );
}
