import { optimizeImage } from '../../../../../utils/imageUrl';
import { blockSettings } from '../../../../core/blocks';
import { useProductCtl } from '../../../../core/commerce/useProductController';
import type { BlockInstance, QuickviewProps } from '../../../../core/types';
import { PRODUCT_BLOCK_DEFAULTS, type VariantsBlock } from '../../../../ui/product/blockTypes';
import { VariantsView } from '../../../../ui/product/BuyBlocks';
import { PriceView } from '../../../../ui/product/InfoBlocks';
import { QuickAddRow } from '../parts/QuickAdd';
import { FullPageLink, PopupShell } from '../parts/Shell';

/** Small card: thumbnail, title, price, options and add — fast repeat shopping. */
export default function CompactQuickAdd(props: QuickviewProps) {
  return (
    <PopupShell props={props} size="sm">
      <Body blocks={props.blocks} />
    </PopupShell>
  );
}

function Body({ blocks }: { blocks: BlockInstance[] }) {
  const ctl = useProductCtl();
  const variantsBlock = blocks.find(b => b.type === 'variants');
  const variants = variantsBlock ? blockSettings(PRODUCT_BLOCK_DEFAULTS.variants, variantsBlock) : ({ style: 'chips' } as VariantsBlock);
  const image = ctl.images[0];
  return (
    <div className="space-y-5 overflow-y-auto p-5">
      <div className="flex items-center gap-4 pr-10">
        {image ? <img src={optimizeImage(image, 200)} alt="" className="h-20 w-20 shrink-0 rounded-[var(--sf-radius-md)] object-cover" /> : <span className="sf-placeholder h-20 w-20 shrink-0 rounded-[var(--sf-radius-md)]" aria-hidden />}
        <div className="min-w-0">
          <h2 className="line-clamp-2 font-bold leading-snug">{ctl.product.title}</h2>
          <PriceView s={{ size: 'md', showTaxNote: false }} />
        </div>
      </div>
      <VariantsView s={{ ...variants, style: variants.style === 'dropdown' ? 'dropdown' : 'chips' }} />
      <QuickAddRow />
      <FullPageLink />
    </div>
  );
}
