import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps } from '../manifest';
import { AddOns } from '../parts/AddOns';
import { ProductMainFrame } from '../parts/Frame';
import { TwoColumn } from '../parts/TwoColumn';

/** Food & bakery: a big appetising photo, option chips, delivery note and add-ons. */
export default function MenuItem({ settings, blocks, context }: ProductMainProps) {
  // Options read best as chips here (size, eggless, flavour).
  const chipBlocks = blocks.map(b => (b.type === 'variants' ? { ...b, settings: { ...b.settings, style: 'chips' } } : b));
  return (
    <ProductMainFrame settings={settings} context={context}>
      <TwoColumn
        gallery={<ProductGallery mode="single" ratio={settings.imageRatio === 'portrait' ? 'square' : settings.imageRatio} zoom={settings.zoom} eager />}
        info={<ProductInfo blocks={chipBlocks} context={context} mode={settings.infoStyle} />}
      />
      <AddOns heading={settings.addOnsHeading} context={context} wide />
    </ProductMainFrame>
  );
}
