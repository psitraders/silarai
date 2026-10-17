import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';
import { TwoColumn } from '../parts/TwoColumn';

/** Details on the left, gallery on the right. */
export default function Mirrored({ settings, blocks, context }: ProductMainProps) {
  return (
    <ProductMainFrame settings={settings} context={context}>
      <TwoColumn reverse
        gallery={<ProductGallery mode="slider" ratio={settings.imageRatio} zoom={settings.zoom} eager />}
        info={<ProductInfo blocks={blocks} context={context} mode={settings.infoStyle} />}
      />
    </ProductMainFrame>
  );
}
