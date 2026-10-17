import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { ratioOf, zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell, SplitBody } from '../parts/Shell';

/** 2 × 2 image grid beside the details. */
export default function GridGallery(props: QuickviewProps) {
  return (
    <PopupShell props={props}>
      <SplitBody
        galleryWidth="54%" padGallery
        gallery={<ProductGallery mode="grid-2x2" ratio={ratioOf(props)} zoom={zoomOf(props)} eager />}
        info={<><ProductInfo blocks={props.blocks} context={props.context} mode={'plain'} titleAs="h2" /><FullPageLink className="mt-6" /></>}
      />
    </PopupShell>
  );
}
