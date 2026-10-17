import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell } from '../parts/Shell';

/** Full-screen: the photos fill the screen, details float in a panel on the right. */
export default function Immersive(props: QuickviewProps) {
  return (
    <PopupShell props={props} variant="full">
      <div className="min-h-0 flex-1 overflow-y-auto @3xl:relative @3xl:overflow-hidden">
        <div className="h-[58dvh] @3xl:absolute @3xl:inset-y-0 @3xl:left-0 @3xl:right-[444px] @3xl:h-auto">
          <ProductGallery mode="fill" ratio="portrait" zoom={zoomOf(props)} eager className="h-full" />
        </div>
        <div className="sf-drawer relative p-5 pt-6 @3xl:absolute @3xl:bottom-6 @3xl:right-6 @3xl:top-6 @3xl:w-[420px] @3xl:overflow-y-auto @3xl:rounded-[var(--sf-radius-lg)] @3xl:p-7 @3xl:shadow-2xl">
          <ProductInfo blocks={props.blocks} context={props.context} titleAs="h2" />
          <FullPageLink className="mt-6" />
        </div>
      </div>
    </PopupShell>
  );
}
