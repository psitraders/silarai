import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';

/** One big image, details in a narrow centred column below — calm and minimal. */
export default function CenteredMinimal({ settings, blocks, context }: ProductMainProps) {
  return (
    <ProductMainFrame settings={settings} context={context}>
      <div className="mx-auto max-w-2xl">
        <ProductGallery mode="single" ratio={settings.imageRatio} zoom={settings.zoom} eager />
      </div>
      <ProductInfo blocks={blocks} context={context} mode={settings.infoStyle} className="mx-auto mt-10 max-w-xl" />
    </ProductMainFrame>
  );
}
