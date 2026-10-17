import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';
import { TwoColumn } from '../parts/TwoColumn';

/** Images stack; details stay in view while they scroll. */
export default function StackedSticky({ settings, blocks, context }: ProductMainProps) {
  return (
    <ProductMainFrame settings={settings} context={context}>
      <TwoColumn cols="gallery-wide" stickyInfo
        gallery={<ProductGallery mode="stacked" ratio={settings.imageRatio} zoom={settings.zoom} eager />}
        info={<ProductInfo blocks={blocks} context={context} mode={settings.infoStyle} />}
      />
    </ProductMainFrame>
  );
}
