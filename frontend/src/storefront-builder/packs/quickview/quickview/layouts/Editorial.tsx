import { optimizeImage } from '../../../../../utils/imageUrl';
import { useProductCtl } from '../../../../core/commerce/useProductController';
import type { QuickviewProps } from '../../../../core/types';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { FullPageLink, PopupShell } from '../parts/Shell';

const ESSENTIALS = ['price', 'variants', 'quantity', 'buy-buttons', 'size-guide', 'stock', 'countdown'];

/** A large photo with the name set over it in the heading font; only the essentials beside it. */
export default function Editorial(props: QuickviewProps) {
  return (
    <PopupShell props={props}>
      <div className="min-h-0 flex-1 overflow-y-auto @3xl:grid @3xl:h-[min(760px,88dvh)] @3xl:grid-cols-[58%_1fr] @3xl:overflow-hidden">
        <Hero />
        <div className="p-6 @3xl:overflow-y-auto @3xl:p-10">
          <ProductInfo blocks={props.blocks} context={props.context} only={ESSENTIALS} titleAs="h2" />
          <FullPageLink className="mt-8" />
        </div>
      </div>
    </PopupShell>
  );
}

function Hero() {
  const ctl = useProductCtl();
  const image = ctl.images[0];
  return (
    <div className="relative min-h-[360px] overflow-hidden @3xl:h-full">
      {image ? <img src={optimizeImage(image, 1400)} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="sf-placeholder absolute inset-0" aria-hidden />}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgb(0 0 0 / 0.65), transparent 55%)' }} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white @3xl:p-10">
        {ctl.product.categoryName && <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] opacity-85">{ctl.product.categoryName}</p>}
        <h2 className="sf-h1 leading-[1.05]">{ctl.product.title}</h2>
      </div>
    </div>
  );
}
