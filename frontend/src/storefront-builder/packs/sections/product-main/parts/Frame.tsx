import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCurrentProduct } from '../../../../core/commerce/currentProduct';
import { useStorefront } from '../../../../core/storefront-context';
import type { RenderContext } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { ProductScope } from '../../../../ui/product/ProductScope';
import { StickyBuyBar } from '../../../../ui/product/StickyBuyBar';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';
import type { ProductMainSettings } from '../manifest';

/**
 * Shared wrapper of every product-page layout: the current product's controller,
 * breadcrumbs and the sticky add-to-cart bar. Outside a product page it shows
 * an editor hint (the section only makes sense in the product template).
 */
export function ProductMainFrame({ settings, context, children, contained = true }: {
  settings: ProductMainSettings;
  context: RenderContext;
  children: ReactNode;
  /** false = full-bleed layouts that manage their own width. */
  contained?: boolean;
}) {
  const product = useCurrentProduct();
  const { links } = useStorefront();
  if (!product) return <EditorHint context={context} text="Product details show here on the product page. Add this section to the Product page template." />;

  const crumbs = settings.breadcrumbs && (
    <nav aria-label="Breadcrumb" className={`${contained ? 'mb-5' : 'sf-container py-4'} text-sm sf-muted`}>
      <ol className="flex flex-wrap items-center gap-1">
        <li><SmartLinkAnchor href={links.home()} className="hover:underline">Home</SmartLinkAnchor></li>
        <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
        {product.categoryName ? (
          <li><SmartLinkAnchor href={links.category(product.categoryName)} className="hover:underline">{product.categoryName}</SmartLinkAnchor></li>
        ) : (
          <li><SmartLinkAnchor href={links.allProducts()} className="hover:underline">Products</SmartLinkAnchor></li>
        )}
        <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
        <li aria-current="page" className="line-clamp-1 max-w-[50%]">{product.title}</li>
      </ol>
    </nav>
  );

  return (
    <ProductScope product={product} surface={{ kind: 'page' }} preview={context.mode !== 'live'}>
      <div className={contained ? 'sf-container sf-section-pad' : ''} style={contained ? { paddingTop: '1.5rem' } : undefined}>
        {crumbs}
        {children}
      </div>
      {settings.stickyBar && <StickyBuyBar />}
    </ProductScope>
  );
}
