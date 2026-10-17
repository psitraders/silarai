import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { ratioOf, zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell, SplitBody } from '../parts/Shell';

/** Split, with long content in tabs (Details · Specs · Reviews). */
export default function Tabbed(props: QuickviewProps) {
  return (
    <PopupShell props={props}>
      <SplitBody
        galleryWidth="46%"
        gallery={<ProductGallery mode="slider" ratio={ratioOf(props)} zoom={zoomOf(props)} eager />}
        info={<><ProductInfo blocks={props.blocks} context={props.context} mode={'tabs'} titleAs="h2" /><FullPageLink className="mt-6" /></>}
      />
    </PopupShell>
  );
}
