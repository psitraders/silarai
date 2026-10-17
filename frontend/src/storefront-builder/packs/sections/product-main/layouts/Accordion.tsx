import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';
import { TwoColumn } from '../parts/TwoColumn';

/** Gallery + details, with long content in collapsible rows. */
export default function Accordion({ settings, blocks, context }: ProductMainProps) {
  return (
    <ProductMainFrame settings={settings} context={context}>
      <TwoColumn stickyGallery
        gallery={<ProductGallery mode="slider" ratio={settings.imageRatio} zoom={settings.zoom} eager />}
        info={<ProductInfo blocks={blocks} context={context} mode={'accordion'} />}
      />
    </ProductMainFrame>
  );
}
