import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { ratioOf, zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell, SplitBody } from '../parts/Shell';

/** 60 / 40 split with the thumbnail strip under the image. */
export default function WideGallery(props: QuickviewProps) {
  return (
    <PopupShell props={props}>
      <SplitBody
        galleryWidth="60%" padGallery
        gallery={<ProductGallery mode="slider" ratio={ratioOf(props)} zoom={zoomOf(props)} eager />}
        info={<><ProductInfo blocks={props.blocks} context={props.context} mode={'plain'} titleAs="h2" /><FullPageLink className="mt-6" /></>}
      />
    </PopupShell>
  );
}
