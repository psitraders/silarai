import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';

/** Image fills the left half edge to edge and stays put; details scroll on the right. */
export default function SplitScreen({ settings, blocks, context }: ProductMainProps) {
  return (
    <ProductMainFrame settings={settings} context={context} contained={false}>
      <div className="grid @3xl:grid-cols-2">
        <div className="aspect-[4/5] @3xl:sticky @3xl:top-[var(--sf-header-h,0px)] @3xl:aspect-auto @3xl:h-[calc(100dvh-var(--sf-header-h,0px))] @3xl:self-start">
          <ProductGallery mode="fill" ratio={settings.imageRatio} zoom={settings.zoom} eager className="h-full" />
        </div>
        <div className="px-5 py-10 @3xl:px-14 @3xl:py-16">
          <ProductInfo blocks={blocks} context={context} mode={settings.infoStyle} className="max-w-xl" />
        </div>
      </div>
    </ProductMainFrame>
  );
}
