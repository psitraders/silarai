import { isContentBlock } from '../../../../ui/product/blockTypes';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';

/** Wide image slider on top, buying details and long content in two columns below. */
export default function HeroSlider({ settings, blocks, context }: ProductMainProps) {
  const buying = blocks.filter(b => !isContentBlock(b));
  const content = blocks.filter(isContentBlock);
  return (
    <ProductMainFrame settings={settings} context={context}>
      <ProductGallery mode="carousel" ratio={settings.imageRatio === 'portrait' ? 'landscape' : settings.imageRatio} zoom={settings.zoom} eager />
      <div className="mt-8 grid gap-10 @3xl:mt-12 @3xl:grid-cols-[1fr_1.1fr] @3xl:gap-14">
        <ProductInfo blocks={buying} context={context} />
        {content.length > 0 && <ProductInfo blocks={content} context={context} mode={settings.infoStyle === 'plain' ? 'plain' : settings.infoStyle} />}
      </div>
    </ProductMainFrame>
  );
}
