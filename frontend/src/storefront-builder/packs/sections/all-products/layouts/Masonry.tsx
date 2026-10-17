import { Plus } from 'lucide-react';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { useShell } from '../../../../core/shell-context';
import type { LayoutProps, StoreProduct } from '../../../../core/types';
import { Price } from '../../../../ui/Price';
import { isOutOfStock, needsOptions } from '../../../../ui/product';
import type { AllProductsSettings } from '../manifest';
import { Breadcrumb, CatalogRoot, CategoryTabs, Pager, Results, Toolbar } from '../parts/Parts';
import { useCatalog } from '../parts/useCatalog';

/** Pinterest-style columns with uncropped photos (fashion, decor, Bloom). */
export default function Masonry({ settings, context }: LayoutProps<AllProductsSettings>) {
  const c = useCatalog(settings, context);
  const cols = 'columns-2 gap-3 @3xl:columns-3 @3xl:gap-4 @5xl:columns-4';
  return (
    <CatalogRoot c={c}>
      <CategoryTabs c={c} settings={settings} />
      <div className="sf-container space-y-5 py-8">
        <Breadcrumb c={c} settings={settings} />
        <Toolbar c={c} settings={settings} context={context} />
        <Results c={c} skeletonClass="grid grid-cols-2 gap-3 @3xl:grid-cols-4" render={items => (
          <ul className={cols}>{items.map(p => <li key={p.id} className="mb-3 break-inside-avoid @3xl:mb-4"><Tile product={p} /></li>)}</ul>
        )} />
        <Pager c={c} />
      </div>
    </CatalogRoot>
  );
}

function Tile({ product }: { product: StoreProduct }) {
  const shell = useShell();
  const soldOut = isOutOfStock(product);
  return (
    <article className="group">
      <div className="relative overflow-hidden sf-img">
        <button type="button" onClick={() => shell.openProduct(product)} className="block w-full" aria-label={`View ${product.title}`}>
          {product.primaryImage
            ? <img src={optimizeImage(product.primaryImage, 520)} alt={product.title} loading="lazy" decoding="async" className="sf-zoom block h-auto w-full group-hover:scale-[1.03]" />
            : <span className="sf-placeholder block aspect-[3/4]" />}
        </button>
        {soldOut && <span className="sf-badge sf-badge-neutral absolute left-2 top-2">Sold out</span>}
        {!soldOut && (
          <button type="button" onClick={() => (needsOptions(product) ? shell.openProduct(product) : shell.addToCart(product))} className="sf-icon-btn absolute bottom-2 right-2 shadow-md" style={{ background: 'var(--sf-surface)', width: 38, height: 38 }} aria-label={needsOptions(product) ? `Choose options for ${product.title}` : `Add ${product.title} to cart`}>
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">
        <button type="button" onClick={() => shell.openProduct(product)} className="text-left hover:underline">{product.title}</button>
      </h3>
      <Price product={product} size="sm" />
    </article>
  );
}
