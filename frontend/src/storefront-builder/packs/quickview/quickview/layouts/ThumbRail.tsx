import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { ratioOf, zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell, SplitBody } from '../parts/Shell';

/** Vertical thumbnails, main image, details. */
export default function ThumbRail(props: QuickviewProps) {
  return (
    <PopupShell props={props}>
      <SplitBody
        galleryWidth="56%" padGallery
        gallery={<ProductGallery mode="thumbs-left" ratio={ratioOf(props)} zoom={zoomOf(props)} eager />}
        info={<><ProductInfo blocks={props.blocks} context={props.context} mode={'plain'} titleAs="h2" /><FullPageLink className="mt-6" /></>}
      />
    </PopupShell>
  );
}
