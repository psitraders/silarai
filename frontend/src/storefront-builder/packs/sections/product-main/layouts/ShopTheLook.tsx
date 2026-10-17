import { Plus } from 'lucide-react';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { useProductCtl } from '../../../../core/commerce/useProductController';
import { useRelatedProducts } from '../../../../core/data/hooks';
import { useShell } from '../../../../core/shell-context';
import { useStorefront } from '../../../../core/storefront-context';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import { displayPrice, isOutOfStock, needsOptions } from '../../../../ui/product';
import type { ProductMainProps } from '../manifest';
import { AddOns } from '../parts/AddOns';
import { ProductMainFrame } from '../parts/Frame';
import { TwoColumn } from '../parts/TwoColumn';

/** Fashion: a tall model photo with a shoppable "complete the look" card, details beside it. */
export default function ShopTheLook({ settings, blocks, context }: ProductMainProps) {
  return (
    <ProductMainFrame settings={settings} context={context}>
      <TwoColumn
        gallery={(
          <div className="relative">
            <ProductGallery mode="single" ratio="portrait" zoom={settings.zoom} eager />
            <LookCard heading={settings.addOnsHeading} />
          </div>
        )}
        info={<ProductInfo blocks={blocks} context={context} mode={settings.infoStyle} />}
        cols="gallery-wide"
        stickyInfo
      />
      <AddOns heading={settings.addOnsHeading} context={context} wide />
    </ProductMainFrame>
  );
}

function LookCard({ heading }: { heading: string }) {
  const { product } = useProductCtl();
  const shell = useShell();
  const { store } = useStorefront();
  const { items } = useRelatedProducts(product, 3);
  if (!items.length) return null;
  return (
    <div className="absolute inset-x-3 bottom-12 z-10 rounded-[var(--sf-radius-md)] p-3 shadow-xl @3xl:inset-x-auto @3xl:right-4 @3xl:w-72" style={{ background: 'color-mix(in srgb, var(--sf-surface) 92%, transparent)', backdropFilter: 'blur(8px)' }}>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide">{heading || 'Complete the look'}</p>
      <ul className="space-y-2">
        {items.map(p => {
          const soldOut = isOutOfStock(p);
          return (
            <li key={p.id} className="flex items-center gap-2.5">
              <button type="button" onClick={() => shell.openProduct(p)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                {p.primaryImage ? <img src={optimizeImage(p.primaryImage, 120)} alt="" className="h-11 w-11 shrink-0 rounded-[var(--sf-radius-sm)] object-cover" loading="lazy" /> : <span className="sf-placeholder h-11 w-11 shrink-0 rounded-[var(--sf-radius-sm)]" />}
                <span className="min-w-0">
                  <span className="line-clamp-1 text-sm font-semibold">{p.title}</span>
                  <span className="sf-price text-xs">{formatCurrency(displayPrice(p).amount, store.currency ?? 'INR')}</span>
                </span>
              </button>
              <button
                type="button"
                disabled={soldOut}
                onClick={() => (needsOptions(p) ? shell.openProduct(p) : shell.addToCart(p))}
                className="sf-icon-btn shrink-0"
                style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)', width: 36, height: 36 }}
                aria-label={needsOptions(p) ? `Choose options for ${p.title}` : `Add ${p.title} to cart`}
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
