import { BadgeCheck, CreditCard } from 'lucide-react';
import type { QuickviewProps } from '../../../../core/types';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { SpecsView } from '../../../../ui/product/InfoBlocks';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { zoomOf } from '../parts/settings';
import { FullPageLink, PopupShell, SplitBody } from '../parts/Shell';

const TOP = ['badges', 'title', 'rating', 'price'];
const BUY = ['variants', 'quantity', 'stock', 'buy-buttons', 'wholesale', 'quote'];

/** Electronics: image, key spec chips, price and a warranty / EMI strip. */
export default function SpecCard(props: QuickviewProps) {
  const strip = [
    props.settings.warranty && { Icon: BadgeCheck, text: String(props.settings.warranty) },
    props.settings.emi && { Icon: CreditCard, text: String(props.settings.emi) },
  ].filter(Boolean) as { Icon: typeof BadgeCheck; text: string }[];
  return (
    <PopupShell props={props} size="lg">
      <SplitBody
        galleryWidth="44%"
        padGallery
        gallery={<ProductGallery mode="slider" ratio="square" zoom={zoomOf(props)} eager />}
        info={(
          <div className="flex flex-col gap-5">
            <ProductInfo blocks={props.blocks} context={props.context} only={TOP} titleAs="h2" gap="gap-3" />
            <SpecsView s={{ title: '' }} context={props.context} chips />
            {strip.length > 0 && (
              <ul className="grid gap-2 @md:grid-cols-2">
                {strip.map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 rounded-[var(--sf-radius-md)] px-3 py-2 text-xs font-semibold" style={{ background: 'color-mix(in srgb, var(--sf-text) 5%, transparent)' }}>
                    <Icon className="h-4 w-4 shrink-0 sf-link" aria-hidden /> {text}
                  </li>
                ))}
              </ul>
            )}
            <ProductInfo blocks={props.blocks} context={props.context} only={BUY} />
            <FullPageLink />
          </div>
        )}
      />
    </PopupShell>
  );
}
