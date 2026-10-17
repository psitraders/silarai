import { optimizeImage } from '../../../../../utils/imageUrl';
import { useProductCtl } from '../../../../core/commerce/useProductController';
import type { QuickviewProps } from '../../../../core/types';
import { isVideoUrl } from '../../../../ui/product/blockTypes';
import { PriceView } from '../../../../ui/product/InfoBlocks';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { QuickAddRow } from '../parts/QuickAdd';
import { FullPageLink, PopupShell } from '../parts/Shell';

/** Instagram-story feel: full-width photos one under another, add bar always at hand. */
export default function Story(props: QuickviewProps) {
  return (
    <PopupShell props={props} size="sm" className="sm:h-[92dvh]">
      <Body {...props} />
    </PopupShell>
  );
}

function Body(props: QuickviewProps) {
  const ctl = useProductCtl();
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {ctl.images.length ? ctl.images.map((src, i) => (
          isVideoUrl(src)
            ? <video key={src + i} src={src} className="block w-full" controls muted playsInline preload="metadata" />
            : <img key={src + i} src={optimizeImage(src, 900)} alt={i === 0 ? ctl.product.title : ''} loading={i === 0 ? 'eager' : 'lazy'} className="block w-full" />
        )) : <div className="sf-placeholder aspect-[4/5]" aria-hidden />}
        <div className="p-5">
          <ProductInfo blocks={props.blocks} context={props.context} exclude={['buy-buttons', 'quantity']} titleAs="h2" />
          <FullPageLink className="mt-6" />
        </div>
      </div>
      <div className="shrink-0 space-y-2 p-3" style={{ borderTop: '1px solid var(--sf-border)', background: 'var(--sf-surface)' }}>
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="line-clamp-1 text-sm font-semibold">{ctl.product.title}</p>
          <PriceView s={{ size: 'md', showTaxNote: false }} />
        </div>
        <QuickAddRow />
      </div>
    </>
  );
}
