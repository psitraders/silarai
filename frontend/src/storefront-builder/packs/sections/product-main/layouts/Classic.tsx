import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';
import { TwoColumn } from '../parts/TwoColumn';

/** Gallery with thumbnails below, details on the right. */
export default function Classic({ settings, blocks, context }: ProductMainProps) {
  return (
    <ProductMainFrame settings={settings} context={context}>
      <TwoColumn
        gallery={<ProductGallery mode="slider" ratio={settings.imageRatio} zoom={settings.zoom} eager />}
        info={<ProductInfo blocks={blocks} context={context} mode={settings.infoStyle} />}
      />
    </ProductMainFrame>
  );
}
