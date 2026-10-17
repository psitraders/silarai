import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';
import { TwoColumn } from '../parts/TwoColumn';

/** Vertical thumbnails, main image, details. */
export default function ThumbRail({ settings, blocks, context }: ProductMainProps) {
  return (
    <ProductMainFrame settings={settings} context={context}>
      <TwoColumn cols="gallery-wide"
        gallery={<ProductGallery mode="thumbs-left" ratio={settings.imageRatio} zoom={settings.zoom} eager />}
        info={<ProductInfo blocks={blocks} context={context} mode={settings.infoStyle} />}
      />
    </ProductMainFrame>
  );
}
